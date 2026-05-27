// This script generates environment files from environment variables
// Used during Vercel build to inject secrets securely

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { dirname } from 'path';

const envPath = './src/environments/environment.ts';
const envProdPath = './src/environments/environment.prod.ts';

// Get environment variables with fallbacks for local development
const supabaseUrl = process.env.SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';
const stripePublishableKey = process.env.STRIPE_PUBLISHABLE_KEY || 'YOUR_STRIPE_PUBLISHABLE_KEY';
const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';

const environmentContent = `export const environment = {
  production: ${isProduction},
  supabase: {
    url: '${supabaseUrl}',
    anonKey: '${supabaseAnonKey}'
  },
  stripe: {
    publishableKey: '${stripePublishableKey}'
  }
};
`;

// Ensure directory exists
const dir = dirname(envPath);
if (!existsSync(dir)) {
  mkdirSync(dir, { recursive: true });
}

// Write environment files
writeFileSync(envPath, environmentContent);
writeFileSync(envProdPath, environmentContent.replace('production: false', 'production: true'));

console.log('✅ Environment files generated successfully');
console.log(`   - ${envPath}`);
console.log(`   - ${envProdPath}`);
console.log(`   - Production mode: ${isProduction}`);
console.log(`   - Supabase URL: ${supabaseUrl.substring(0, 30)}...`);
