# Thai National ID Card Reader

[![npm version](https://badge.fury.io/js/thai-national-id-card-reader.svg)](https://badge.fury.io/js/thai-national-id-card-reader)
[![npm downloads](https://img.shields.io/npm/dm/thai-national-id-card-reader.svg)](https://www.npmjs.com/package/thai-national-id-card-reader)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/node/v/thai-national-id-card-reader.svg)](https://nodejs.org)

A TypeScript library for reading Thai National ID Cards using PC/SC compatible smartcard readers. Built with event-driven architecture, full type safety, and automatic data extraction capabilities.

## Features

- ✅ **Full TypeScript Support**: Complete type safety and IntelliSense support
- ✅ **Dual Module Support**: Both CommonJS (`require()`) and ESM (`import`) compatibility
- ✅ **Event-Driven Architecture**: Clean EventEmitter-based integration
- ✅ **Automatic Data Extraction**: Reads all available card data by default
- ✅ **Smart Event Management**: Intelligent card state tracking with no spurious events
- ✅ **Comprehensive Documentation**: Extensive JSDoc coverage and examples
- ✅ **Error Handling**: Robust error handling with detailed status codes
- ✅ **Modern Architecture**: Built with current JavaScript/TypeScript best practices

## Installation

```bash
# Install from npm
npm install thai-national-id-card-reader

# Or install for development
git clone https://github.com/your-username/thai-national-id-card-reader.git
cd thai-national-id-card-reader
npm install
npm run build
```

### Module Formats

The library is built to support both CommonJS and ESM module systems:

- **CommonJS**: `dist/index.cjs` - For use with `require()`
- **ESM**: `dist/index.js` - For use with `import`
- **TypeScript**: `dist/index.d.ts` - Type definitions for both formats

The package.json uses conditional exports to automatically serve the correct format based on how you import it.

## Prerequisites

### Windows
- Install Node.js (recommended: [nvm-windows](https://github.com/coreybutler/nvm-windows/releases))
- Install Windows build tools: `npm install --global windows-build-tools`

### Ubuntu & Raspberry Pi
```bash
# Install PC/SC daemon and development libraries
sudo apt-get update
sudo apt-get install libpcsclite1 libpcsclite-dev pcscd
sudo systemctl start pcscd
sudo systemctl enable pcscd
```

### macOS
- Install Xcode Command Line Tools: `xcode-select --install`
- PC/SC framework is included with macOS

## Quick Start

### CommonJS Usage
```javascript
const { ThaiIdCardReader } = require('thai-national-id-card-reader');

// Create reader instance - automatically reads ALL fields
const cardReader = new ThaiIdCardReader({
  debug: false,              // Enable for troubleshooting
  exitOnReadError: false     // Don't exit on read errors
});

// Set up event listeners
cardReader.on('device-connected', (event) => {
  console.log('✅ Card reader connected:', event.data.message);
});

cardReader.on('card-inserted', (event) => {
  console.log('💳 Card detected:', event.data.message);
});

cardReader.on('card-data', (event) => {
  const data = event.data;
  
  console.log('📄 Thai National ID Card Data:');
  console.log('├─ Citizen ID:', data.cid);
  console.log('├─ Thai Name:', data.name);
  console.log('├─ English Name:', data.nameEn);
  console.log('├─ Date of Birth:', data.dob);
  console.log('├─ Gender:', data.gender);
  console.log('├─ Address:', data.address);
  console.log('├─ Issue Date:', data.issueDate);
  console.log('├─ Expire Date:', data.expireDate);
  console.log('├─ Issuer:', data.issuer);
  console.log('├─ NHSO Data:', data.nhso ? JSON.stringify(data.nhso, null, 2) : 'Not Available');
  console.log('├─ Laser ID:', data.laserId || 'Not Available');
  console.log('└─ Photo:', data.photo ? 'Available (Base64)' : 'Not Available');
});

cardReader.on('card-removed', (event) => {
  console.log('📤 Card removed:', event.data.message);
});

cardReader.on('card-error', (event) => {
  console.error('❌ Error:', event.data.message);
});

// Initialize and start reading
cardReader.init();
console.log('🚀 Thai National ID Card Reader initialized. Insert a card...');

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\\n🛑 Shutting down...');
  cardReader.destroy();
  process.exit(0);
});
```

### ESM Usage
```javascript
import { ThaiIdCardReader } from 'thai-national-id-card-reader';

// Create reader instance - automatically reads ALL fields
const cardReader = new ThaiIdCardReader({
  debug: false,              // Enable for troubleshooting
  exitOnReadError: false     // Don't exit on read errors
});

// Set up event listeners (same as CommonJS example)
cardReader.on('device-connected', (event) => {
  console.log('✅ Card reader connected:', event.data.message);
});

cardReader.on('card-data', (event) => {
  const data = event.data;
  console.log('📄 Thai National ID Card Data:');
  console.log('├─ Citizen ID:', data.cid);
  console.log('├─ Thai Name:', data.name);
  // ... rest of data processing
});

// Initialize and start reading
cardReader.init();
console.log('🚀 Thai National ID Card Reader initialized. Insert a card...');

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down...');
  cardReader.destroy();
  process.exit(0);
});
```

### TypeScript Usage
```typescript
import { ThaiIdCardReader, ThaiIdCardData, CardDataEvent } from 'thai-national-id-card-reader';

const cardReader = new ThaiIdCardReader({
  debug: true,
  exitOnReadError: false
});

cardReader.on('card-data', (event: CardDataEvent) => {
  const data: ThaiIdCardData = event.data;
  
  // Full type safety and IntelliSense support
  if (data.cid) {
    console.log(`Thai Citizen ID: ${data.cid}`);
  }
  
  if (data.photo) {
    // Save photo or process base64 data
    console.log('Photo data received:', data.photo.substring(0, 50) + '...');
  }
  
  if (data.nhso) {
    console.log('NHSO Health Insurance Data:');
    console.log('- Main Hospital:', data.nhso.mainHospitalName);
    console.log('- Insurance Level:', data.nhso.mainInscl);
    console.log('- Valid Until:', data.nhso.expireDate);
  }
});

cardReader.init();
```

## Available Events

| Event | Description | When Triggered |
|-------|-------------|----------------|
| `device-connected` | Card reader connected | When PC/SC detects a compatible reader |
| `card-inserted` | Card physically inserted | When a Thai National ID card is inserted |
| `card-data` | Data successfully extracted | After complete data reading process |
| `card-removed` | Card physically removed | When card is removed (only if previously inserted) |
| `card-error` | Error during operations | When card reading or communication fails |
| `card-incorrect` | Invalid card type | When non-Thai ID card is inserted |
| `device-disconnected` | Card reader disconnected | When reader is unplugged or becomes unavailable |

## Module Formats

This library supports both CommonJS and ESM module formats, ensuring compatibility with different Node.js environments and bundlers.

### CommonJS (require)
```javascript
// Works in traditional Node.js environments
const { ThaiIdCardReader, ErrorCodes } = require('thai-national-id-card-reader');

// Also works with default import
const ThaiIdCardReader = require('thai-national-id-card-reader').default;
```

### ESM (import)
```javascript
// Works in modern Node.js with "type": "module" or .mjs files
import { ThaiIdCardReader, ErrorCodes } from 'thai-national-id-card-reader';

// Also works with default import
import ThaiIdCardReader from 'thai-national-id-card-reader';
```

### TypeScript
```typescript
// Full TypeScript support with both import styles
import { ThaiIdCardReader, ThaiIdCardData, CardDataEvent } from 'thai-national-id-card-reader';

// Or with require (in .ts files with CommonJS target)
import ThaiIdCardReader = require('thai-national-id-card-reader');
```

### Build Outputs
When you install the package, you get:
- `dist/index.cjs` - CommonJS build with proper `exports` object
- `dist/index.js` - ESM build with standard ES module exports
- `dist/index.d.ts` - TypeScript type definitions for both formats

The package.json uses conditional exports to automatically serve the correct format:
```json
{
  "main": "dist/index.cjs",
  "module": "dist/index.js",
  "types": "dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs",
      "default": "./dist/index.js"
    }
  }
}
```

## Card Data Structure

The library automatically extracts all available data from Thai National ID Cards:

```typescript
interface ThaiIdCardData {
  cid?: string;        // Citizen ID (13 digits)
  name?: string;       // Full name in Thai script
  nameEn?: string;     // Full name in English script
  dob?: string;        // Date of birth (YYYY-MM-DD)
  gender?: string;     // Gender (M/F)
  issuer?: string;     // Card issuing organization
  issueDate?: string;  // Issue date (YYYY-MM-DD)
  expireDate?: string; // Expiration date (YYYY-MM-DD)
  address?: string;    // Complete address
  photo?: string;      // Base64-encoded photograph (JPEG)
  nhso?: NhsoData;     // Health insurance data (if available)
  laserId?: string;    // Laser-engraved ID (if available)
}

// NHSO Health Insurance Data Structure
interface NhsoData {
  mainInscl?: string;           // Main insurance level information
  subInscl?: string;            // Sub insurance level information
  mainHospitalName?: string;    // Main hospital name
  subHospitalName?: string;     // Sub hospital name
  paidType?: string;            // Paid type information
  issueDate?: string;           // NHSO card issue date (YYYY-MM-DD)
  expireDate?: string;          // NHSO card expiration date (YYYY-MM-DD)
  updateDate?: string;          // Last update date (YYYY-MM-DD)
  changeHospitalAmount?: string; // Hospital change amount
}
```

## Configuration Options

```typescript
interface CardReaderOptions {
  /** Exit process on card read errors (default: true) */
  exitOnReadError?: boolean;
  
  /** Enable debug logging (default: false) */
  debug?: boolean;
}
```

## Running the Example

For development and testing purposes, you can run the included example:

```bash
# Build the project (for development)
npm run build

# Run the working example
npm run example

# Or run directly
node example.js
```

**Note**: This is for testing the library during development. When using the library in your own project, import it as shown in the [Quick Start](#quick-start) section.

## API Reference

### ThaiIdCardReader Class

#### Constructor
```typescript
new ThaiIdCardReader(options?: CardReaderOptions)
```

#### Methods
- `init(): void` - Initialize card reader and start device detection
- `destroy(): void` - Clean up resources and stop the reader
- `isReady(): boolean` - Check if reader is initialized and ready
- `hasCardInserted(): boolean` - Check if a card is currently inserted

#### Events
The reader extends EventEmitter with fully typed events. All events include:
- `status: number` - HTTP-style status code
- `description: string` - Human-readable description
- `data: object` - Event-specific data payload

## Advanced Usage

### Error Handling
```javascript
cardReader.on('card-error', (event) => {
  console.error(`Error (${event.status}): ${event.description}`);
  console.error('Details:', event.data.message);
  
  switch (event.status) {
    case 400:
      console.log('Please insert a valid Thai National ID Card');
      break;
    case 404:
      console.log('Card reader not found - check connections');
      break;
    case 500:
      console.log('Card reading failed:', event.data.error);
      break;
  }
});
```

### Promise-Based Usage
```javascript
function readCardData() {
  return new Promise((resolve, reject) => {
    const reader = new ThaiIdCardReader({ exitOnReadError: false });
    
    reader.once('card-data', (event) => {
      reader.destroy();
      resolve(event.data);
    });
    
    reader.once('card-error', (event) => {
      reader.destroy();
      reject(new Error(event.data.message));
    });
    
    reader.init();
  });
}

// Usage
readCardData()
  .then(data => console.log('Card data:', data))
  .catch(error => console.error('Failed to read card:', error));
```

## Troubleshooting

### Card Reader Not Detected
```bash
# Check if PC/SC daemon is running (Linux)
sudo systemctl status pcscd

# List available readers
pcsc_scan

# Check for hardware connection
lsusb  # Linux
system_profiler SPUSBDataType  # macOS
```

### Build Issues
- Ensure you have the correct build tools for your platform
- Install Python 2.7.x for native module compilation
- On Windows, try `npm install --global --production windows-build-tools`

### Card Reading Errors
- Clean the card contacts with a soft, dry cloth
- Ensure the card is properly inserted (gold contacts down)
- Try with multiple cards to rule out card-specific issues
- Enable debug mode: `new ThaiIdCardReader({ debug: true })`

## Development

```bash
# Install dependencies
npm install

# Development mode (watch for changes)
npm run dev

# Code quality
npm run lint          # Check code style
npm run lint:fix      # Fix automatic issues
npm run format        # Format with Prettier
npm run typecheck     # TypeScript checking

# Testing
npm run build && npm run example
```

## Architecture

The library uses a modular architecture with clear separation of concerns:

- **ThaiIdCardReader** - Main class handling device/card events and orchestration
- **PersonalApplet** - Handles extraction of personal information and photo data
- **NhsoApplet** - Handles health insurance data (placeholder implementation)
- **CardReaderEventEmitter** - Type-safe event system with full TypeScript support
- **APDU Commands** - Low-level smartcard communication protocols

## Error Codes

The library uses HTTP-style status codes for consistent error handling:

- `200` - Success (data read successfully)
- `201` - Device activated (reader connected)
- `202` - Card inserted
- `205` - Card removed
- `400` - Incorrect card type
- `404` - Device not found
- `500` - Internal error (card read failure, communication error)

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes with proper tests
4. Ensure code quality: `npm run lint && npm run typecheck`
5. Test with actual hardware: `npm run build && npm run example`
6. Commit with clear messages: `git commit -m 'Add amazing feature'`
7. Push to branch: `git push origin feature/amazing-feature`
8. Open a Pull Request

## License

MIT License - see LICENSE file for details.

## Requirements

- **Hardware**: PC/SC compatible smartcard reader
- **Cards**: Thai National ID Cards (Government issued)
- **Node.js**: Version 14.x or higher
- **Operating System**: Windows 10+, macOS 10.14+, Ubuntu 18.04+

---

**⚠️ Important**: This library requires physical smartcard reader hardware and valid Thai National ID Cards to function. It is intended for legitimate applications that require identity verification or data extraction from Thai government-issued identification cards.
