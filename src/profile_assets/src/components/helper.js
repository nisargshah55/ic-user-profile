export const fromOptional = (optional) => {
  return optional.length > 0 ? optional[0] : null;
}

export const toOptional = (object) => {
  return object ? [object] : [];
}

export const fromNullable = (value) => {
  return value?.[0];
}