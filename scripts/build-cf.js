const fs = require('fs');
const { execSync } = require('child_process');

console.log('🚀 Preparing build for Cloudflare Pages...');

// 1. Temporarily move src/app/api so Next.js doesn't fail static export
const hasApi = fs.existsSync('src/app/api');
if (hasApi) {
  fs.renameSync('src/app/api', '.api-local');
}

// 2. Clear stale .next cache
if (fs.existsSync('.next')) {
  fs.rmSync('.next', { recursive: true, force: true });
}

try {
  console.log('📦 Executing Next.js static export with NEXT_EXPORT=true...');
  execSync('npx next build', {
    stdio: 'inherit',
    env: { ...process.env, NEXT_EXPORT: 'true' },
  });
  console.log('✅ Next.js static export completed successfully to out/');
} catch (error) {
  console.error('❌ Build failed:', error);
  process.exit(1);
} finally {
  if (fs.existsSync('.api-local')) {
    fs.renameSync('.api-local', 'src/app/api');
  }
  console.log('🔄 Restored local development configuration.');
}
