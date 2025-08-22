declare module 'legacy-encoding' {
  interface LegacyEncoding {
    decode(buffer: Buffer, encoding: string): Buffer;
    encode(text: string, encoding: string): Buffer;
  }

  const legacy: LegacyEncoding;
  export default legacy;
}
