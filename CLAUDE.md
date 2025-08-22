# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Build and Development
```bash
npm run build        # Compile TypeScript to CommonJS in dist/
npm run dev          # Watch mode compilation  
npm run typecheck    # Type checking without emit
npm run example      # Run the working example (requires build first)
```

### Code Quality
```bash
npm run lint         # ESLint check
npm run lint:fix     # Auto-fix ESLint issues
npm run format       # Format with Prettier
npm run format:check # Check Prettier formatting
```

### Testing the Library
```bash
npm run build && npm run example  # Build and test with example
node example.js                   # Direct example execution
```

## Architecture Overview

### Core Library Design
This is a **modern TypeScript library for reading Thai National ID Cards** that compiles to CommonJS. The library uses an **event-driven architecture** with comprehensive type safety and automatic data extraction.

### Key Architectural Decisions

**1. Event-Driven Flow with Smart State Management**
```
Device Detection → Card Insertion → Data Reading → Event Emission
```
- Uses typed EventEmitter with comprehensive event interfaces
- Implements `cardInserted` state tracking to prevent spurious `card-removed` events
- All events include HTTP-style status codes, descriptions, and typed data

**2. Modular Applet Architecture**
- `PersonalApplet` - Handles all personal information extraction (ID, names, address, photo)
- `NhsoApplet` - Handles health insurance data (fully implemented with actual APDU commands)
- `ThaiIdCardReader` - Main orchestration class with comprehensive error handling

**3. Comprehensive Type System**
- Complete TypeScript interfaces for all data structures and events
- Union types for query fields and event types
- Custom error classes with status codes and error categorization

### Critical Implementation Details

**Module Configuration:**
- **Output**: CommonJS (`module: "commonjs"` in tsconfig)
- **Import Style**: Mixed (CommonJS `require()` for smartcard lib, ES6 for internal modules)
- **Package.json**: No `"type": "module"` - uses CommonJS by default
- **Project Name**: `@thainationalid/card-reader` (scoped package name)

**Automatic Data Extraction:**
- Library reads **ALL available fields by default** (12 data fields)
- No configuration needed - automatically extracts: ID, names, dates, address, photo, NHSO, laser ID
- Smart error handling for optional fields (NHSO and laser ID gracefully fail)

**Enhanced Event Management:**
- `cardInserted` boolean prevents false `card-removed` events after device activation
- Events only fire for actual state changes, not hardware artifacts
- Comprehensive debug logging with `[ThaiIdCardReader]` prefixes
- Status codes follow HTTP conventions (200, 201, 202, 400, 404, 500)

**Data Processing Pipeline:**
1. `ThaiIdCardReader.extractCardData()` - Main orchestration
2. `PersonalApplet.getInfo()` - Extracts 10 personal fields via APDU commands  
3. `NhsoApplet.getInfo()` - Extracts health data (placeholder)
4. `getLaser()` utility - Extracts laser ID
5. All data combined into `ThaiIdCardData` interface

### File Structure & Responsibilities

```
src/
├── thai-card-reader.ts          # Main ThaiIdCardReader class (comprehensive refactor)
├── event-emitter.ts             # Enhanced typed EventEmitter wrapper  
├── types/index.d.ts             # Complete type definitions with documentation
├── applets/
│   ├── personal-applet.ts       # Refactored with helper methods & clear structure
│   └── nhso-applet.ts           # Full NHSO implementation with actual data extraction
├── apdu/
│   ├── person.ts                # Well-documented APDU commands with sections
│   └── nhso.ts                  # Complete NHSO APDU commands based on proven Go implementation
├── utils/                       # Helper functions (data parsing, etc.)
└── index.ts                     # Clean public API exports
```

### Refactored ThaiIdCardReader Architecture

**Class Structure:**
- **Regions**: `#region` comments organize code into logical sections
- **Private Methods**: Clear separation of concerns with descriptive method names
- **Status Constants**: `STATUS` object with HTTP-style codes for consistency
- **Error Handling**: Comprehensive try-catch with detailed error messages
- **Debug System**: Consistent logging with `[ThaiIdCardReader]` prefixes

**Method Organization:**
- **Public API**: `init()`, `destroy()`, `isReady()`, `hasCardInserted()`
- **Device Events**: `handleDeviceConnected()`, `handleDeviceDisconnected()`, `handleDeviceError()`
- **Card Events**: `handleCardInserted()`, `handleCardRemoved()`, `handleCardError()`
- **Data Processing**: `extractCardData()`, `extractPersonalData()`, `extractHealthData()`, `extractLaserData()`

### Enhanced PersonalApplet Architecture

**Extraction Methods:**
- Individual methods for each data type: `extractCitizenId()`, `extractThaiName()`, etc.
- Helper methods for data parsing: `parseNameComponents()`, `parseAddressComponents()`
- Date conversion utility: `convertBuddhistToGregorianDate()`
- Address parsing utilities: `extractMooNumber()`, `extractSoiName()`, etc.

### Type System Enhancements

**Core Interfaces:**
- `ThaiIdCardData` - Complete card data with JSDoc documentation
- `NhsoData` - Structured health insurance data interface
- `CardReaderOptions` - Configuration with detailed descriptions

**Event System:**
- `CardEvent` base interface with status/description/data pattern
- Specific event interfaces: `CardInsertedEvent`, `CardDataEvent`, etc.
- `CardReaderEvents` mapping for full type safety

**Error Handling:**
- `ThaiIdCardReaderError` custom error class with codes and status
- `ErrorCodes` enum for programmatic error handling
- Status code helpers and description functions

### Native Dependencies & Hardware

**Critical Requirements:**
- **Windows**: Windows build tools, PC/SC service
- **macOS**: Xcode command line tools (PC/SC included)  
- **Linux**: `libpcsclite1`, `libpcsclite-dev`, `pcscd` service

**Hardware Support:**
- PC/SC compatible smartcard readers
- Thai National ID Cards (government issued)
- Real-time card insertion/removal detection

### Example Integration Pattern

The refactored `example.js` demonstrates best practices:
- CommonJS `require('./dist/index.js')` import
- `exitOnReadError: false` for development safety
- Proper event handling for all event types
- Graceful shutdown with SIGINT handler

### NHSO Health Insurance Data

**Implementation Status:**
- ✅ **Fully Implemented**: Complete NHSO data extraction using actual APDU commands
- ✅ **Real Commands**: Based on proven Go implementation from `thai-smartcard-nodejs`
- ✅ **Data Fields**: 9 specific health insurance fields supported
- ✅ **Date Conversion**: Buddhist to Gregorian calendar conversion
- ✅ **Text Encoding**: TIS-620 Thai text support

**NHSO Data Fields:**
- Main/Sub insurance levels (`mainInscl`, `subInscl`)
- Main/Sub hospital names (`mainHospitalName`, `subHospitalName`) 
- Payment type information (`paidType`)
- Issue/Expire/Update dates with calendar conversion
- Hospital change tracking (`changeHospitalAmount`)

**APDU Commands:**
- `SELECT`: NHSO applet activation with proper AID
- 9 data extraction commands for different fields
- Proper error handling for cards without NHSO data

### Testing & Validation Strategy

**Hardware-Dependent Testing:**
- Primary validation through `npm run example` with actual hardware
- No unit tests for hardware integration (would require mocking)
- Manual testing workflow: Build → Run example → Insert/remove card
- Debug mode enables APDU command/response logging
- NHSO data validation requires cards with health insurance information

**Quality Assurance:**
- TypeScript strict mode with comprehensive type checking
- ESLint + Prettier for code consistency
- Full JSDoc documentation for public APIs
- Error boundary testing with invalid cards

### Development Workflow

**Code Changes:**
1. Modify source in `src/`
2. Run `npm run build` to compile
3. Test with `npm run example`
4. Validate with `npm run lint && npm run typecheck`

**Architecture Principles:**
- **Separation of Concerns**: Each applet handles specific data types
- **Error Resilience**: Graceful degradation for optional data
- **Type Safety**: Comprehensive TypeScript coverage
- **Event Clarity**: Clear, well-documented event flows
- **Hardware Abstraction**: Clean separation between hardware interface and business logic