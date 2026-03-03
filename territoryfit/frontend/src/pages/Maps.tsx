import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useUpdateLocation, useGetAllUserLocations } from '../hooks/useQueries';
import { MapPin, Navigation, RefreshCw, AlertCircle, Lock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Leaflet types (loaded via CDN)
declare global {
  interface Window {
    L: any;
  }
}

interface UserLocationMarker {
  principal: string;
  latitude: number;
  longitude: number;
  timestamp: bigint;
}

// Color palette for different users
const USER_COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e',
  '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899',
  '#14b8a6', '#f59e0b',
];

function getUserColor(principal: string, index: number): string {
  // Use a hash of the principal for consistent color assignment
  let hash = 0;
  for (let i = 0; i < principal.length; i++) {
    hash = (hash * 31 + principal.charCodeAt(i)) & 0xffffffff;
  }
  return USER_COLORS[Math.abs(hash) % USER_COLORS.length];
}

function createColoredMarkerIcon(L: any, color: string, isCurrentUser: boolean): any {
  const size = isCurrentUser ? 32 : 26;
  const border = isCurrentUser ? 3 : 2;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size + 8}" viewBox="0 0 ${size} ${size + 8}">
      <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - border}" fill="${color}" stroke="${isCurrentUser ? '#ffffff' : '#1a1a1a'}" stroke-width="${border}"/>
      ${isCurrentUser ? `<circle cx="${size / 2}" cy="${size / 2}" r="${size / 4}" fill="white" opacity="0.9"/>` : ''}
      <line x1="${size / 2}" y1="${size - border}" x2="${size / 2}" y2="${size + 8}" stroke="${color}" stroke-width="2"/>
    </svg>
  `;
  return L.divIcon({
    html: svg,
    className: '',
    iconSize: [size, size + 8],
    iconAnchor: [size / 2, size + 8],
    popupAnchor: [0, -(size + 8)],
  });
}

function loadLeaflet(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.L) {
      resolve();
      return;
    }

    // Load CSS
    const existingLink = document.getElementById('leaflet-css');
    if (!existingLink) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    // Load JS
    const existingScript = document.getElementById('leaflet-js');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve());
      return;
    }

    const script = document.createElement('script');
    script.id = 'leaflet-js';
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Leaflet'));
    document.head.appendChild(script);
  });
}

export function MapsPage() {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const currentPrincipal = identity?.getPrincipal().toString();

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<Map<string, any>>(new Map());
  const currentUserMarkerRef = useRef<any>(null);
  const locationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const [leafletError, setLeafletError] = useState<string | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [currentPosition, setCurrentPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [locationPermission, setLocationPermission] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [isTrackingActive, setIsTrackingActive] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const updateLocationMutation = useUpdateLocation();
  const { data: allLocations, refetch: refetchLocations } = useGetAllUserLocations();

  // Load Leaflet from CDN
  useEffect(() => {
    loadLeaflet()
      .then(() => setLeafletLoaded(true))
      .catch((err) => setLeafletError(err.message));
  }, []);

  // Initialize map once Leaflet is loaded and user is authenticated
  useEffect(() => {
    if (!leafletLoaded || !isAuthenticated || !mapContainerRef.current) return;
    if (mapInstanceRef.current) return; // Already initialized

    const L = window.L;

    // Fix default icon paths for CDN-loaded Leaflet
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });

    const map = L.map(mapContainerRef.current, {
      center: [20, 0],
      zoom: 2,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [leafletLoaded, isAuthenticated]);

  // Update other users' markers on the map
  useEffect(() => {
    if (!mapInstanceRef.current || !leafletLoaded || !allLocations) return;
    const L = window.L;
    const map = mapInstanceRef.current;

    const seenPrincipals = new Set<string>();

    allLocations.forEach((loc: UserLocationMarker, index: number) => {
      if (loc.principal === currentPrincipal) return; // Skip current user (handled separately)
      seenPrincipals.add(loc.principal);

      const color = getUserColor(loc.principal, index);
      const icon = createColoredMarkerIcon(L, color, false);
      const shortId = loc.principal.slice(0, 8) + '...';
      const timeAgo = getTimeAgo(Number(loc.timestamp) / 1_000_000);

      if (markersRef.current.has(loc.principal)) {
        const marker = markersRef.current.get(loc.principal);
        marker.setLatLng([loc.latitude, loc.longitude]);
        marker.setIcon(icon);
        marker.getPopup()?.setContent(buildPopupContent(shortId, loc.principal, color, timeAgo, false));
      } else {
        const marker = L.marker([loc.latitude, loc.longitude], { icon })
          .addTo(map)
          .bindPopup(buildPopupContent(shortId, loc.principal, color, timeAgo, false));
        markersRef.current.set(loc.principal, marker);
      }
    });

    // Remove markers for users no longer in the list
    markersRef.current.forEach((marker, principal) => {
      if (!seenPrincipals.has(principal)) {
        map.removeLayer(marker);
        markersRef.current.delete(principal);
      }
    });
  }, [allLocations, leafletLoaded, currentPrincipal]);

  // Update current user marker
  useEffect(() => {
    if (!mapInstanceRef.current || !leafletLoaded || !currentPosition || !currentPrincipal) return;
    const L = window.L;
    const map = mapInstanceRef.current;

    const color = '#00ff88';
    const icon = createColoredMarkerIcon(L, color, true);
    const shortId = 'You (' + currentPrincipal.slice(0, 8) + '...)';

    if (currentUserMarkerRef.current) {
      currentUserMarkerRef.current.setLatLng([currentPosition.lat, currentPosition.lng]);
      currentUserMarkerRef.current.setIcon(icon);
    } else {
      const marker = L.marker([currentPosition.lat, currentPosition.lng], { icon })
        .addTo(map)
        .bindPopup(buildPopupContent(shortId, currentPrincipal, color, 'Just now', true));
      currentUserMarkerRef.current = marker;
    }
  }, [currentPosition, leafletLoaded, currentPrincipal]);

  const buildPopupContent = (
    shortId: string,
    principal: string,
    color: string,
    timeAgo: string,
    isCurrentUser: boolean
  ): string => {
    return `
      <div style="font-family: 'Space Grotesk', sans-serif; min-width: 160px;">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
          <div style="width: 12px; height: 12px; border-radius: 50%; background: ${color}; flex-shrink: 0;"></div>
          <strong style="font-size: 13px; color: #1a1a1a;">${isCurrentUser ? '📍 You' : '👤 User'}</strong>
        </div>
        <div style="font-size: 11px; color: #555; word-break: break-all; margin-bottom: 4px;">${shortId}</div>
        <div style="font-size: 11px; color: #888;">🕐 ${timeAgo}</div>
      </div>
    `;
  };

  const getTimeAgo = (timestampMs: number): string => {
    const diff = Date.now() - timestampMs;
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  };

  const sendLocationToBackend = useCallback(
    async (lat: number, lng: number) => {
      try {
        await updateLocationMutation.mutateAsync({ lat, lng });
        setLastUpdated(new Date());
        refetchLocations();
      } catch (err) {
        // Silent fail for background updates
      }
    },
    [updateLocationMutation, refetchLocations]
  );

  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      return;
    }

    setGeoError(null);

    const getPosition = () => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setCurrentPosition({ lat: latitude, lng: longitude });
          setLocationPermission('granted');
          setIsTrackingActive(true);

          // Center map on user's location on first fix
          if (mapInstanceRef.current && !currentPosition) {
            mapInstanceRef.current.setView([latitude, longitude], 14);
          }

          sendLocationToBackend(latitude, longitude);
        },
        (err) => {
          if (err.code === err.PERMISSION_DENIED) {
            setLocationPermission('denied');
            setGeoError('Location permission denied. Please allow location access in your browser settings.');
          } else if (err.code === err.POSITION_UNAVAILABLE) {
            setGeoError('Location information is unavailable. Please try again.');
          } else {
            setGeoError('Unable to retrieve your location. Please try again.');
          }
          setIsTrackingActive(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
      );
    };

    getPosition();

    // Poll every 30 seconds
    if (locationIntervalRef.current) clearInterval(locationIntervalRef.current);
    locationIntervalRef.current = setInterval(getPosition, 30000);
  }, [sendLocationToBackend, currentPosition]);

  const stopTracking = useCallback(() => {
    if (locationIntervalRef.current) {
      clearInterval(locationIntervalRef.current);
      locationIntervalRef.current = null;
    }
    setIsTrackingActive(false);
  }, []);

  const centerOnUser = useCallback(() => {
    if (currentPosition && mapInstanceRef.current) {
      mapInstanceRef.current.setView([currentPosition.lat, currentPosition.lng], 15);
    }
  }, [currentPosition]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (locationIntervalRef.current) {
        clearInterval(locationIntervalRef.current);
      }
    };
  }, []);

  // ── Unauthenticated state ──────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-4">
        <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
          <Lock className="w-8 h-8 text-muted-foreground" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground mb-2">Login Required</h2>
          <p className="text-muted-foreground text-sm max-w-xs">
            Please log in to access the live location map and share your position with other users.
          </p>
        </div>
      </div>
    );
  }

  // ── Leaflet load error ─────────────────────────────────────────────────────
  if (leafletError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
        <AlertCircle className="w-12 h-12 text-destructive" />
        <div>
          <h2 className="text-xl font-bold text-foreground mb-2">Map Failed to Load</h2>
          <p className="text-muted-foreground text-sm">{leafletError}</p>
          <p className="text-muted-foreground text-xs mt-1">Check your internet connection and try refreshing.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Live Map</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Real-time location tracking</p>
        </div>
        <div className="flex items-center gap-2">
          {isTrackingActive && (
            <Badge variant="outline" className="text-xs border-green-500/50 text-green-400 gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block" />
              Live
            </Badge>
          )}
          <Button
            variant="outline"
            size="icon"
            onClick={() => refetchLocations()}
            className="w-8 h-8"
            title="Refresh locations"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-2">
        {!isTrackingActive ? (
          <Button
            onClick={startTracking}
            size="sm"
            className="gap-2"
            disabled={!leafletLoaded}
          >
            {!leafletLoaded ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Navigation className="w-4 h-4" />
            )}
            {!leafletLoaded ? 'Loading Map...' : 'Start Tracking'}
          </Button>
        ) : (
          <Button
            onClick={stopTracking}
            size="sm"
            variant="outline"
            className="gap-2 border-destructive/50 text-destructive hover:bg-destructive/10"
          >
            <Navigation className="w-4 h-4" />
            Stop Tracking
          </Button>
        )}

        {currentPosition && (
          <Button
            onClick={centerOnUser}
            size="sm"
            variant="outline"
            className="gap-2"
          >
            <MapPin className="w-4 h-4" />
            My Location
          </Button>
        )}
      </div>

      {/* Error messages */}
      {geoError && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{geoError}</span>
        </div>
      )}

      {/* Status info */}
      {currentPosition && (
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground font-mono">
          <span>📍 {currentPosition.lat.toFixed(5)}, {currentPosition.lng.toFixed(5)}</span>
          {lastUpdated && (
            <span>🔄 Updated {lastUpdated.toLocaleTimeString()}</span>
          )}
          {allLocations && allLocations.length > 0 && (
            <span>👥 {allLocations.length} user{allLocations.length !== 1 ? 's' : ''} on map</span>
          )}
        </div>
      )}

      {/* Map Container */}
      <div className="relative rounded-xl overflow-hidden border border-border" style={{ height: '520px' }}>
        {!leafletLoaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-card z-10 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Loading map...</p>
          </div>
        )}
        <div ref={mapContainerRef} className="w-full h-full" />
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground p-3 rounded-lg bg-card border border-border">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#00ff88] border border-border" />
          <span>Your location</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#3b82f6] border border-border" />
          <span>Other users</span>
        </div>
        <div className="flex items-center gap-1.5 ml-auto">
          <span>Updates every 30s</span>
        </div>
      </div>

      {/* Instructions */}
      {!isTrackingActive && !currentPosition && (
        <div className="p-4 rounded-lg bg-secondary/50 border border-border text-sm text-muted-foreground">
          <p className="font-medium text-foreground mb-1">How to use</p>
          <ul className="space-y-1 text-xs list-disc list-inside">
            <li>Click <strong>Start Tracking</strong> to share your location</li>
            <li>Your position updates every 30 seconds automatically</li>
            <li>See other active users as colored markers on the map</li>
            <li>Click any marker to see user details</li>
          </ul>
        </div>
      )}
    </div>
  );
}
