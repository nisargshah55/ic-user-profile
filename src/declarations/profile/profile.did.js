export const idlFactory = ({ IDL }) => {
  const Details = IDL.Record({
    'age' : IDL.Nat,
    'country' : IDL.Text,
    'imageFile' : IDL.Text,
    'city' : IDL.Text,
    'name' : IDL.Text,
    'surname' : IDL.Text,
    'state' : IDL.Text,
  });
  const Profile = IDL.Record({ 'details' : Details });
  const Chunk = IDL.Record({
    'content' : IDL.Vec(IDL.Nat8),
    'batch_name' : IDL.Text,
  });
  const HeaderField = IDL.Tuple(IDL.Text, IDL.Text);
  const HttpRequest = IDL.Record({
    'url' : IDL.Text,
    'method' : IDL.Text,
    'body' : IDL.Vec(IDL.Nat8),
    'headers' : IDL.Vec(HeaderField),
  });
  const StreamingCallbackToken = IDL.Record({
    'key' : IDL.Text,
    'index' : IDL.Nat,
    'content_encoding' : IDL.Text,
  });
  const StreamingStrategy = IDL.Variant({
    'Callback' : IDL.Record({
      'token' : StreamingCallbackToken,
      'callback' : IDL.Func([], [], []),
    }),
  });
  const HttpResponse = IDL.Record({
    'body' : IDL.Vec(IDL.Nat8),
    'headers' : IDL.Vec(HeaderField),
    'streaming_strategy' : IDL.Opt(StreamingStrategy),
    'status_code' : IDL.Nat16,
  });
  const StreamingCallbackHttpResponse = IDL.Record({
    'token' : IDL.Opt(StreamingCallbackToken),
    'body' : IDL.Vec(IDL.Nat8),
  });
  const ProfileWithId = IDL.Record({ 'id' : IDL.Nat, 'details' : Details });
  const Error = IDL.Variant({
    'NotFound' : IDL.Null,
    'AlreadyExists' : IDL.Null,
  });
  const Result = IDL.Variant({ 'ok' : Profile, 'err' : Error });
  return IDL.Service({
    'commit_batch' : IDL.Func(
        [
          IDL.Record({
            'batch_name' : IDL.Text,
            'content_type' : IDL.Text,
            'chunk_ids' : IDL.Vec(IDL.Nat),
          }),
        ],
        [],
        [],
      ),
    'create' : IDL.Func([Profile], [IDL.Nat], []),
    'create_chunk' : IDL.Func(
        [Chunk],
        [IDL.Record({ 'chunk_id' : IDL.Nat })],
        [],
      ),
    'delete' : IDL.Func([IDL.Nat], [IDL.Bool], []),
    'http_request' : IDL.Func([HttpRequest], [HttpResponse], ['query']),
    'http_request_streaming_callback' : IDL.Func(
        [StreamingCallbackToken],
        [StreamingCallbackHttpResponse],
        ['query'],
      ),
    'listAllProfiles' : IDL.Func([], [IDL.Vec(ProfileWithId)], ['query']),
    'read' : IDL.Func([IDL.Nat], [Result], ['query']),
    'update' : IDL.Func([IDL.Nat, Profile], [IDL.Bool], []),
  });
};
export const init = ({ IDL }) => { return []; };
