const { execSync } = require('child_process');
process.env.DATABASE_URL = "postgresql://neondb_owner:npg_Auq9Wymxo5gR@ep-sparkling-base-am51xu4l-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";
try {
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('Prisma generated successfully.');
} catch (e) {
  console.error('Prisma generation failed:', e.message);
}
