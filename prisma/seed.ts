import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ─── Admin credentials ────────────────────────────────────────────────────────
const ADMIN_EMAIL = 'admin@worknest.app';
const ADMIN_NAME = 'Admin';
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
  await prisma.note.deleteMany();
  await prisma.invitation.deleteMany();
  await prisma.membership.deleteMany();
  await prisma.workspace.deleteMany();
  await prisma.user.deleteMany();

  console.log('✅ All data cleared');

  // Create admin user
  const admin = await prisma.user.create({
    data: {
      supabaseId: ADMIN_SUPABASE_ID,
      email: ADMIN_EMAIL,
      name: ADMIN_NAME,
      role: 'ADMIN',
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(ADMIN_NAME)}&background=178582&color=fff&size=128`,
    },
  });
  console.log(`✅ Admin user created: ${admin.email}`);

  // Create default workspace owned by admin
  const workspace = await prisma.workspace.create({
    data: {
      name: 'My Workspace',
      slug: 'my-workspace',
      ownerId: admin.id,
      memberships: {
        create: { userId: admin.id, role: 'OWNER' },
      },
      channels: {
        create: [
          { name: 'general', description: 'General team discussions' },
          { name: 'announcements', description: 'Company announcements' },
        ],
      },
    },
  });
  console.log(`✅ Default workspace created: "${workspace.name}" (slug: ${workspace.slug})`);

  console.log('\n🎉 Seed completed!');
  console.log('\n─────────────────────────────────────────────────────────');
  console.log('Login credentials:');
  console.log(`  Email:  ${ADMIN_EMAIL}`);
  console.log('  Password: (the one you set in Supabase Auth)');
  console.log('');
  console.log('After login you will be redirected to /workspaces');
  console.log(`Your workspace: /w/${workspace.slug}/dashboard`);
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
