// Simple JavaScript example that can be run after building
const { ThaiIdCardReader } = require('./dist/index.cjs');

console.log('🚀 Thai National ID Card Reader - JavaScript Example');
console.log('Make sure you have built the project: npm run build');
console.log('');

// Create card reader with basic configuration
const cardReader = new ThaiIdCardReader({
  // debug: true,
  exitOnReadError: false,
});

// Event listeners
cardReader.on('device-connected', (event) => {
  console.log('✅ Device connected:', event.data.message);
});

cardReader.on('card-inserted', (event) => {
  console.log('💳 Card inserted:', event.data.message);
});

cardReader.on('card-data', (event) => {
  console.log('📄 Card data received:');
  console.log('Citizen ID:', event.data.cid);
  console.log('Name:', event.data.name);
  console.log('Date of Birth:', event.data.dob);
  console.log('Gender:', event.data.gender);
  console.log('Full data:', JSON.stringify(event.data, null, 2));
});

cardReader.on('card-error', (event) => {
  console.error('❌ Error:', event.data.message);
});

cardReader.on('card-removed', (_event) => {
  console.log('📤 Card removed');
});

// Initialize
try {
  cardReader.init();
  console.log('✅ Card reader initialized. Insert a Thai ID card...');
} catch (error) {
  console.error('❌ Failed to initialize:', error.message);
  process.exit(1);
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\\n🛑 Shutting down...');
  cardReader.destroy();
  process.exit(0);
});
