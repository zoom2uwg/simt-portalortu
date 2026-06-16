const fs = require('fs');
const path = require('path');

// Custom simple .env parser to avoid external dependencies
function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const index = trimmed.indexOf('=');
      if (index > 0) {
        const key = trimmed.substring(0, index).trim();
        let val = trimmed.substring(index + 1).trim();
        // Remove quotes if present
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.substring(1, val.length - 1);
        }
        process.env[key] = val;
      }
    }
  }
}

loadEnv();

const schemaPath = path.join(__dirname, 'schema.prisma');
let schemaContent = fs.readFileSync(schemaPath, 'utf8');

// Determine provider
let provider = process.env.DATABASE_PROVIDER;
const dbUrl = process.env.DATABASE_URL || '';

if (!provider) {
  if (dbUrl.startsWith('postgresql://') || dbUrl.startsWith('postgres://')) {
    provider = 'postgresql';
  } else if (dbUrl.startsWith('mysql://')) {
    provider = 'mysql';
  } else if (dbUrl.startsWith('file:') || dbUrl.includes('.db') || dbUrl.includes('.sqlite')) {
    provider = 'sqlite';
  } else {
    provider = 'sqlite'; // fallback default
  }
}

// Ensure valid provider
const validProviders = ['sqlite', 'postgresql', 'mysql'];
if (!validProviders.includes(provider)) {
  console.error(`Error: Provider "${provider}" is not supported. Choose one of: ${validProviders.join(', ')}`);
  process.exit(1);
}

console.log(`Setting up Prisma for provider: "${provider}"`);

// Replace provider in schema.prisma
// Regex matches: provider  = "any_provider" OR provider = env("DATABASE_PROVIDER")
const providerRegex = /provider\s*=\s*(?:"(sqlite|postgresql|mysql)"|env\("DATABASE_PROVIDER"\))/g;
if (providerRegex.test(schemaContent)) {
  schemaContent = schemaContent.replace(providerRegex, `provider  = "${provider}"`);
  fs.writeFileSync(schemaPath, schemaContent, 'utf8');
  console.log(`Successfully updated database provider in schema.prisma to "${provider}"`);
} else {
  console.warn('Warning: Could not find provider line in schema.prisma to replace. Check schema format.');
}
