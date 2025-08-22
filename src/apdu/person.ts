/**
 * APDU Commands for Thai National ID Card Personal Information
 *
 * Contains all Application Protocol Data Unit (APDU) commands required
 * to read personal information from Thai National ID Cards.
 *
 * APDU Structure: [CLA, INS, P1, P2, Le] or [CLA, INS, P1, P2, Lc, Data..., Le]
 * - CLA: Class byte (0x80 for most Thai ID operations)
 * - INS: Instruction byte (0xb0 for READ BINARY)
 * - P1, P2: Parameter bytes (address offset)
 * - Le: Expected length of response
 */

/**
 * Personal Information APDU Commands
 */
export const apduPerson = {
  // #region Card Selection and Initialization

  /** SELECT command to activate the applet */
  SELECT: [0x00, 0xa4, 0x04, 0x00, 0x08],

  /** Thai National ID Card application identifier */
  THAI_CARD: [0xa0, 0x00, 0x00, 0x00, 0x54, 0x48, 0x00, 0x01],

  // #endregion

  // #region Basic Personal Information

  /**
   * Read Citizen ID (13 digits)
   * Address: 0x0004, Length: 13 bytes
   */
  CMD_CID: [0x80, 0xb0, 0x00, 0x04, 0x02, 0x00, 0x0d],

  /**
   * Read Thai full name
   * Address: 0x0011, Length: 100 bytes (0x64)
   */
  CMD_THFULLNAME: [0x80, 0xb0, 0x00, 0x11, 0x02, 0x00, 0x64],

  /**
   * Read English full name
   * Address: 0x0075, Length: 100 bytes (0x64)
   */
  CMD_ENFULLNAME: [0x80, 0xb0, 0x00, 0x75, 0x02, 0x00, 0x64],

  /**
   * Read date of birth (Buddhist calendar)
   * Address: 0x00d9, Length: 8 bytes (YYYYMMDD)
   */
  CMD_BIRTH: [0x80, 0xb0, 0x00, 0xd9, 0x02, 0x00, 0x08],

  /**
   * Read gender (M/F)
   * Address: 0x00e1, Length: 1 byte
   */
  CMD_GENDER: [0x80, 0xb0, 0x00, 0xe1, 0x02, 0x00, 0x01],

  // #endregion

  // #region Card Metadata

  /**
   * Read card issuer organization
   * Address: 0x00f6, Length: 100 bytes (0x64)
   */
  CMD_ISSUER: [0x80, 0xb0, 0x00, 0xf6, 0x02, 0x00, 0x64] as const,

  /**
   * Read card issue date (Buddhist calendar)
   * Address: 0x0167, Length: 8 bytes (YYYYMMDD)
   */
  CMD_ISSUE: [0x80, 0xb0, 0x01, 0x67, 0x02, 0x00, 0x08] as const,

  /**
   * Read card expiration date (Buddhist calendar)
   * Address: 0x016f, Length: 8 bytes (YYYYMMDD)
   */
  CMD_EXPIRE: [0x80, 0xb0, 0x01, 0x6f, 0x02, 0x00, 0x08] as const,

  // #endregion

  // #region Address Information

  /**
   * Read complete address
   * Address: 0x1579, Length: 100 bytes (0x64)
   */
  CMD_ADDRESS: [0x80, 0xb0, 0x15, 0x79, 0x02, 0x00, 0x64] as const,

  // #endregion

  // #region Photograph Data (20 segments)

  /** Photo segment 1 - Address: 0x017b, Length: 255 bytes (0xff) */
  CMD_PHOTO1: [0x80, 0xb0, 0x01, 0x7b, 0x02, 0x00, 0xff] as const,

  /** Photo segment 2 - Address: 0x027a, Length: 255 bytes (0xff) */
  CMD_PHOTO2: [0x80, 0xb0, 0x02, 0x7a, 0x02, 0x00, 0xff] as const,

  /** Photo segment 3 - Address: 0x0379, Length: 255 bytes (0xff) */
  CMD_PHOTO3: [0x80, 0xb0, 0x03, 0x79, 0x02, 0x00, 0xff] as const,

  /** Photo segment 4 - Address: 0x0478, Length: 255 bytes (0xff) */
  CMD_PHOTO4: [0x80, 0xb0, 0x04, 0x78, 0x02, 0x00, 0xff] as const,

  /** Photo segment 5 - Address: 0x0577, Length: 255 bytes (0xff) */
  CMD_PHOTO5: [0x80, 0xb0, 0x05, 0x77, 0x02, 0x00, 0xff] as const,

  /** Photo segment 6 - Address: 0x0676, Length: 255 bytes (0xff) */
  CMD_PHOTO6: [0x80, 0xb0, 0x06, 0x76, 0x02, 0x00, 0xff] as const,

  /** Photo segment 7 - Address: 0x0775, Length: 255 bytes (0xff) */
  CMD_PHOTO7: [0x80, 0xb0, 0x07, 0x75, 0x02, 0x00, 0xff] as const,

  /** Photo segment 8 - Address: 0x0874, Length: 255 bytes (0xff) */
  CMD_PHOTO8: [0x80, 0xb0, 0x08, 0x74, 0x02, 0x00, 0xff] as const,

  /** Photo segment 9 - Address: 0x0973, Length: 255 bytes (0xff) */
  CMD_PHOTO9: [0x80, 0xb0, 0x09, 0x73, 0x02, 0x00, 0xff] as const,

  /** Photo segment 10 - Address: 0x0a72, Length: 255 bytes (0xff) */
  CMD_PHOTO10: [0x80, 0xb0, 0x0a, 0x72, 0x02, 0x00, 0xff] as const,

  /** Photo segment 11 - Address: 0x0b71, Length: 255 bytes (0xff) */
  CMD_PHOTO11: [0x80, 0xb0, 0x0b, 0x71, 0x02, 0x00, 0xff] as const,

  /** Photo segment 12 - Address: 0x0c70, Length: 255 bytes (0xff) */
  CMD_PHOTO12: [0x80, 0xb0, 0x0c, 0x70, 0x02, 0x00, 0xff] as const,

  /** Photo segment 13 - Address: 0x0d6f, Length: 255 bytes (0xff) */
  CMD_PHOTO13: [0x80, 0xb0, 0x0d, 0x6f, 0x02, 0x00, 0xff] as const,

  /** Photo segment 14 - Address: 0x0e6e, Length: 255 bytes (0xff) */
  CMD_PHOTO14: [0x80, 0xb0, 0x0e, 0x6e, 0x02, 0x00, 0xff] as const,

  /** Photo segment 15 - Address: 0x0f6d, Length: 255 bytes (0xff) */
  CMD_PHOTO15: [0x80, 0xb0, 0x0f, 0x6d, 0x02, 0x00, 0xff] as const,

  /** Photo segment 16 - Address: 0x106c, Length: 255 bytes (0xff) */
  CMD_PHOTO16: [0x80, 0xb0, 0x10, 0x6c, 0x02, 0x00, 0xff] as const,

  /** Photo segment 17 - Address: 0x116b, Length: 255 bytes (0xff) */
  CMD_PHOTO17: [0x80, 0xb0, 0x11, 0x6b, 0x02, 0x00, 0xff] as const,

  /** Photo segment 18 - Address: 0x126a, Length: 255 bytes (0xff) */
  CMD_PHOTO18: [0x80, 0xb0, 0x12, 0x6a, 0x02, 0x00, 0xff] as const,

  /** Photo segment 19 - Address: 0x1369, Length: 255 bytes (0xff) */
  CMD_PHOTO19: [0x80, 0xb0, 0x13, 0x69, 0x02, 0x00, 0xff] as const,

  /** Photo segment 20 - Address: 0x1468, Length: 255 bytes (0xff) */
  CMD_PHOTO20: [0x80, 0xb0, 0x14, 0x68, 0x02, 0x00, 0xff],
  // #endregion
};

/**
 * Helper function to get all photo commands in order
 * @returns Array of photo command arrays
 */
export function getPhotoCommands(): number[][] {
  return [
    [...apduPerson.CMD_PHOTO1],
    [...apduPerson.CMD_PHOTO2],
    [...apduPerson.CMD_PHOTO3],
    [...apduPerson.CMD_PHOTO4],
    [...apduPerson.CMD_PHOTO5],
    [...apduPerson.CMD_PHOTO6],
    [...apduPerson.CMD_PHOTO7],
    [...apduPerson.CMD_PHOTO8],
    [...apduPerson.CMD_PHOTO9],
    [...apduPerson.CMD_PHOTO10],
    [...apduPerson.CMD_PHOTO11],
    [...apduPerson.CMD_PHOTO12],
    [...apduPerson.CMD_PHOTO13],
    [...apduPerson.CMD_PHOTO14],
    [...apduPerson.CMD_PHOTO15],
    [...apduPerson.CMD_PHOTO16],
    [...apduPerson.CMD_PHOTO17],
    [...apduPerson.CMD_PHOTO18],
    [...apduPerson.CMD_PHOTO19],
    [...apduPerson.CMD_PHOTO20],
  ];
}

/**
 * Type for all available personal information command keys
 */
export type PersonalApduCommandKey = keyof typeof apduPerson;
