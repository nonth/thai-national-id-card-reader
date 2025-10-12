import { CommandApdu } from '@nonth/smartcard';

import { Card } from '../types';

export async function getData(
  card: Card,
  command: number[],
  req: number[] = [0x00, 0xc0, 0x00, 0x00],
): Promise<Buffer> {
  let data = await card.issueCommand(
    new CommandApdu({
      bytes: command,
    }),
  );

  data = await card.issueCommand(
    new CommandApdu({
      bytes: [...req, ...command.slice(-1)],
    }),
  );

  return data;
}

export async function getLaser(card: Card, req: number[] = [0x00, 0xc0, 0x00, 0x00]): Promise<string> {
  // Check card
  await card.issueCommand(
    new CommandApdu({
      bytes: [0x00, 0xa4, 0x04, 0x00, 0x08, 0xa0, 0x00, 0x00, 0x00, 0x84, 0x06, 0x00, 0x02],
    }),
  );

  const command = [0x80, 0x00, 0x00, 0x00, 0x07];
  let data = await card.issueCommand(
    new CommandApdu({
      bytes: command,
    }),
  );

  data = await card.issueCommand(
    new CommandApdu({
      bytes: [...req, 0x10],
    }),
  );

  return data.slice(0, -2).toString().replace(/\0/g, '').trim();
}
