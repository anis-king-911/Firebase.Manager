function CreateArrayByLength(n) {
  return Array.from({ length: n }, (_, index) => index + 1);
}

function GenerateUUID(V = 1) {
  const VN = CreateArrayByLength(V);
  return `xxxxxxxx-${VN.map(i=>`xxxx-`).join('')}4xxx-yxxx-xxxxxxxxxxxx`
    .replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0;
      const v = c == 'x' ? r : (r & 0x3 | 0x8);

      return v.toString(16);
    });
}

export { CreateArrayByLength };
export default GenerateUUID;