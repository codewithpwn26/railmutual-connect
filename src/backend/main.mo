import Array "mo:core/Array";
import Char "mo:core/Char";
import Iter "mo:core/Iter";
import List "mo:core/List";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import Time "mo:core/Time";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Mix in the prefabricated authorization system
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  type Profile = {
    userId : Principal;
    fullName : Text;
    department : Text;
    designation : Text;
    railwayZone : Text;
    division : Text;
    currentPostingLocation : Text;
    desiredPostingLocation : Text;
    contactVisible : Bool;
    email : ?Text;
    phone : ?Text;
    createdAt : Time.Time;
  };

  type SearchFilters = {
    zone : ?Text;
    division : ?Text;
    location : ?Text;
    designation : ?Text;
  };

  type DashboardStats = {
    profileCompletionPercentage : Nat;
    matchCount : Nat;
  };

  type PublicUser = {
    name : Text;
    email : ?Text;
    railwayZone : Text;
    division : Text;
    location : Text;
  };

  let profiles = Map.empty<Principal, Profile>();

  // Levenshtein distance function
  func levenshteinDistanceArray(s : [Char], t : [Char]) : Nat {
    if (s.size() == 0) { return t.size() };
    if (t.size() == 0) { return s.size() };

    let v0 = List.fromArray<Nat>(Array.tabulate<Nat>(t.size() + 1, func(i) { i }));
    let v1 = List.empty<Nat>();

    var i = 0;
    while (i < s.size()) {
      v1.clear();
      v1.add(i + 1);

      var j = 0;
      while (j < t.size()) {
        let cost = if (s[i] == t[j]) { 0 } else { 1 };
        let min1 = Nat.min(
          v1.at(v1.size() - 1),
          v0.at(j + 1),
        );
        let min2 = Nat.min(
          v0.at(j) + cost,
          min1,
        );
        v1.add(min2);
        j += 1;
      };

      v0.clear();
      for (val in v1.values()) { v0.add(val) };
      i += 1;
    };

    v1.at(v1.size() - 1);
  };

  func normalizeText(text : Text) : Text {
    let lowercased = text.toLower();
    let trimmed = lowercased.trim(#char ' ');
    let collapsed = Text.fromIter(
      trimmed.chars().dropWhile(
        func(c) {
          c.toText() == " ";
        }
      )
    );
    collapsed;
  };

  // Masks contact info based on contactVisible setting
  func applyContactVisibility(profile : Profile) : Profile {
    if (profile.contactVisible) {
      profile;
    } else {
      {
        profile with
        email = null;
        phone = null;
      };
    };
  };

  // registerOrLogin: Open to any authenticated (non-anonymous) caller.
  // No longer calls AccessControl.initialize for user role assignment.
  public shared ({ caller }) func registerOrLogin() : async Profile {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Anonymous principals cannot register");
    };

    switch (profiles.get(caller)) {
      case (?profile) {
        profile;
      };
      case (null) {
        let newProfile : Profile = {
          userId = caller;
          fullName = "";
          department = "Indian Railways";
          designation = "";
          railwayZone = "";
          division = "";
          currentPostingLocation = "";
          desiredPostingLocation = "";
          contactVisible = false;
          email = null;
          phone = null;
          createdAt = Time.now();
        };
        profiles.add(caller, newProfile);
        newProfile;
      };
    };
  };

  // getMyProfile: Only authenticated users can fetch their own profile
  public query ({ caller }) func getMyProfile() : async Profile {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view their profile");
    };
    switch (profiles.get(caller)) {
      case (null) { Runtime.trap("Profile not found") };
      case (?profile) { profile };
    };
  };

  // getCallerUserProfile: Required by frontend — returns caller's own profile
  public query ({ caller }) func getCallerUserProfile() : async ?Profile {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view their profile");
    };
    profiles.get(caller);
  };

  // getUserProfile: Caller can view their own profile; admins can view any profile
  public query ({ caller }) func getUserProfile(user : Principal) : async ?Profile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    switch (profiles.get(user)) {
      case (null) { null };
      case (?profile) { ?applyContactVisibility(profile) };
    };
  };

  // saveCallerUserProfile: Required by frontend — saves/updates caller's profile
  public shared ({ caller }) func saveCallerUserProfile(profile : Profile) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    // Ensure the profile's userId matches the caller to prevent spoofing
    let sanitized : Profile = {
      profile with
      userId = caller;
    };
    profiles.add(caller, sanitized);
  };

  // updateProfile: Only authenticated users can update their own profile
  public shared ({ caller }) func updateProfile(
    fullName : Text,
    department : Text,
    designation : Text,
    railwayZone : Text,
    division : Text,
    currentPostingLocation : Text,
    desiredPostingLocation : Text,
    contactVisible : Bool,
    email : ?Text,
    phone : ?Text,
  ) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can update their profile");
    };
    switch (profiles.get(caller)) {
      case (null) { Runtime.trap("Profile not found") };
      case (?existingProfile) {
        let updatedProfile : Profile = {
          existingProfile with
          fullName;
          department;
          designation;
          railwayZone;
          division;
          currentPostingLocation;
          desiredPostingLocation;
          contactVisible;
          email;
          phone;
        };
        profiles.add(caller, updatedProfile);
      };
    };
  };

  // getMatches: Only authenticated users can retrieve their mutual matches
  public query ({ caller }) func getMatches() : async [Profile] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view matches");
    };
    switch (profiles.get(caller)) {
      case (null) { Runtime.trap("Caller profile not found") };
      case (?myProfile) {
        let matchingProfiles = profiles.values().filter(
          func(profile : Profile) : Bool {
            profile.userId != caller and
            profile.currentPostingLocation == myProfile.desiredPostingLocation and
            profile.desiredPostingLocation == myProfile.currentPostingLocation;
          }
        );
        let matchingArray = matchingProfiles.toArray();
        matchingArray.map<Profile, Profile>(applyContactVisibility);
      };
    };
  };

  // Helper function to check if a profile matches the search filters
  func matchesFilters(profile : Profile, filters : SearchFilters, caller : Principal) : Bool {
    if (profile.userId == caller) { return false };

    // Filter by zone (exact match)
    switch (filters.zone) {
      case (null) {};
      case (?zone) {
        if (normalizeText(profile.railwayZone) != normalizeText(zone)) {
          return false;
        };
      };
    };

    // Check if field contains the search term
    func containsAndFuzzy(field : Text, searchTerm : ?Text) : Bool {
      switch (searchTerm) {
        case (null) { true };
        case (?text) {
          let normalizedField = normalizeText(field);
          let normalizedSearch = normalizeText(text);

          // Check for substring match
          if (normalizedField.contains(#text normalizedSearch)) {
            return true;
          };

          // Apply fuzzy matching for Levenshtein distance of 1 or 2
          let distance = levenshteinDistanceArray(normalizedField.toArray(), normalizedSearch.toArray());
          distance <= 2;
        };
      };
    };

    if (not containsAndFuzzy(profile.division, filters.division)) { return false };
    if (not containsAndFuzzy(profile.currentPostingLocation, filters.location)) { return false };
    if (not containsAndFuzzy(profile.designation, filters.designation)) { return false };

    true;
  };

  // searchProfiles: Only authenticated users can search profiles
  public query ({ caller }) func searchProfiles(filters : SearchFilters) : async [Profile] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can search profiles");
    };

    let filteredResults = profiles.values().filter(
      func(profile : Profile) : Bool {
        matchesFilters(profile, filters, caller);
      }
    );

    let filteredArray = filteredResults.toArray();
    filteredArray.map<Profile, Profile>(applyContactVisibility);
  };

  // getDashboardStats: Only authenticated users can view their dashboard stats
  public query ({ caller }) func getDashboardStats() : async DashboardStats {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view dashboard stats");
    };
    switch (profiles.get(caller)) {
      case (null) { Runtime.trap("Profile not found") };
      case (?myProfile) {
        let totalFields = 8;
        var filledFields = 0;

        if (myProfile.fullName != "") { filledFields += 1 };
        if (myProfile.designation != "") { filledFields += 1 };
        if (myProfile.railwayZone != "") { filledFields += 1 };
        if (myProfile.division != "") { filledFields += 1 };
        if (myProfile.currentPostingLocation != "") { filledFields += 1 };
        if (myProfile.desiredPostingLocation != "") { filledFields += 1 };
        if (myProfile.email != null) { filledFields += 1 };
        if (myProfile.phone != null) { filledFields += 1 };

        let profileCompletionPercentage = (filledFields * 100) / totalFields;

        let matches = profiles.values().filter(
          func(profile : Profile) : Bool {
            profile.userId != caller and
            profile.currentPostingLocation == myProfile.desiredPostingLocation and
            profile.desiredPostingLocation == myProfile.currentPostingLocation;
          }
        );

        {
          profileCompletionPercentage;
          matchCount = matches.size();
        };
      };
    };
  };

  // getAllUsers: Returns a list of all registered user profiles in a public format.
  // Only authenticated users (and admins) can call this.
  // Respects each user's contactVisible setting — email is only included if the
  // profile owner has opted in to contact visibility.
  public query ({ caller }) func getAllUsers() : async [PublicUser] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users and admins can view all users");
    };

    profiles.values().map(
      func(profile : Profile) : PublicUser {
        let visibleProfile = applyContactVisibility(profile);
        {
          name = visibleProfile.fullName;
          email = visibleProfile.email;
          railwayZone = visibleProfile.railwayZone;
          division = visibleProfile.division;
          location = visibleProfile.currentPostingLocation;
        };
      }
    ).toArray();
  };
};
