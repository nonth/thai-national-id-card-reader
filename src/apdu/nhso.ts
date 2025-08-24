/**
 * APDU Commands for Thai National ID Card NHSO Information
 *
 * Contains Application Protocol Data Unit (APDU) commands for accessing
 * NHSO (National Health Security Office) health insurance data from
 * Thai National ID Cards.
 *
 * Note: This is a placeholder implementation. The complete NHSO implementation
 * would require detailed specification documentation and testing with cards
 * that contain health insurance data.
 */

/**
 * NHSO Information APDU Commands
 *
 * These commands are used to access health insurance information
 * stored on Thai National ID Cards through the NHSO applet.
 */
export const apduNhso = {
  // #region Card Selection and Initialization

  /**
   * SELECT command to activate the NHSO applet
   * Includes NHSO application identifier
   */
  SELECT: [0x00, 0xa4, 0x04, 0x00, 0x08, 0xa0, 0x00, 0x00, 0x00, 0x54, 0x48, 0x00, 0x83],

  // #endregion

  // #region NHSO Data Commands

  /**
   * Read main insurance level information
   * Address: 0x0004, Length: 60 bytes (0x3c)
   */
  CMD_MAIN_INSCL: [0x80, 0xb0, 0x00, 0x04, 0x02, 0x00, 0x3c],

  /**
   * Read sub insurance level information
   * Address: 0x0040, Length: 100 bytes (0x64)
   */
  CMD_SUB_INSCL: [0x80, 0xb0, 0x00, 0x40, 0x02, 0x00, 0x64],

  /**
   * Read main hospital name
   * Address: 0x00a4, Length: 80 bytes (0x50)
   */
  CMD_MAIN_HOSPITAL_NAME: [0x80, 0xb0, 0x00, 0xa4, 0x02, 0x00, 0x50],

  /**
   * Read sub hospital name
   * Address: 0x00f4, Length: 80 bytes (0x50)
   */
  CMD_SUB_HOSPITAL_NAME: [0x80, 0xb0, 0x00, 0xf4, 0x02, 0x00, 0x50],

  /**
   * Read paid type information
   * Address: 0x0144, Length: 1 byte
   */
  CMD_PAID_TYPE: [0x80, 0xb0, 0x01, 0x44, 0x02, 0x00, 0x01],

  /**
   * Read NHSO card issue date
   * Address: 0x0145, Length: 8 bytes (YYYYMMDD)
   */
  CMD_ISSUE_DATE: [0x80, 0xb0, 0x01, 0x45, 0x02, 0x00, 0x08],

  /**
   * Read NHSO card expiration date
   * Address: 0x014d, Length: 8 bytes (YYYYMMDD)
   */
  CMD_EXPIRE_DATE: [0x80, 0xb0, 0x01, 0x4d, 0x02, 0x00, 0x08],

  /**
   * Read last update date
   * Address: 0x0155, Length: 8 bytes (YYYYMMDD)
   */
  CMD_UPDATE_DATE: [0x80, 0xb0, 0x01, 0x55, 0x02, 0x00, 0x08],

  /**
   * Read hospital change amount
   * Address: 0x015d, Length: 1 byte
   */
  CMD_CHANGE_HOSPITAL_AMOUNT: [0x80, 0xb0, 0x01, 0x5d, 0x02, 0x00, 0x01],

  // #endregion
} as const;

/**
 * NHSO applet status codes
 *
 * These codes help identify the status of NHSO operations
 */
export const NhsoStatusCodes = {
  /** NHSO data successfully read */
  SUCCESS: 0x9000,

  /** NHSO applet not found on card */
  APPLET_NOT_FOUND: 0x6a82,

  /** NHSO data not available */
  DATA_NOT_AVAILABLE: 0x6a83,

  /** Authentication required for NHSO data */
  AUTH_REQUIRED: 0x6982,

  /** Card does not support NHSO */
  NOT_SUPPORTED: 0x6d00,
} as const;

/**
 * All available NHSO commands for data extraction
 */
export const NHSO_COMMANDS = [
  'CMD_MAIN_INSCL',
  'CMD_SUB_INSCL',
  'CMD_MAIN_HOSPITAL_NAME',
  'CMD_SUB_HOSPITAL_NAME',
  'CMD_PAID_TYPE',
  'CMD_ISSUE_DATE',
  'CMD_EXPIRE_DATE',
  'CMD_UPDATE_DATE',
  'CMD_CHANGE_HOSPITAL_AMOUNT',
] as const;

/**
 * Helper function to check if a status code indicates success
 * @param statusCode - The status code to check
 * @returns True if the operation was successful
 */
export function isNhsoSuccess(statusCode: number): boolean {
  return statusCode === NhsoStatusCodes.SUCCESS;
}

/**
 * Helper function to get a human-readable description of an NHSO status code
 * @param statusCode - The status code to describe
 * @returns Human-readable description of the status
 */
export function getNhsoStatusDescription(statusCode: number): string {
  switch (statusCode) {
    case NhsoStatusCodes.SUCCESS:
      return 'NHSO data successfully read';
    case NhsoStatusCodes.APPLET_NOT_FOUND:
      return 'NHSO applet not found on this card';
    case NhsoStatusCodes.DATA_NOT_AVAILABLE:
      return 'NHSO data is not available on this card';
    case NhsoStatusCodes.AUTH_REQUIRED:
      return 'Authentication required to access NHSO data';
    case NhsoStatusCodes.NOT_SUPPORTED:
      return 'This card does not support NHSO functionality';
    default:
      return `Unknown NHSO status code: 0x${statusCode.toString(16).toUpperCase()}`;
  }
}

/**
 * Type for all available NHSO command keys
 */
export type NhsoApduCommandKey = keyof typeof apduNhso;
