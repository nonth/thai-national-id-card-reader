#!/usr/bin/env node

/**
 * Patches @nonth/pcsclite binding.gyp to support C++20
 * Required for Electron 38+ compatibility
 */

const fs = require('fs');
const path = require('path');

// Try multiple possible paths for pcsclite
const POSSIBLE_PATHS = [
  // When run from within thai-national-id-card-reader
  path.join(__dirname, '..', 'node_modules', '@nonth', 'pcsclite', 'binding.gyp'),
  // When run from parent project
  path.join(process.cwd(), 'node_modules', '@nonth', 'pcsclite', 'binding.gyp'),
  // When thai-national-id-card-reader is a dependency
  path.join(__dirname, '..', '..', '..', '@nonth', 'pcsclite', 'binding.gyp'),
];

let PCSCLITE_PATH = null;
for (const possiblePath of POSSIBLE_PATHS) {
  if (fs.existsSync(possiblePath)) {
    PCSCLITE_PATH = possiblePath;
    break;
  }
}

// Check if pcsclite is installed
if (!PCSCLITE_PATH) {
  console.log('⚠️  @nonth/pcsclite not found, skipping patch');
  process.exit(0);
}

console.log('🔧 Patching @nonth/pcsclite for C++20 support...');

try {
  let content = fs.readFileSync(PCSCLITE_PATH, 'utf8');

  // Check if already patched
  if (content.includes('CLANG_CXX_LANGUAGE_STANDARD')) {
    console.log('✅ Already patched, skipping');
    process.exit(0);
  }

  // Find the cflags section and add C++20 support
  const patchedContent = content.replace(
    /("cflags":\s*\[[\s\S]*?"-pedantic"\s*\],)/,
    `$1
			"cflags_cc": [
				"-std=c++20"
			],
			"xcode_settings": {
				"CLANG_CXX_LANGUAGE_STANDARD": "c++20",
				"CLANG_CXX_LIBRARY": "libc++",
				"GCC_ENABLE_CPP_EXCEPTIONS": "NO",
				"GCC_ENABLE_CPP_RTTI": "NO",
				"MACOSX_DEPLOYMENT_TARGET": "10.15",
				"OTHER_CPLUSPLUSFLAGS": [
					"-std=c++20",
					"-stdlib=libc++"
				]
			},
			"msvs_settings": {
				"VCCLCompilerTool": {
					"AdditionalOptions": [
						"/std:c++20"
					]
				}
			},`
  );

  // Also add -std=c++20 to cflags for Linux
  const finalContent = patchedContent.replace(
    /"-pedantic"/,
    '"-pedantic",\n\t\t\t\t"-std=c++20"'
  );

  fs.writeFileSync(PCSCLITE_PATH, finalContent, 'utf8');
  console.log('✅ Successfully patched @nonth/pcsclite for C++20 support');
} catch (error) {
  console.error('❌ Failed to patch @nonth/pcsclite:', error.message);
  process.exit(1);
}
