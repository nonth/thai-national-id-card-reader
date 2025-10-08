import smartcard from '@nonth/smartcard';
import legacy from 'legacy-encoding';

const { CommandApdu } = smartcard;

import { apduNhso } from '../apdu/nhso';
import { NhsoData, Card } from '../types';
import { getData } from '../utils/reader';

/**
 * NHSO (National Health Security Office) Applet
 *
 * Handles extraction of health insurance data from Thai National ID Cards.
 *
 * Note: This is currently a placeholder implementation as the full NHSO
 * specification requires additional documentation and testing with cards
 * that contain health insurance data.
 */
export class NhsoApplet {
  private readonly card: Card;
  private readonly requestCommand: number[];

  constructor(card: Card, requestCommand: number[] = [0x00, 0xc0, 0x00, 0x00]) {
    this.card = card;
    this.requestCommand = requestCommand;
  }

  /**
   * Extract NHSO health insurance information from the card
   *
   * @returns NHSO data object containing health insurance information
   * @throws Error if NHSO data cannot be read or is not available
   */
  async getInfo(): Promise<NhsoData> {
    try {
      // Initialize NHSO applet communication
      await this.initializeNhsoCard();

      const nhsoData: NhsoData = await this.extractNhsoData();

      return nhsoData;
    } catch (error) {
      throw new Error(`Failed to read NHSO data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Initialize communication with NHSO applet on the card
   */
  private async initializeNhsoCard(): Promise<void> {
    await this.card.issueCommand(
      new CommandApdu({
        bytes: [...apduNhso.SELECT],
      }),
    );
  }

  /**
   * Extract NHSO data from the card
   */
  private async extractNhsoData(): Promise<NhsoData> {
    const nhsoData: NhsoData = {};

    try {
      // Extract main insurance level
      const mainInsclData = await getData(this.card, [...apduNhso.CMD_MAIN_INSCL], this.requestCommand);
      nhsoData.mainInscl = legacy.decode(mainInsclData, 'tis620').slice(0, -2).toString().trim();

      // Extract sub insurance level
      const subInsclData = await getData(this.card, [...apduNhso.CMD_SUB_INSCL], this.requestCommand);
      nhsoData.subInscl = legacy.decode(subInsclData, 'tis620').slice(0, -2).toString().trim();

      // Extract main hospital name
      const mainHospitalData = await getData(this.card, [...apduNhso.CMD_MAIN_HOSPITAL_NAME], this.requestCommand);
      nhsoData.mainHospitalName = legacy.decode(mainHospitalData, 'tis620').slice(0, -2).toString().trim();

      // Extract sub hospital name
      const subHospitalData = await getData(this.card, [...apduNhso.CMD_SUB_HOSPITAL_NAME], this.requestCommand);
      nhsoData.subHospitalName = legacy.decode(subHospitalData, 'tis620').slice(0, -2).toString().trim();

      // Extract paid type
      const paidTypeData = await getData(this.card, [...apduNhso.CMD_PAID_TYPE], this.requestCommand);
      nhsoData.paidType = paidTypeData.slice(0, -2).toString('hex');

      // Extract dates and convert from Buddhist to Gregorian calendar
      const issueDateData = await getData(this.card, [...apduNhso.CMD_ISSUE_DATE], this.requestCommand);
      nhsoData.issueDate = this.convertBuddhistDate(issueDateData.slice(0, -2).toString().trim());

      const expireDateData = await getData(this.card, [...apduNhso.CMD_EXPIRE_DATE], this.requestCommand);
      nhsoData.expireDate = this.convertBuddhistDate(expireDateData.slice(0, -2).toString().trim());

      const updateDateData = await getData(this.card, [...apduNhso.CMD_UPDATE_DATE], this.requestCommand);
      nhsoData.updateDate = this.convertBuddhistDate(updateDateData.slice(0, -2).toString().trim());

      // Extract hospital change amount
      const changeAmountData = await getData(this.card, [...apduNhso.CMD_CHANGE_HOSPITAL_AMOUNT], this.requestCommand);
      nhsoData.changeHospitalAmount = changeAmountData.slice(0, -2).toString('hex');
    } catch (error) {
      // If any field fails, continue with partial data
      console.warn('Some NHSO fields could not be extracted:', error);
    }

    return nhsoData;
  }

  /**
   * Check if the card contains NHSO data
   *
   * @returns True if NHSO data is available, false otherwise
   */
  async hasNhsoData(): Promise<boolean> {
    try {
      await this.initializeNhsoCard();

      return true;
    } catch {
      return false;
    }
  }

  /**
   * Convert Buddhist calendar date to Gregorian (YYYY-MM-DD format)
   */
  private convertBuddhistDate(buddhistDate: string): string {
    if (!buddhistDate || buddhistDate.length !== 8) {
      return '';
    }

    try {
      const year = parseInt(buddhistDate.substring(0, 4)) - 543;
      const month = buddhistDate.substring(4, 6);
      const day = buddhistDate.substring(6, 8);

      return `${year}-${month}-${day}`;
    } catch {
      return '';
    }
  }

  /**
   * Get NHSO applet version information (if available)
   *
   * @returns Version string or null if not available
   */
  async getAppletVersion(): Promise<string | null> {
    // This would implement version detection logic
    // based on NHSO specification
    return null; // Placeholder
  }
}
