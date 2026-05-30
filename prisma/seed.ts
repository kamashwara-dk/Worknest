import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.local for the seed script (tsx doesn't load it automatically)
config({ path: resolve(process.cwd(), '.env.local') });

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ─── CONFIGURE YOUR ADMIN HERE ───────────────────────────────────────────────
// After running this seed, create a matching Supabase auth user with the same
// email. Then update ADMIN_SUPABASE_ID below with the UUID from Supabase Auth.
const ADMIN_EMAIL = 'admin@worknest.app';
const ADMIN_NAME = 'Admin';
// Paste the UUID from Supabase Auth → Users after you create the auth account.
// Until then, this is a placeholder — the account won't be able to log in.
const ADMIN_SUPABASE_ID = '1248ebf0-1bbc-43cc-a313-886496c2ccef';
// ─────────────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🧹 Clearing all existing data...');

  await prisma.notification.deleteMany();
  await prisma.message.deleteMany();
  await prisma.leaveRequest.deleteMany();
  await prisma.task.deleteMany();
  await prisma.document.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.channel.deleteMany();
  await prisma.user.deleteMany();

  console.log('✅ All data cleared');

  console.log('👤 Creating admin user...');

  const admin = await prisma.user.create({
    data: {
      supabaseId: ADMIN_SUPABASE_ID,
      email: ADMIN_EMAIL,
      name: ADMIN_NAME,
      role: 'ADMIN',
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(ADMIN_NAME)}&background=178582&color=fff&size=128`,
    },
  });

  console.log(`✅ Admin user created: ${admin.email} (id: ${admin.id})`);

  console.log('\n🎉 Seed completed!');
  console.log('\n─────────────────────────────────────────────────────────');
  console.log('NEXT STEPS to make the admin account loginable:');
  console.log('');
  console.log('1. Go to your Supabase dashboard:');
  console.log('   https://supabase.com/dashboard/project/ejwurpeeinbygxiixuhm/auth/users');
  console.log('');
  console.log('2. Click "Add user" → "Create new user"');
  console.log(`   Email:    ${ADMIN_EMAIL}`);
  console.log('   Password: (choose a strong password)');
  console.log('   ✅ Check "Auto Confirm User"');
  console.log('');
  console.log('3. Copy the UUID shown for the new user');
  console.log('');
  console.log('4. Edit prisma/seed.ts and replace ADMIN_SUPABASE_ID:');
  console.log("   const ADMIN_SUPABASE_ID = 'paste-uuid-here';");
  console.log('');
  console.log('5. Run the seed again:');
  console.log('   npm run db:seed');
  console.log('─────────────────────────────────────────────────────────\n');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
