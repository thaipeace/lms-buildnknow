const { execSync } = require('child_process');

if (process.env.BUILDING_NEXT_APP === 'true') {
  // This branch is executed when OpenNext calls `npm run build` internally to compile Next.js
  console.log('⚡ OpenNext sub-process: Running `next build`...');
  execSync('npx next build', { stdio: 'inherit' });
} else {
  // This branch is executed when Cloudflare triggers `npm run build`
  console.log('🚀 Top-level build: Starting OpenNext Cloudflare build...');
  execSync('npx @opennextjs/cloudflare build', {
    stdio: 'inherit',
    env: {
      ...process.env,
      BUILDING_NEXT_APP: 'true',
    },
  });
  console.log('🎉 OpenNext Cloudflare build finished successfully!');
}
