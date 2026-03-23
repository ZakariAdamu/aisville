const fs = require('fs');
const path = require('path');

const REQUIRED_VARS = [
  'EXPO_PUBLIC_APPWRITE_ENDPOINT',
  'EXPO_PUBLIC_APPWRITE_PROJECT_ID',
  'EXPO_PUBLIC_APPWRITE_DATABASE_ID',
  'EXPO_PUBLIC_APPWRITE_GALLERIES_TABLE_ID',
  'EXPO_PUBLIC_APPWRITE_REVIEWS_TABLE_ID',
  'EXPO_PUBLIC_APPWRITE_AGENTS_TABLE_ID',
  'EXPO_PUBLIC_APPWRITE_PROPERTIES_TABLE_ID',
  'EXPO_PUBLIC_APPWRITE_FAVORITES_TABLE_ID',
  'EXPO_PUBLIC_APPWRITE_BOOKINGS_TABLE_ID',
];

function checkEnv() {
  const projectRoot = process.cwd();
  const envPath = path.join(projectRoot, '.env');
  const easJsonPath = path.join(projectRoot, 'eas.json');

  // 1. Load .env manually if exists (useful for local dev)
  if (fs.existsSync(envPath)) {
    console.log('📄 Loading .env file for validation...');
    const content = fs.readFileSync(envPath, 'utf8');
    content.split('\n').forEach((line) => {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim().replace(/^["'](.*)["']$/, '$1');
        if (!process.env[key]) process.env[key] = value;
      }
    });
  }

  // 2. Identify missing vars in process.env
  const missing = REQUIRED_VARS.filter((key) => !process.env[key]);

  if (missing.length === 0) {
    console.log('✅ All environment variables are present.');
    return;
  }

  // 3. Fallback: Check eas.json (to prevent false positives in CI/EAS)
  if (fs.existsSync(easJsonPath)) {
    try {
      const fileContent = fs.readFileSync(easJsonPath, 'utf8');
      // Strip comments from JSONC (supports // and /* */)
      const jsonContent = fileContent.replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, '$1');
      const easConfig = JSON.parse(jsonContent);

      const profiles = easConfig.build || {};
      const foundInEas = missing.every((key) => {
        return Object.values(profiles).some((profile) => profile.env && profile.env[key]);
      });

      if (foundInEas) {
        console.log('⚠️  Variables missing from env, but found in eas.json. Build proceeds.');
        return;
      }
    } catch (e) {}
  }

  console.error('❌ Missing required environment variables:', missing.join(', '));
  process.exit(1);
}

checkEnv();
