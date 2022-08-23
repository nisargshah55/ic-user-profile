import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';

export interface Details {
  'age' : bigint,
  'country' : string,
  'city' : [] | [string],
  'name' : string,
  'surname' : string,
  'state' : [] | [string],
}
export interface Image {
  'data' : Array<number>,
  'fileName' : string,
  'filetype' : string,
}
export interface Profile { 'details' : Details, 'image' : [] | [Image] }
export interface ProfileWithId {
  'id' : bigint,
  'details' : Details,
  'image' : [] | [Image],
}
export interface _SERVICE {
  'create' : ActorMethod<[Profile], boolean>,
  'delete' : ActorMethod<[bigint], boolean>,
  'listAllProfiles' : ActorMethod<[], Array<ProfileWithId>>,
  'read' : ActorMethod<[bigint], [] | [Profile]>,
  'update' : ActorMethod<[bigint, Profile], boolean>,
}
