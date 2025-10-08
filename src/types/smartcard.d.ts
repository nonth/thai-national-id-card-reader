declare module '@nonth/smartcard' {
  export class CommandApdu {
    constructor(options: { bytes: number[] });
  }

  export class Card {
    issueCommand(command: CommandApdu): Promise<Buffer>;
  }

  export class CardReader {
    constructor(reader: unknown);
  }

  export class Devices {
    constructor();
    on(event: string, listener: (...args: unknown[]) => void): void;
    removeAllListeners(): void;
  }

  export interface SmartcardModule {
    CommandApdu: typeof CommandApdu;
    Card: typeof Card;
    CardReader: typeof CardReader;
    Devices: typeof Devices;
  }
}
