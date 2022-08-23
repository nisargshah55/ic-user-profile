import Nat "mo:base/Nat";
import Text "mo:base/Text";
import Trie "mo:base/Trie";
import Hash "mo:base/Hash";
import print "mo:base/Debug";

actor Profile {
  type Details = {
    name: Text;
    surname: Text;
    age: Nat;
    city: ?Text;
    state: ?Text;
    country: Text;
  }; 
   
  type Profile = {
    details: Details;
    image: ?Image;
  };

   type ProfileWithId = {
    id: Nat;
    details: Details;
    image: ?Image;
  };

  type Image = {
    fileName: Text;
    data: Blob;
    filetype: Text;
  };

  stable var profiles: Trie.Trie<Nat, Profile> = Trie.empty();

  stable var startIndex: Nat = 1;

  // Create User Profile
  public func create(profile: Profile): async Bool {
    let profileId = startIndex;

    let (updatedProfiles, existingProfileValue) = Trie.put(      
      profiles,
      key(profileId),
      Nat.equal,
      profile
    );

    switch(existingProfileValue) {
      case (null) {
        profiles := updatedProfiles;
      };
        
      case (existingProfileValue) {
        return false;
      };
       
    };

    startIndex := startIndex + 1;
    return true;
  };

// List all profiles
  public query func listAllProfiles () : async [ProfileWithId] {
    let profileList =  Trie.toArray(profiles, transform) ;
    return profileList;
  }; 

  private func transform(id:Nat, profile:Profile): ProfileWithId{
    let newProfileId : ProfileWithId = {
        id = id; 

        details = {
          name = profile.details.name ;
          surname = profile.details.surname ;
          age = profile.details.age ;
          city = profile.details.city ;
          state = profile.details.state ;
          country = profile.details.country ;
        };
        
        image = null;
    };
    return newProfileId;
  };

// Read profile
  public query func read (profileId : Nat) : async ?Profile {
    let result = Trie.find(
        profiles,           
        key(profileId),      
        Nat.equal     
    );
    return result;
  };

  // Update User Profile
  public func update(profileId : Nat, profile: Profile): async Bool {
    let existingProfileValue = Trie.find(
      profiles,          
      key(profileId),     
      Nat.equal           
    );

    switch(existingProfileValue) {
      case (null) {
        return false;
      };
        
      case (existingProfileValue) {
        let (updatedProfiles, existingProfileValue) =  Trie.replace(
            profiles,
            key(profileId),
            Nat.equal,
            ?profile
        );
        
        profiles := updatedProfiles;
      }
    };

    return true;
  };


  // Delete User Profile
  public func delete(profileId : Nat): async Bool {
    let existingProfileValue = Trie.find(
      profiles,          
      key(profileId),     
      Nat.equal           
    );

    switch(existingProfileValue) {
      case (null) {
        return false;
      };
        
      case (existingProfileValue) {
        let (updatedProfiles, existingProfileValue) =  Trie.remove(
            profiles,
            key(profileId),
            Nat.equal
        );
        
        profiles := updatedProfiles;
      }
    };

    return true;
  };

  private func key(x : Nat) : Trie.Key<Nat> {
    return { 
      key = x; 
      hash = Hash.hash(x) 
    }
  };
};

  