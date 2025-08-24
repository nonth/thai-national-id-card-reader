import { NhsoApplet } from './applets/nhso-applet';
import { PersonalApplet } from './applets/personal-applet';
import { CardReaderEventEmitter } from './event-emitter';
import {
  CardReaderOptions,
  QueryField,
  ThaiIdCardData,
  CardInsertedEvent,
  CardDataEvent,
  CardErrorEvent,
  CardRemovedEvent,
  DeviceEvent,
} from './types';
import { getLaser } from './utils/reader';

import { Devices } from 'smartcard';

/**
 * Thai National ID Card Reader
 *
 * A library for reading Thai National ID Cards using PC/SC compatible smartcard readers.
 * Provides event-driven architecture with full TypeScript support and automatic data extraction.
 */
export class ThaiIdCardReader extends CardReaderEventEmitter {
  // Core properties
  private devices: {
    on: (_event: string, _handler: (_event: unknown) => void) => void;
    removeAllListeners: () => void;
  } | null = null;
  private readonly options: CardReaderOptions;
  private isInitialized = false;
  private cardInserted = false;

  // All available data fields that can be read from Thai National ID Cards
  private static readonly ALL_FIELDS: QueryField[] = [
    'cid', // Citizen ID (13 digits)
    'name', // Thai name
    'nameEn', // English name
    'dob', // Date of birth
    'gender', // Gender
    'issuer', // Card issuer
    'issueDate', // Issue date
    'expireDate', // Expiration date
    'address', // Full address
    'photo', // Base64 encoded photo
    'nhso', // Health insurance data
    'laserId', // Laser engraved ID
  ];

  // Status codes for different event types
  private static readonly STATUS = {
    SUCCESS: 200,
    DEVICE_ACTIVATED: 201,
    CARD_INSERTED: 202,
    CARD_REMOVED: 205,
    INCORRECT_CARD: 400,
    DEVICE_NOT_FOUND: 404,
    ERROR: 500,
  } as const;

  constructor(options: CardReaderOptions = {}) {
    super();

    this.options = this.validateAndSetOptions(options);
  }

  // #region Public API Methods

  /**
   * Initialize the card reader and start listening for devices
   * @throws {Error} If reader is already initialized
   */
  public init(): void {
    if (this.isInitialized) {
      throw new Error('Thai National ID Card Reader is already initialized');
    }

    try {
      this.devices = new Devices();
      this.registerDeviceListeners();
      this.isInitialized = true;

      this.logDebug('Thai National ID Card Reader initialized successfully');
    } catch (error) {
      throw new Error(`Failed to initialize card reader: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Clean up resources and stop the card reader
   */
  public destroy(): void {
    this.cleanup();
    this.logDebug('Thai National ID Card Reader destroyed');
  }

  /**
   * Check if the card reader is currently initialized
   */
  public isReady(): boolean {
    return this.isInitialized;
  }

  /**
   * Check if a card is currently inserted
   */
  public hasCardInserted(): boolean {
    return this.cardInserted;
  }

  // #endregion

  // #region Private Helper Methods

  /**
   * Validate and set default options
   */
  private validateAndSetOptions(options: CardReaderOptions): Required<CardReaderOptions> {
    return {
      exitOnReadError: options.exitOnReadError ?? true,
      debug: options.debug ?? false,
    };
  }

  /**
   * Clean up all resources
   */
  private cleanup(): void {
    if (this.devices) {
      this.devices.removeAllListeners();
      this.devices = null;
    }

    this.removeAllListeners();
    this.resetState();
  }

  /**
   * Reset internal state
   */
  private resetState(): void {
    this.isInitialized = false;
    this.cardInserted = false;
  }

  /**
   * Log debug messages if debug mode is enabled
   */
  private logDebug(message: string, data?: unknown): void {
    if (this.options.debug) {
      console.log(`[ThaiIdCardReader] ${message}`, data ? data : '');
    }
  }

  /**
   * Log error messages
   */
  private logError(message: string, error?: unknown): void {
    console.error(`[ThaiIdCardReader ERROR] ${message}`, error ? error : '');
  }

  // #endregion

  // #region Device Event Handling

  /**
   * Register listeners for device events (connect/disconnect)
   */
  private registerDeviceListeners(): void {
    if (!this.devices) {
      throw new Error('Devices not initialized');
    }
    this.devices.on('device-activated', this.handleDeviceConnected.bind(this));
    this.devices.on('device-deactivated', this.handleDeviceDisconnected.bind(this));
    this.devices.on('error', this.handleDeviceError.bind(this));
  }

  /**
   * Handle device connection (card reader connected)
   */
  private handleDeviceConnected(event: unknown): void {
    const { device, devices } = event as { device: unknown; devices: unknown };
    const message = `Card reader '${device}' connected and ready`;

    const deviceStr = String(device);
    const devicesObj = devices as Record<string, unknown>;
    this.logDebug('Device activated', {
      device: deviceStr,
      totalDevices: Object.keys(devicesObj).length,
    });

    const deviceEvent: DeviceEvent = {
      status: ThaiIdCardReader.STATUS.DEVICE_ACTIVATED,
      description: 'Device Activated',
      data: {
        message,
        device: deviceStr,
        devices: Object.values(devicesObj).map((d: unknown) => String(d)),
      },
    };

    this.emit('device-connected', deviceEvent);
    this.registerCardListeners(device);
  }

  /**
   * Handle device disconnection (card reader disconnected)
   */
  private handleDeviceDisconnected(event: unknown): void {
    const eventData = event as { device?: { toString: () => string }; devices?: unknown };
    const message = `Card reader '${eventData.device}' disconnected`;
    this.logError(message);

    const deviceEvent: DeviceEvent = {
      status: ThaiIdCardReader.STATUS.DEVICE_NOT_FOUND,
      description: 'Device Deactivated',
      data: {
        message,
        device: eventData.device?.toString(),
        devices: eventData.devices
          ? Object.values(eventData.devices as Record<string, unknown>).map((d: unknown) => String(d))
          : [],
      },
    };

    this.emit('device-disconnected', deviceEvent);
    this.cardInserted = false; // Reset card state when device disconnects
  }

  /**
   * Handle device errors
   */
  private handleDeviceError(error: unknown): void {
    const errorData = error as { error: unknown };
    const message = `Device error: ${errorData.error}`;
    this.logError(message, error);

    const errorEvent: CardErrorEvent = {
      status: ThaiIdCardReader.STATUS.ERROR,
      description: 'Device Error',
      data: {
        message,
        error: errorData.error,
      },
    };

    this.emit('card-error', errorEvent);
  }

  // #endregion

  // #region Card Event Handling

  /**
   * Register listeners for card events (insert/remove/error)
   */
  private registerCardListeners(device: unknown): void {
    const deviceWithHandlers = device as {
      on: (_event: string, _handler: (_event: unknown) => void) => void;
    };
    deviceWithHandlers.on('card-inserted', this.handleCardInserted.bind(this));
    deviceWithHandlers.on('card-removed', this.handleCardRemoved.bind(this));
    deviceWithHandlers.on('error', this.handleCardError.bind(this));
  }

  /**
   * Handle card insertion and start reading process
   */
  private async handleCardInserted(event: unknown): Promise<void> {
    const { card, device } = event as { card: { getAtr: () => Buffer }; device?: { toString: () => string } };
    const atr = card.getAtr();
    const message = `Thai National ID Card detected (ATR: ${atr})`;

    this.logDebug(message, { device: device?.toString() });

    // Emit card inserted event
    const insertedEvent: CardInsertedEvent = {
      status: ThaiIdCardReader.STATUS.CARD_INSERTED,
      description: 'Card Inserted',
      data: {
        message,
        atr: atr.toString(),
        device: device?.toString(),
      },
    };

    this.emit('card-inserted', insertedEvent);
    this.cardInserted = true;

    // Set up debug listeners for card communication if debug is enabled
    if (this.options.debug) {
      this.setupCardDebugListeners(card);
    }

    // Start reading card data
    await this.processCardData(card);
  }

  /**
   * Handle card removal (only if card was previously inserted)
   */
  private handleCardRemoved(event: unknown): void {
    // Only emit card-removed event if a card was actually inserted
    // This prevents spurious events immediately after device activation
    if (this.cardInserted) {
      const message = `Thai National ID Card removed`;
      const eventData = event as { name?: { toString: () => string } };
      this.logDebug(message, { device: eventData.name?.toString() });

      const removedEvent: CardRemovedEvent = {
        status: ThaiIdCardReader.STATUS.CARD_REMOVED,
        description: 'Card Removed',
        data: {
          message,
          device: eventData.name?.toString(),
        },
      };

      this.emit('card-removed', removedEvent);
      this.cardInserted = false;
    }
  }

  /**
   * Handle card errors (incorrect card type, etc.)
   */
  private handleCardError(event: unknown): void {
    const message = 'Incorrect card type - Please insert a valid Thai National ID Card';
    this.logError(message, event);

    const errorEvent: CardErrorEvent = {
      status: ThaiIdCardReader.STATUS.INCORRECT_CARD,
      description: 'Incorrect Card Type',
      data: {
        message,
        error: event,
      },
    };

    this.emit('card-incorrect', errorEvent);
  }

  // #endregion

  // #region Card Data Processing

  /**
   * Set up debug listeners for card communication
   */
  private setupCardDebugListeners(card: unknown): void {
    const cardWithHandlers = card as {
      on: (_event: string, _handler: (_event: unknown) => void) => void;
    };
    cardWithHandlers.on('command-issued', (event: unknown) => {
      const eventData = event as { command: unknown };
      this.logDebug(`APDU Command sent: ${eventData.command}`);
    });

    cardWithHandlers.on('response-received', (event: unknown) => {
      const eventData = event as { response: unknown };
      this.logDebug(`APDU Response received: ${eventData.response}`);
    });
  }

  /**
   * Process card data reading and emit results
   */
  private async processCardData(card: unknown): Promise<void> {
    try {
      this.logDebug('Starting card data extraction...');
      const data = await this.extractCardData(card);

      this.logDebug('Card data extracted successfully', Object.keys(data));

      const dataEvent: CardDataEvent = {
        status: ThaiIdCardReader.STATUS.SUCCESS,
        description: 'Data Read Successfully',
        data,
      };

      this.emit('card-data', dataEvent);
    } catch (error) {
      this.handleReadError(error);
    }
  }

  /**
   * Extract all data from the Thai National ID Card
   */
  private async extractCardData(card: unknown): Promise<ThaiIdCardData> {
    const requestCommand = this.determineRequestCommand(card);
    let data: ThaiIdCardData = {};

    // Extract personal information (name, address, photo, etc.)
    data = await this.extractPersonalData(card, requestCommand, data);

    // Extract health insurance data (NHSO)
    data = await this.extractHealthData(card, requestCommand, data);

    // Extract laser ID
    data = await this.extractLaserData(card, requestCommand, data);

    return data;
  }

  /**
   * Determine the correct request command based on card ATR
   */
  private determineRequestCommand(card: unknown): number[] {
    const cardWithAtr = card as { getAtr: () => Buffer };
    const atr = cardWithAtr.getAtr();

    // Different ATR patterns require different request commands
    if (atr.toString('hex').slice(0, 8) === Buffer.from([0x3b, 0x67]).toString('hex')) {
      return [0x00, 0xc0, 0x00, 0x01];
    }

    return [0x00, 0xc0, 0x00, 0x00]; // Default command
  }

  /**
   * Extract personal information from the card
   */
  private async extractPersonalData(
    card: unknown,
    requestCommand: number[],
    currentData: ThaiIdCardData,
  ): Promise<ThaiIdCardData> {
    try {
      const personalApplet = new PersonalApplet(card as import('./types').Card, requestCommand);
      const personalFields = ThaiIdCardReader.ALL_FIELDS.filter((field) => field !== 'nhso' && field !== 'laserId');

      if (personalFields.length > 0) {
        const personalData = await personalApplet.getInfo(personalFields);

        return { ...currentData, ...personalData };
      }

      return currentData;
    } catch (error) {
      this.logError('Failed to read personal data', error);
      throw new Error(`Personal data extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Extract health insurance data (NHSO) from the card
   */
  private async extractHealthData(
    card: unknown,
    requestCommand: number[],
    currentData: ThaiIdCardData,
  ): Promise<ThaiIdCardData> {
    try {
      const nhsoApplet = new NhsoApplet(card as import('./types').Card, requestCommand);
      const nhsoData = await nhsoApplet.getInfo();

      return { ...currentData, nhso: nhsoData };
    } catch (error) {
      this.logDebug('NHSO data not available or failed to read', error);
      // NHSO data is optional, don't throw error

      return currentData;
    }
  }

  /**
   * Extract laser ID from the card
   */
  private async extractLaserData(
    card: unknown,
    requestCommand: number[],
    currentData: ThaiIdCardData,
  ): Promise<ThaiIdCardData> {
    try {
      const laserId = await getLaser(card as import('./types').Card, requestCommand);

      return { ...currentData, laserId };
    } catch (error) {
      this.logDebug('Laser ID not available or failed to read', error);
      // Laser ID is optional, return empty string instead of throwing

      return { ...currentData, laserId: '' };
    }
  }

  /**
   * Handle read errors with appropriate error emission and optional process exit
   */
  private handleReadError(error: unknown): void {
    const message = `Failed to read Thai National ID Card: ${error instanceof Error ? error.message : 'Unknown error'}`;
    this.logError(message, error);

    const errorEvent: CardErrorEvent = {
      status: ThaiIdCardReader.STATUS.ERROR,
      description: 'Card Read Error',
      data: {
        message,
        error: error instanceof Error ? error : new Error(String(error)),
      },
    };

    this.emit('card-error', errorEvent);

    // Exit process if configured to do so
    if (this.options.exitOnReadError) {
      this.logError('Exiting process due to read error (exitOnReadError: true)');
      process.exit(1);
    }
  }

  // #endregion
}
