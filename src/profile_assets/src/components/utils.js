export const convertToBase64 = (blob) => {
  return new Promise((resolve, reject) => {
    var reader = new FileReader();
    reader.onload = function () {
      resolve(reader.result);
    };
    reader.readAsDataURL(blob);
  });
};