import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Nat "mo:core/Nat";

module {
  // Type for location data
  type Location = {
    latitude : Float;
    longitude : Float;
    timestamp : Time.Time;
  };

  // Type for the old actor state
  type OldActor = {
    // All previous actor state fields to persist data on upgrade
    fitnessProfiles : Map.Map<Principal, { fullName : Text; age : Nat; gender : Text; heightCm : Nat; weightKg : Nat; primaryGoal : Text }>;
    workoutSessions : Map.Map<Principal, [{ activityType : Text; durationSeconds : Nat; distanceKm : Nat; caloriesBurned : Nat; timestamp : Time.Time; zone : ?Text }]>;
    territoryZones : Map.Map<Text, { currentOwner : Principal; passCounts : Map.Map<Principal, Nat> }>;
    zoneNames : [Text];
    stripeConfig : ?{ secretKey : Text; allowedCountries : [Text] };
  };

  // Type for the new actor state
  type NewActor = {
    // All previous actor state fields plus the new userLocations field
    fitnessProfiles : Map.Map<Principal, { fullName : Text; age : Nat; gender : Text; heightCm : Nat; weightKg : Nat; primaryGoal : Text }>;
    workoutSessions : Map.Map<Principal, [{ activityType : Text; durationSeconds : Nat; distanceKm : Nat; caloriesBurned : Nat; timestamp : Time.Time; zone : ?Text }]>;
    territoryZones : Map.Map<Text, { currentOwner : Principal; passCounts : Map.Map<Principal, Nat> }>;
    zoneNames : [Text];
    stripeConfig : ?{ secretKey : Text; allowedCountries : [Text] };
    userLocations : Map.Map<Principal, Location>;
  };

  // Migration function to run on upgrade
  public func run(old : OldActor) : NewActor {
    // Carry over all existing fields and initialize userLocations as empty map
    {
      old with
      userLocations = Map.empty<Principal, Location>()
    };
  };
};
