import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import Time "mo:core/Time";
import OutCall "http-outcalls/outcall";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import Stripe "stripe/stripe";
import AccessControl "authorization/access-control";
import Runtime "mo:core/Runtime";

actor {
  // Authorization state
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Stripe configuration
  var stripeConfig : ?Stripe.StripeConfiguration = null;

  // User Data Types and State
  public type FitnessProfile = {
    fullName : Text;
    age : Nat;
    gender : Text;
    heightCm : Nat;
    weightKg : Nat;
    primaryGoal : Text;
  };

  public type WorkoutSession = {
    activityType : Text;
    durationSeconds : Nat;
    distanceKm : Nat;
    caloriesBurned : Nat;
    timestamp : Time.Time;
    zone : ?Text;
  };

  public type AnalyticsSummary = {
    totalDistanceKm : Nat;
    totalCaloriesBurned : Nat;
    totalWorkouts : Nat;
    avgPace : Nat;
  };

  public type TerritoryZone = {
    currentOwner : Principal;
    passCounts : Map.Map<Principal, Nat>;
  };

  public type PublicTerritoryZone = {
    currentOwner : Principal;
    passCounts : [(Principal, Nat)];
  };

  let fitnessProfiles = Map.empty<Principal, FitnessProfile>();
  let workoutSessions = Map.empty<Principal, [WorkoutSession]>();
  let territoryZones = Map.empty<Text, TerritoryZone>();
  let zoneNames = ["central-park", "beach-boulevard", "mountain-trail", "riverside-route"];

  // Persistent stripe configuration (admin only)
  public query ({ caller }) func isStripeConfigured() : async Bool {
    stripeConfig != null;
  };

  public func getStripeConfigForRuntime(_transform : OutCall.Transform) : async (Stripe.StripeConfiguration, OutCall.Transform) {
    switch (stripeConfig) {
      case (null) { Runtime.trap("No admin-established Stripe configuration") };
      case (?config) { (config, _transform) };
    };
  };

  /// Admin-only function to initialize Stripe configuration (SaaS platform use only)
  public shared ({ caller }) func setStripeConfiguration(config : Stripe.StripeConfiguration) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can set the Stripe configuration");
    };
    stripeConfig := ?config;
  };

  public func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    switch (stripeConfig) {
      case (null) { Runtime.trap("Stripe configuration required") };
      case (?config) { await Stripe.getSessionStatus(config, sessionId, transform) };
    };
  };

  public query ({ caller }) func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  // User Management
  public shared ({ caller }) func registerFitnessProfile(profile : FitnessProfile) : async () {
    fitnessProfiles.add(caller, profile);
  };

  public query ({ caller }) func getFitnessProfile() : async ?FitnessProfile {
    fitnessProfiles.get(caller);
  };

  // Workout Tracking
  public shared ({ caller }) func recordWorkoutSession(session : WorkoutSession) : async () {
    let sessions = switch (workoutSessions.get(caller)) {
      case (null) { [] };
      case (?existing) { existing };
    };
    workoutSessions.add(caller, sessions.concat([session]));
    updateTerritoryZone(session.zone, caller);
  };

  public query ({ caller }) func getWorkoutSessions(user : Principal) : async [WorkoutSession] {
    switch (workoutSessions.get(user)) {
      case (null) { [] };
      case (?sessions) { sessions };
    };
  };

  // Analytics
  public query ({ caller }) func getAnalyticsSummary(user : Principal) : async AnalyticsSummary {
    let sessions = switch (workoutSessions.get(user)) {
      case (null) { [] };
      case (?array) { array };
    };

    var totalDistance = 0;
    var totalCalories = 0;
    var totalDuration = 0;

    for (session in sessions.values()) {
      totalDistance += session.distanceKm;
      totalCalories += session.caloriesBurned;
      totalDuration += session.durationSeconds;
    };

    let avgPace = if (totalDistance > 0) {
      totalDuration / totalDistance;
    } else { 0 };

    {
      totalDistanceKm = totalDistance;
      totalCaloriesBurned = totalCalories;
      totalWorkouts = sessions.size();
      avgPace;
    };
  };

  // Territory System
  func updateTerritoryZone(zone : ?Text, user : Principal) {
    switch (zone) {
      case (null) {};
      case (?zoneName) {
        let zoneData = switch (territoryZones.get(zoneName)) {
          case (null) {
            {
              currentOwner = user;
              passCounts = Map.empty<Principal, Nat>();
            };
          };
          case (?existing) {
            let currentCount = switch (existing.passCounts.get(user)) {
              case (null) { 0 };
              case (?count) { count };
            };
            existing.passCounts.add(user, currentCount + 1);

            let ownerCount = switch (existing.passCounts.get(user)) {
              case (null) { 0 };
              case (?count) { count };
            };
            if (currentCount + 1 > ownerCount) {
              {
                currentOwner = user;
                passCounts = existing.passCounts;
              };
            } else {
              existing;
            };
          };
        };
        territoryZones.add(zoneName, zoneData);
      };
    };
  };

  // List Zones
  public query ({ caller }) func listZones() : async [Text] {
    zoneNames;
  };

  // Create Stripe Checkout Session
  public shared ({ caller }) func createCheckoutSession(items : [Stripe.ShoppingItem], successUrl : Text, cancelUrl : Text) : async Text {
    switch (stripeConfig) {
      case (null) { Runtime.trap("Stripe configuration required") };
      case (?config) {
        await Stripe.createCheckoutSession(config, caller, items, successUrl, cancelUrl, transform);
      };
    };
  };

  // Query Zone Ownership
  public query ({ caller }) func getZoneOwnership(zone : Text) : async ?Principal {
    switch (territoryZones.get(zone)) {
      case (null) { null };
      case (?data) { ?data.currentOwner };
    };
  };

  // Get User Owned Zones
  public query ({ caller }) func getUserOwnedZones(user : Principal) : async Nat {
    var count = 0;
    for (zoneData in territoryZones.values()) {
      if (zoneData.currentOwner == user) { count += 1 };
    };
    count;
  };

  // Create Territory Getters
  public query ({ caller }) func getAllTerritoryZones() : async [(Text, PublicTerritoryZone)] {
    territoryZones.entries().toArray().map(
      func((zone, data)) {
        (
          zone,
          {
            currentOwner = data.currentOwner;
            passCounts = data.passCounts.entries().toArray();
          },
        );
      }
    );
  };

  public query ({ caller }) func getZonePassCounts(zone : Text) : async [(Principal, Nat)] {
    switch (territoryZones.get(zone)) {
      case (null) { [] };
      case (?data) { data.passCounts.entries().toArray() };
    };
  };

  // Calculate Total User Stats (distance/calories)
  public query ({ caller }) func getTotalUserStats(user : Principal) : async ?{ distance : Nat; calories : Nat } {
    switch (workoutSessions.get(user)) {
      case (null) { null };
      case (?sessions) {
        var totalDistance = 0;
        var totalCalories = 0;

        for (session in sessions.values()) {
          totalDistance += session.distanceKm;
          totalCalories += session.caloriesBurned;
        };
        ?{
          distance = totalDistance;
          calories = totalCalories;
        };
      };
    };
  };
};
