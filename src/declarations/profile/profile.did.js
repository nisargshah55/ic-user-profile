export const idlFactory = ({ IDL }) => {
  const Details = IDL.Record({
    'age' : IDL.Nat,
    'country' : IDL.Text,
    'city' : IDL.Opt(IDL.Text),
    'name' : IDL.Text,
    'surname' : IDL.Text,
    'state' : IDL.Opt(IDL.Text),
  });
  const Image = IDL.Record({
    'data' : IDL.Vec(IDL.Nat8),
    'fileName' : IDL.Text,
    'filetype' : IDL.Text,
  });
  const Profile = IDL.Record({ 'details' : Details, 'image' : IDL.Opt(Image) });
  const ProfileWithId = IDL.Record({
    'id' : IDL.Nat,
    'details' : Details,
    'image' : IDL.Opt(Image),
  });
  return IDL.Service({
    'create' : IDL.Func([Profile], [IDL.Bool], []),
    'delete' : IDL.Func([IDL.Nat], [IDL.Bool], []),
    'listAllProfiles' : IDL.Func([], [IDL.Vec(ProfileWithId)], ['query']),
    'read' : IDL.Func([IDL.Nat], [IDL.Opt(Profile)], ['query']),
    'update' : IDL.Func([IDL.Nat, Profile], [IDL.Bool], []),
  });
};
export const init = ({ IDL }) => { return []; };
