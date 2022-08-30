import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';

export interface Chunk { 'content' : Array<number>, 'batch_name' : string }
export interface Details {
  'age' : bigint,
  'country' : string,
  'imageFile' : string,
  'city' : string,
  'name' : string,
  'surname' : string,
  'state' : string,
}
export type Error = { 'NotFound' : null } |
  { 'AlreadyExists' : null };
export type HeaderField = [string, string];
export interface HttpRequest {
  'url' : string,
  'method' : string,
  'body' : Array<number>,
  'headers' : Array<HeaderField>,
}
export interface HttpResponse {
  'body' : Array<number>,
  'headers' : Array<HeaderField>,
  'streaming_strategy' : [] | [StreamingStrategy],
  'status_code' : number,
}
export interface Profile { 'details' : Details }
export interface ProfileWithId { 'id' : bigint, 'details' : Details }
export type Result = { 'ok' : Profile } |
  { 'err' : Error };
export interface StreamingCallbackHttpResponse {
  'token' : [] | [StreamingCallbackToken],
  'body' : Array<number>,
}
export interface StreamingCallbackToken {
  'key' : string,
  'index' : bigint,
  'content_encoding' : string,
}
export type StreamingStrategy = {
    'Callback' : {
      'token' : StreamingCallbackToken,
      'callback' : [Principal, string],
    }
  };
export interface _SERVICE {
  'commit_batch' : ActorMethod<
    [
      {
        'batch_name' : string,
        'content_type' : string,
        'chunk_ids' : Array<bigint>,
      },
    ],
    undefined,
  >,
  'create' : ActorMethod<[Profile], bigint>,
  'create_chunk' : ActorMethod<[Chunk], { 'chunk_id' : bigint }>,
  'delete' : ActorMethod<[bigint], boolean>,
  'http_request' : ActorMethod<[HttpRequest], HttpResponse>,
  'http_request_streaming_callback' : ActorMethod<
    [StreamingCallbackToken],
    StreamingCallbackHttpResponse,
  >,
  'listAllProfiles' : ActorMethod<[], Array<ProfileWithId>>,
  'read' : ActorMethod<[bigint], Result>,
  'update' : ActorMethod<[bigint, Profile], boolean>,
}
