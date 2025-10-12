import { CommandApdu } from '@nonth/smartcard';
import hex2imagebase64 from 'hex2imagebase64';
import legacy from 'legacy-encoding';

import { apduPerson } from '../apdu/person';
import { QueryField, ThaiIdCardData, Card } from '../types';
import { getData } from '../utils/reader';

/**
 * Personal Information Data Structures
 */
interface NameComponents {
  prefix: string;
  firstname: string;
  middlename: string;
  lastname: string;
  fullname: string;
}

interface AddressComponents {
  houseNo: string;
  moo: string;
  soi: string;
  street: string;
  subdistrict: string;
  district: string;
  province: string;
  fullAddress: string;
}

/**
 * Personal Information Applet
 *
 * Handles extraction of personal information from Thai National ID Cards including:
 * - Basic identification (CID, names, date of birth, gender)
 * - Card metadata (issuer, issue/expire dates)
 * - Address information
 * - Photograph data
 */
export class PersonalApplet {
  private readonly card: Card;
  private readonly requestCommand: number[];

  // Photo data is split across multiple APDU commands
  private static readonly PHOTO_COMMANDS = [
    'CMD_PHOTO1',
    'CMD_PHOTO2',
    'CMD_PHOTO3',
    'CMD_PHOTO4',
    'CMD_PHOTO5',
    'CMD_PHOTO6',
    'CMD_PHOTO7',
    'CMD_PHOTO8',
    'CMD_PHOTO9',
    'CMD_PHOTO10',
    'CMD_PHOTO11',
    'CMD_PHOTO12',
    'CMD_PHOTO13',
    'CMD_PHOTO14',
    'CMD_PHOTO15',
    'CMD_PHOTO16',
    'CMD_PHOTO17',
    'CMD_PHOTO18',
    'CMD_PHOTO19',
    'CMD_PHOTO20',
  ] as const;

  constructor(card: Card, requestCommand: number[] = [0x00, 0xc0, 0x00, 0x00]) {
    this.card = card;
    this.requestCommand = requestCommand;
  }

  /**
   * Extract personal information based on specified query fields
   * @param queryFields - Array of fields to extract from the card
   * @returns Partial Thai ID card data containing requested fields
   */
  async getInfo(queryFields: QueryField[] = ['cid']): Promise<Partial<ThaiIdCardData>> {
    // Initialize the card for personal data reading
    await this.initializeCard();

    // Create a lookup object for efficient field checking
    const requestedFields = this.createFieldLookup(queryFields);

    const extractedData: Partial<ThaiIdCardData> = {};

    // Extract each requested field
    if (requestedFields.cid) extractedData.cid = await this.extractCitizenId();
    if (requestedFields.name) extractedData.name = await this.extractThaiName();
    if (requestedFields.nameEn) extractedData.nameEn = await this.extractEnglishName();
    if (requestedFields.dob) extractedData.dob = await this.extractDateOfBirth();
    if (requestedFields.gender) extractedData.gender = await this.extractGender();
    if (requestedFields.issuer) extractedData.issuer = await this.extractIssuer();
    if (requestedFields.issueDate) extractedData.issueDate = await this.extractIssueDate();
    if (requestedFields.expireDate) extractedData.expireDate = await this.extractExpireDate();
    if (requestedFields.address) extractedData.address = await this.extractAddress();
    if (requestedFields.photo) extractedData.photo = await this.extractPhoto();

    return extractedData;
  }

  // #region Private Initialization Methods

  /**
   * Initialize card communication for personal data reading
   */
  private async initializeCard(): Promise<void> {
    await this.card.issueCommand(
      new CommandApdu({
        bytes: [...apduPerson.SELECT, ...apduPerson.THAI_CARD],
      }),
    );
  }

  /**
   * Create efficient field lookup object from query fields array
   */
  private createFieldLookup(queryFields: QueryField[]): Record<string, boolean> {
    return queryFields.reduce((lookup, field) => ({ ...lookup, [field]: true }), {
      cid: false,
      name: false,
      nameEn: false,
      dob: false,
      gender: false,
      issuer: false,
      issueDate: false,
      expireDate: false,
      address: false,
      photo: false,
    });
  }

  // #endregion

  // #region Data Extraction Methods

  /**
   * Extract citizen ID (13-digit identification number)
   */
  private async extractCitizenId(): Promise<string> {
    const data = await getData(this.card, apduPerson.CMD_CID, this.requestCommand);

    return data.slice(0, -2).toString().trim();
  }

  /**
   * Extract Thai name (full name in Thai script)
   */
  private async extractThaiName(): Promise<string> {
    const data = await getData(this.card, apduPerson.CMD_THFULLNAME, this.requestCommand);
    const decodedData = legacy.decode(data, 'tis620');

    return this.parseNameComponents(decodedData).fullname;
  }

  /**
   * Extract English name (full name in English script)
   */
  private async extractEnglishName(): Promise<string> {
    const data = await getData(this.card, apduPerson.CMD_ENFULLNAME, this.requestCommand);
    const decodedData = legacy.decode(data, 'tis620');

    return this.parseNameComponents(decodedData).fullname;
  }

  /**
   * Extract date of birth (converted from Buddhist to Gregorian calendar)
   */
  private async extractDateOfBirth(): Promise<string> {
    const data = await getData(this.card, apduPerson.CMD_BIRTH, this.requestCommand);
    const dateStr = data.slice(0, -2).toString().trim();

    return this.convertBuddhistToGregorianDate(dateStr);
  }

  /**
   * Extract gender (M/F)
   */
  private async extractGender(): Promise<string> {
    const data = await getData(this.card, apduPerson.CMD_GENDER, this.requestCommand);

    return data.slice(0, -2).toString().trim();
  }

  /**
   * Extract card issuer information
   */
  private async extractIssuer(): Promise<string> {
    const data = await getData(this.card, [...apduPerson.CMD_ISSUER], this.requestCommand);

    return legacy.decode(data, 'tis620').slice(0, -2).toString().trim();
  }

  /**
   * Extract card issue date (converted from Buddhist to Gregorian calendar)
   */
  private async extractIssueDate(): Promise<string> {
    const data = await getData(this.card, [...apduPerson.CMD_ISSUE], this.requestCommand);
    const dateStr = data.slice(0, -2).toString().trim();

    return this.convertBuddhistToGregorianDate(dateStr);
  }

  /**
   * Extract card expiration date (converted from Buddhist to Gregorian calendar)
   */
  private async extractExpireDate(): Promise<string> {
    const data = await getData(this.card, [...apduPerson.CMD_EXPIRE], this.requestCommand);
    const dateStr = data.slice(0, -2).toString().trim();

    return this.convertBuddhistToGregorianDate(dateStr);
  }

  /**
   * Extract full address information
   */
  private async extractAddress(): Promise<string> {
    const data = await getData(this.card, [...apduPerson.CMD_ADDRESS], this.requestCommand);
    const decodedData = legacy.decode(data, 'tis620');
    const addressStr = decodedData.slice(0, -2).toString().trim();

    if (addressStr.length === 0) {
      return '';
    }

    const addressComponents = this.parseAddressComponents(addressStr);

    return addressComponents.fullAddress;
  }

  /**
   * Extract photo data as base64 encoded string
   */
  private async extractPhoto(): Promise<string> {
    const photoHexParts: string[] = [];

    // Read photo data from all 20 segments
    for (const commandName of PersonalApplet.PHOTO_COMMANDS) {
      const command = apduPerson[commandName];
      const data = await getData(this.card, [...command], this.requestCommand);
      // Remove the last 2 bytes (status bytes) and convert to hex
      photoHexParts.push(data.toString('hex').slice(0, -4));
    }

    // Combine all photo segments and convert to base64
    const photoHex = photoHexParts.join('');

    return hex2imagebase64(photoHex);
  }

  // #endregion

  // #region Data Processing Helper Methods

  /**
   * Parse name components from decoded card data
   */
  private parseNameComponents(decodedData: Buffer): NameComponents {
    const nameArray = decodedData.slice(0, -2).toString().trim().split('#');

    const components: NameComponents = {
      prefix: nameArray[0]?.trim() || '',
      firstname: nameArray[1]?.trim() || '',
      middlename: nameArray[2]?.trim() || '',
      lastname: nameArray[3]?.trim() || '',
      fullname: '',
    };

    // Create full name from non-empty components
    components.fullname = [components.prefix, components.firstname, components.middlename, components.lastname]
      .filter((part) => part.length > 0)
      .join(' ')
      .trim();

    return components;
  }

  /**
   * Parse address components from address string
   */
  private parseAddressComponents(addressStr: string): AddressComponents {
    const addressParts = addressStr.split('#');

    const components: AddressComponents = {
      houseNo: addressParts[0]?.trim() || '',
      moo: this.extractMooNumber(addressParts[1]),
      soi: this.extractSoiName(addressParts[1]),
      street: addressParts.slice(2, -3).join(' ').trim(),
      subdistrict: this.extractSubdistrict(addressParts[addressParts.length - 3]),
      district: this.extractDistrict(addressParts[addressParts.length - 2]),
      province: this.extractProvince(addressParts[addressParts.length - 1]),
      fullAddress: '',
    };

    // Create full address from all non-empty components
    components.fullAddress = addressParts
      .filter((part) => part && part.trim().length > 0)
      .join(' ')
      .trim();

    return components;
  }

  /**
   * Extract Moo (village group) number from address part
   */
  private extractMooNumber(addressPart: string = ''): string {
    return addressPart.startsWith('หมู่ที่') ? addressPart.substring(7).trim() : '';
  }

  /**
   * Extract Soi (alley) name from address part
   */
  private extractSoiName(addressPart: string = ''): string {
    return addressPart.startsWith('ซอย') ? addressPart.substring(3).trim() : '';
  }

  /**
   * Extract subdistrict from address part
   */
  private extractSubdistrict(addressPart: string = ''): string {
    return addressPart.length >= 4 ? addressPart.substring(4).trim() : '';
  }

  /**
   * Extract district from address part (handles both เขต and อำเภอ)
   */
  private extractDistrict(addressPart: string = ''): string {
    if (addressPart.startsWith('เขต')) {
      return addressPart.substring(3).trim();
    } else if (addressPart.length >= 5) {
      return addressPart.substring(5).trim();
    }

    return '';
  }

  /**
   * Extract province from address part
   */
  private extractProvince(addressPart: string = ''): string {
    return addressPart.length >= 7 ? addressPart.substring(7).trim() : '';
  }

  /**
   * Convert Buddhist calendar date to Gregorian calendar (YYYY-MM-DD format)
   */
  private convertBuddhistToGregorianDate(buddhistDateStr: string): string {
    if (buddhistDateStr.length !== 8) {
      throw new Error(`Invalid date format: ${buddhistDateStr}. Expected YYYYMMDD.`);
    }

    const buddhistYear = parseInt(buddhistDateStr.slice(0, 4), 10);
    const month = buddhistDateStr.slice(4, 6);
    const day = buddhistDateStr.slice(6, 8);

    // Convert Buddhist year (BE) to Gregorian year (AD) by subtracting 543
    const gregorianYear = buddhistYear - 543;

    return `${gregorianYear}-${month}-${day}`;
  }

  // #endregion
}
