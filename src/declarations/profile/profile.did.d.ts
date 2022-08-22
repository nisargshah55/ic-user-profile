import type { Principal } from '@dfinity/principal';
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
export interface _SERVICE {
  'create' : (arg_0: Profile) => Promise<boolean>,
  'read' : (arg_0: bigint) => Promise<[] | [Profile]>,
}
