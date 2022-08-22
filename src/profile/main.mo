import Nat "mo:base/Nat";
import Text "mo:base/Text";
import Trie "mo:base/Trie";
import Hash "mo:base/Hash";

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
    public query func listAllProfiles () : async ?[Profile] {
        return profiles;
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

  private func key(x : Nat) : Trie.Key<Nat> {
    return { 
      key = x; 
      hash = Hash.hash(x) 
    }
  };
};

  