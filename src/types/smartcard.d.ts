declare module 'smartcard' {
  export class CommandApdu {
    constructor(options: { bytes: number[] });
  }

  export class Card {
    issueCommand(command: CommandApdu): Promise<Buffer>;
  }

  export class CardReader {
    constructor(reader: unknown);
  }

  export interface SmartcardModule {
    CommandApdu: typeof CommandApdu;
    Card: typeof Card;
    CardReader: typeof CardReader;
  }
}
