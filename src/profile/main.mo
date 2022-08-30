import Array "mo:base/Array";
import Debug "mo:base/Debug";
import Error "mo:base/Error";
import Hash "mo:base/Hash";
import HashMap "mo:base/HashMap";
import Int8 "mo:base/Int8";
import Nat "mo:base/Nat";
import Profile "mo:base/Bool";
import Result "mo:base/Result";
import Text "mo:base/Text";
import Time "mo:base/Time";
import Trie "mo:base/Trie";
import Types "./types";
import Iter "mo:base/Iter";
import Principal "mo:base/Principal";
import Blob "mo:base/Blob";
import List "mo:base/List";

actor UserProfile {
  type Details = {
    name: Text;
    surname: Text;
    age: Nat;
    city: Text;
    state: Text;
    country: Text;    
    imageFile: Text;
  }; 
   
  type Profile = {
    details: Details;
  };

   type ProfileWithId = {
    id: Nat;
    details: Details;
  };

  type Image = {
    fileName: Text;
    data: Blob;
    filetype: Text;
  };

  type Error = {
    #NotFound;
    #AlreadyExists;
  };
    
  stable var profiles: Trie.Trie<Nat, Profile> = Trie.empty();

  stable var startIndex: Nat = 1;

  private var nextChunkID: Nat = 0;

    private let chunks: HashMap.HashMap<Nat, Types.Chunk> =
       HashMap.HashMap<Nat, Types.Chunk>(0, Nat.equal, Hash.hash);

    private let assets: HashMap.HashMap<Text, Types.Asset> =
      HashMap.HashMap<Text, Types.Asset>(0, Text.equal, Text.hash);


  // Create User Profile

  public func create(profile: Profile): async Nat {

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
        return 0;
      };
       
    };

    startIndex := startIndex + 1;
    return profileId;
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
          age = profile.details.age;
          city = profile.details.city;
          state = profile.details.state;
          country = profile.details.country ;
          imageFile = profile.details.imageFile;
        };
        
    };
    return newProfileId;
  };

// Read profile
  public query func read (profileId : Nat) : async Result.Result<Profile, Error> {
    let result = Trie.find(
        profiles,           
        key(profileId),      
        Nat.equal     
    );
    return Result.fromOption(result, #NotFound);
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

  // Create multiple chunks if file size is greater than 500kb
   public shared({caller}) func create_chunk(chunk: Types.Chunk) : async {
        chunk_id : Nat
    } {
        nextChunkID := nextChunkID + 1;
        chunks.put(nextChunkID, chunk);

        return {chunk_id = nextChunkID};
    };


  // concatenates the file chunks, and adds the content to the assets HashMap
    public shared({caller}) func commit_batch(
        {batch_name: Text; chunk_ids: [Nat]; content_type: Text} : {
            batch_name: Text;
            content_type: Text;
            chunk_ids: [Nat];            
        },
    ) : async () {
         var content_chunks : [[Nat8]] = [];

         for (chunk_id in chunk_ids.vals()) {
            let chunk: ?Types.Chunk = chunks.get(chunk_id);

            switch (chunk) {
                case (?{content}) {
                    content_chunks := Array.append<[Nat8]>(content_chunks, [content]);
                };
                case null {
                };
            };
         };

         if (content_chunks.size() > 0) {
            var total_length = 0;
            for (chunk in content_chunks.vals()) total_length += chunk.size();

            assets.put(Text.concat("/assets/", batch_name), {
                content_type = content_type;
                encoding = {
                    modified  = Time.now();
                    content_chunks;
                    certified = false;
                    total_length
                };
            });
         };
    };


    // Handle Get request to get uploaded images
    public shared query({caller}) func http_request(
        request : Types.HttpRequest,
    ) : async Types.HttpResponse {

        if (request.method == "GET") {
            let split: Iter.Iter<Text> = Text.split(request.url, #char '?');
            let key: Text = Iter.toArray(split)[0];

            let asset: ?Types.Asset = assets.get(key);

            switch (asset) {
                case (?{content_type: Text; encoding: Types.AssetEncoding;}) {
                    return {
                        body = encoding.content_chunks[0];
                        headers = [ ("Content-Type", content_type),
                                    ("accept-ranges", "bytes"),
                                    ("cache-control", "private, max-age=0") ];
                        status_code = 200;
                        streaming_strategy = create_strategy(
                            key, 0, {content_type; encoding;}, encoding,
                        );
                    };
                };
                case null {
                };
            };
        };

        return {
            body = Blob.toArray(Text.encodeUtf8("Permission denied. Could not perform this operation"));
            headers = [];
            status_code = 403;
            streaming_strategy = null;
        };
    };


    // handle file chunks if there are file chunks left to process
    private func create_strategy(
        key : Text,
        index  : Nat,
        asset : Types.Asset,
        encoding : Types.AssetEncoding,
    ) : ?Types.StreamingStrategy {
        switch (create_token(key, index, encoding)) {
            case (null) { null };
            case (? token) {
                let self: Principal = Principal.fromActor(UserProfile);
                let canisterId: Text = Principal.toText(self);
                let canister = actor (canisterId) : actor { http_request_streaming_callback : shared () -> async () };

                return ?#Callback({
                    token;
                    callback = canister.http_request_streaming_callback;
                });
            };
        };
    };

    // returns the current file chunk, where the index of the chunk is determined by the token
    public shared query({caller}) func http_request_streaming_callback(
        st : Types.StreamingCallbackToken,
    ) : async Types.StreamingCallbackHttpResponse {

        switch (assets.get(st.key)) {
            case (null) throw Error.reject("key not found: " # st.key);
            case (? asset) {
                return {
                    token = create_token(
                        st.key,
                        st.index,
                        asset.encoding,
                    );
                    body = asset.encoding.content_chunks[st.index];
                };
            };
        };
    };

    // checks if there are remaining file chunks and returns a new token if there is
    private func create_token(
        key : Text,
        chunk_index : Nat,
        encoding : Types.AssetEncoding
    ) : ?Types.StreamingCallbackToken {

        if (chunk_index + 1 >= encoding.content_chunks.size()) {
            null;
        } else {
            ?{
                key;
                index = chunk_index + 1;
                content_encoding = "gzip";
            };
        };
    };
};

  