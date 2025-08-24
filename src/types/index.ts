/**
 * Thai National ID Card Reader - Type Definitions
 *
 * TypeScript interfaces and types for reading Thai National ID Cards
 * with full type safety and documentation for all data structures and events.
 */

// #region Core Data Structures

/**
 * Complete Thai National ID Card data structure
 *
 * Contains all possible data fields that can be extracted from a Thai National ID Card.
 * All fields are optional as different cards or query configurations may not include all data.
 */
export interface ThaiIdCardData {
  /** Citizen ID number (13 digits) - Primary identification number */
  cid?: string;

  /** Full name in Thai script */
  name?: string;

  /** Full name in English script */
  nameEn?: string;

  /** Date of birth in YYYY-MM-DD format (converted from Buddhist to Gregorian calendar) */
  dob?: string;

  /** Gender - 'M' for male, 'F' for female */
  gender?: string;

  /** Card issuing organization (typically in Thai) */
  issuer?: string;

  /** Card issue date in YYYY-MM-DD format (converted from Buddhist to Gregorian calendar) */
  issueDate?: string;

  /** Card expiration date in YYYY-MM-DD format (converted from Buddhist to Gregorian calendar) */
  expireDate?: string;

  /** Complete address as formatted on the card */
  address?: string;

  /** Photograph as base64-encoded string (JPEG format) */
  photo?: string;

  /** NHSO (National Health Security Office) health insurance data */
  nhso?: NhsoData;

  /** Laser-engraved identification string (if available) */
  laserId?: string;
}

/**
 * NHSO (National Health Security Office) data structure
 *
 * Contains health insurance information stored on Thai National ID Cards.
 * The exact structure may vary based on card version and available data.
 */
export interface NhsoData {
  /** Main insurance level information */
  mainInscl?: string;

  /** Sub insurance level information */
  subInscl?: string;

  /** Main hospital name */
  mainHospitalName?: string;

  /** Sub hospital name */
  subHospitalName?: string;

  /** Paid type information */
  paidType?: string;

  /** NHSO card issue date in YYYY-MM-DD format */
  issueDate?: string;

  /** NHSO card expiration date in YYYY-MM-DD format */
  expireDate?: string;

  /** Last update date in YYYY-MM-DD format */
  updateDate?: string;

  /** Hospital change amount */
  changeHospitalAmount?: string;

  /** Additional dynamic fields may be present */
  [key: string]: unknown;
}

// #endregion

// #region Query and Configuration Types

/**
 * Available data fields that can be queried from Thai National ID Cards
 *
 * These correspond to the fields available in ThaiIdCardData interface.
 * Use these to specify which data should be extracted from the card.
 */
export type QueryField =
  | 'cid' // Citizen ID
  | 'name' // Thai name
  | 'nameEn' // English name
  | 'dob' // Date of birth
  | 'gender' // Gender
  | 'issuer' // Card issuer
  | 'issueDate' // Issue date
  | 'expireDate' // Expiration date
  | 'address' // Address
  | 'photo' // Photograph
  | 'nhso' // Health insurance data
  | 'laserId'; // Laser ID

/**
 * Configuration options for the Thai National ID Card Reader
 */
export interface CardReaderOptions {
  /**
   * Whether to exit the process when a card read error occurs
   * Default: true
   */
  exitOnReadError?: boolean;

  /**
   * Enable debug logging for troubleshooting
   * Default: false
   */
  debug?: boolean;
}

// #endregion

// #region Hardware Interface Types

/**
 * Smartcard interface abstraction
 *
 * Represents a physical smartcard with command execution capabilities.
 * This interface abstracts the underlying smartcard library implementation.
 */
export interface Card {
  /**
   * Issue an APDU command to the smartcard
   * @param command - The APDU command to execute
   * @returns Promise resolving to the command response data
   */
  issueCommand(command: CommandApduLike): Promise<Buffer>;

  /**
   * Get the Answer to Reset (ATR) from the card
   * @returns Buffer containing the card's ATR
   */
  getAtr?(): Buffer;
}

/**
 * APDU (Application Protocol Data Unit) command structure
 *
 * Represents a command that can be sent to a smartcard.
 */
export interface CommandApduLike {
  /** Raw bytes of the APDU command */
  bytes?: number[];
}

// #endregion

// #region Event System Types

/**
 * Base interface for all card reader events
 *
 * Provides a consistent structure with status codes, descriptions, and typed data.
 */
export interface CardEvent {
  /** HTTP-style status code indicating the event type/result */
  status: number;

  /** Human-readable description of the event */
  description: string;

  /** Event-specific data payload */
  data?: unknown;
}

/**
 * Event emitted when a card is inserted into the reader
 */
export interface CardInsertedEvent extends CardEvent {
  status: 202; // Created/Inserted
  data: {
    /** Descriptive message about the card insertion */
    message: string;

    /** Answer to Reset (ATR) from the card */
    atr?: string;

    /** Name/identifier of the card reader device */
    device?: string;
  };
}

/**
 * Event emitted when card data has been successfully read
 */
export interface CardDataEvent extends CardEvent {
  status: 200; // Success
  data: ThaiIdCardData;
}

/**
 * Event emitted when an error occurs during card operations
 */
export interface CardErrorEvent extends CardEvent {
  status: 400 | 404 | 500; // Client Error | Not Found | Server Error
  data: {
    /** Human-readable error message */
    message: string;

    /** Detailed error object (if available) */
    error?: Error | unknown;
  };
}

/**
 * Event emitted when a card is removed from the reader
 */
export interface CardRemovedEvent extends CardEvent {
  status: 205; // Reset Content (removed)
  data: {
    /** Descriptive message about the card removal */
    message: string;

    /** Name/identifier of the card reader device */
    device?: string;
  };
}

/**
 * Event emitted for card reader device status changes
 */
export interface DeviceEvent extends CardEvent {
  status: 201 | 404; // Created (activated) | Not Found (deactivated)
  data: {
    /** Descriptive message about the device status */
    message: string;

    /** Name/identifier of the affected device */
    device?: string;

    /** List of all currently available devices */
    devices?: string[];
  };
}

// #endregion

// #region Event System Infrastructure

/**
 * Union type of all possible card reader event types
 *
 * Used for type-safe event handling and listener registration.
 */
export type CardEventType =
  | 'card-inserted' // Card physically inserted
  | 'card-data' // Data successfully read
  | 'card-error' // Error during card operations
  | 'card-removed' // Card physically removed
  | 'card-incorrect' // Wrong card type inserted
  | 'device-connected' // Card reader connected
  | 'device-disconnected'; // Card reader disconnected

/**
 * Generic event listener function type
 *
 * @template T - The specific event type being handled
 */
export type EventListener<T extends CardEvent> = (event: T) => void;

/**
 * Complete mapping of event names to their corresponding event data types
 *
 * This interface enables full TypeScript intelliSense and type checking
 * for event registration and emission.
 */
export interface CardReaderEvents {
  'card-inserted': CardInsertedEvent;
  'card-data': CardDataEvent;
  'card-error': CardErrorEvent;
  'card-removed': CardRemovedEvent;
  'card-incorrect': CardErrorEvent;
  'device-connected': DeviceEvent;
  'device-disconnected': DeviceEvent;
}

// #endregion

// #region Error Handling Types

/**
 * Specialized error class for Thai National ID Card Reader operations
 */
export class ThaiIdCardReaderError extends Error {
  /** Error code for programmatic handling */
  public readonly code: string;

  /** HTTP-style status code */
  public readonly status: number;

  /** Original error that caused this error (if any) */
  public readonly cause?: Error;

  constructor(message: string, code: string = 'THAI_ID_CARD_ERROR', status: number = 500, cause?: Error) {
    super(message);
    this.name = 'ThaiIdCardReaderError';
    this.code = code;
    this.status = status;
    this.cause = cause;
  }
}

/**
 * Enumeration of common error codes
 */
export enum ErrorCodes {
  /** Card reader hardware not found or not connected */
  DEVICE_NOT_FOUND = 'DEVICE_NOT_FOUND',

  /** Card reader initialization failed */
  INITIALIZATION_FAILED = 'INITIALIZATION_FAILED',

  /** No card inserted in reader */
  NO_CARD = 'NO_CARD',

  /** Card type is not a Thai National ID Card */
  INCORRECT_CARD_TYPE = 'INCORRECT_CARD_TYPE',

  /** Failed to read data from card */
  CARD_READ_ERROR = 'CARD_READ_ERROR',

  /** Communication error with card reader */
  COMMUNICATION_ERROR = 'COMMUNICATION_ERROR',

  /** Card data parsing/validation failed */
  DATA_PARSING_ERROR = 'DATA_PARSING_ERROR',

  /** Operation timeout */
  TIMEOUT = 'TIMEOUT',
}

// #endregion

// #region Utility Types

/**
 * Configuration for individual field extraction
 */
export interface FieldExtractionConfig {
  /** The field to extract */
  field: QueryField;

  /** Whether this field is required (will throw error if not available) */
  required?: boolean;

  /** Custom validation function for the extracted data */
  validator?: (value: unknown) => boolean;
}

/**
 * Advanced query configuration
 */
export interface AdvancedQueryConfig {
  /** List of fields to extract with individual configurations */
  fields: FieldExtractionConfig[];

  /** Maximum time to wait for card operations (in milliseconds) */
  timeout?: number;

  /** Number of retry attempts for failed operations */
  retryAttempts?: number;

  /** Custom error handling strategy */
  errorHandling?: 'strict' | 'lenient' | 'custom';
}

// #endregion
