import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clean up
  await prisma.notification.deleteMany();
  await prisma.message.deleteMany();
  await prisma.leaveRequest.deleteMany();
  await prisma.task.deleteMany();
  await prisma.document.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.channel.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  const users = await Promise.all([
    prisma.user.create({
      data: {
        supabaseId: 'seed-admin-001',
        email: 'admin@worknest.app',
        name: 'Alexandra Chen',
        role: 'ADMIN',
        department: 'Engineering',
        designation: 'CTO',
        phone: '+1 (555) 001-0001',
        avatar: 'https://ui-avatars.com/api/?name=Alexandra+Chen&background=6366F1&color=fff&size=128',
      },
    }),
    prisma.user.create({
      data: {
        supabaseId: 'seed-manager-001',
        email: 'manager@worknest.app',
        name: 'Marcus Johnson',
        role: 'MANAGER',
        department: 'Product',
        designation: 'Product Manager',
        phone: '+1 (555) 002-0002',
        avatar: 'https://ui-avatars.com/api/?name=Marcus+Johnson&background=10B981&color=fff&size=128',
      },
    }),
    prisma.user.create({
      data: {
        supabaseId: 'seed-emp-001',
        email: 'sarah@worknest.app',
        name: 'Sarah Williams',
        role: 'EMPLOYEE',
        department: 'Engineering',
        designation: 'Senior Engineer',
        phone: '+1 (555) 003-0003',
        avatar: 'https://ui-avatars.com/api/?name=Sarah+Williams&background=F59E0B&color=fff&size=128',
      },
    }),
    prisma.user.create({
      data: {
        supabaseId: 'seed-emp-002',
        email: 'james@worknest.app',
        name: 'James Park',
        role: 'EMPLOYEE',
        department: 'Design',
        designation: 'UI/UX Designer',
        phone: '+1 (555) 004-0004',
        avatar: 'https://ui-avatars.com/api/?name=James+Park&background=EC4899&color=fff&size=128',
      },
    }),
    prisma.user.create({
      data: {
        supabaseId: 'seed-emp-003',
        email: 'priya@worknest.app',
        name: 'Priya Patel',
        role: 'EMPLOYEE',
        department: 'Marketing',
        designation: 'Marketing Specialist',
        phone: '+1 (555) 005-0005',
        avatar: 'https://ui-avatars.com/api/?name=Priya+Patel&background=8B5CF6&color=fff&size=128',
      },
    }),
  ]);

  const [admin, manager, sarah, james, priya] = users;
  console.log('✅ Created 5 users');

  // Create channels
  const channels = await Promise.all([
    prisma.channel.create({
      data: {
        name: 'general',
        description: 'General team discussions',
        isPrivate: false,
      },
    }),
    prisma.channel.create({
      data: {
        name: 'engineering',
        description: 'Engineering team channel',
        isPrivate: false,
      },
    }),
    prisma.channel.create({
      data: {
        name: 'announcements',
        description: 'Company announcements',
        isPrivate: false,
      },
    }),
  ]);

  const [general, engineering, announcementsChannel] = channels;
  console.log('✅ Created 3 channels');

  // Create messages
  const messageData = [
    { channelId: general.id, senderId: admin.id, content: 'Good morning team! 👋 Ready for a productive week?' },
    { channelId: general.id, senderId: sarah.id, content: 'Morning! Yes, excited about the new sprint.' },
    { channelId: general.id, senderId: james.id, content: 'Hey everyone! Just finished the new design mockups.' },
    { channelId: general.id, senderId: manager.id, content: 'Great work James! Can you share them in the design channel?' },
    { channelId: general.id, senderId: priya.id, content: 'The marketing campaign is going live tomorrow 🚀' },
    { channelId: general.id, senderId: admin.id, content: 'Awesome! Let\'s make sure everything is ready.' },
    { channelId: general.id, senderId: sarah.id, content: 'I\'ll do a final review of the API endpoints today.' },
    { channelId: general.id, senderId: james.id, content: 'The new UI components are looking great!' },
    { channelId: general.id, senderId: manager.id, content: 'Sprint review is at 3pm today. Don\'t forget!' },
    { channelId: general.id, senderId: priya.id, content: 'Will be there! 📅' },
    { channelId: engineering.id, senderId: sarah.id, content: 'Just pushed the authentication refactor. Please review when you get a chance.' },
    { channelId: engineering.id, senderId: admin.id, content: 'On it! The new tRPC setup looks clean.' },
    { channelId: engineering.id, senderId: sarah.id, content: 'Thanks! I also optimized the database queries.' },
    { channelId: engineering.id, senderId: admin.id, content: 'Performance improvements are significant. Nice work!' },
    { channelId: engineering.id, senderId: sarah.id, content: 'Working on the real-time features next.' },
    { channelId: engineering.id, senderId: admin.id, content: 'Supabase Realtime should handle that well.' },
    { channelId: engineering.id, senderId: sarah.id, content: 'Agreed. The subscription setup is straightforward.' },
    { channelId: engineering.id, senderId: admin.id, content: 'Let me know if you need help with the presence feature.' },
    { channelId: engineering.id, senderId: sarah.id, content: 'Will do! Almost done with the typing indicators.' },
    { channelId: engineering.id, senderId: admin.id, content: 'Great progress! 🎉' },
    { channelId: announcementsChannel.id, senderId: admin.id, content: 'Welcome to WorkNest! This is our new team hub.' },
    { channelId: announcementsChannel.id, senderId: manager.id, content: 'Excited to have everyone onboard!' },
    { channelId: announcementsChannel.id, senderId: admin.id, content: 'Q2 planning starts next Monday. Please prepare your team updates.' },
    { channelId: announcementsChannel.id, senderId: manager.id, content: 'The new leave policy is now in effect. Check the documents section.' },
    { channelId: announcementsChannel.id, senderId: admin.id, content: 'Team lunch this Friday at 12:30pm! 🍕' },
    { channelId: announcementsChannel.id, senderId: sarah.id, content: 'Can\'t wait! 😄' },
    { channelId: announcementsChannel.id, senderId: james.id, content: 'Count me in!' },
    { channelId: announcementsChannel.id, senderId: priya.id, content: 'Looking forward to it!' },
    { channelId: announcementsChannel.id, senderId: manager.id, content: 'Performance reviews are due by end of month.' },
    { channelId: announcementsChannel.id, senderId: admin.id, content: 'New office equipment has arrived. See IT for setup.' },
  ];

  await prisma.message.createMany({ data: messageData });
  console.log('✅ Created 30 messages');

  // Create tasks
  const taskData = [
    { title: 'Design new onboarding flow', status: 'DONE' as const, priority: 'HIGH' as const, assigneeId: james.id, creatorId: manager.id, tags: ['design', 'ux'], order: 0 },
    { title: 'Implement authentication with Supabase', status: 'DONE' as const, priority: 'URGENT' as const, assigneeId: sarah.id, creatorId: admin.id, tags: ['backend', 'auth'], order: 1 },
    { title: 'Set up CI/CD pipeline', status: 'DONE' as const, priority: 'HIGH' as const, assigneeId: admin.id, creatorId: admin.id, tags: ['devops'], order: 2 },
    { title: 'Write API documentation', status: 'IN_REVIEW' as const, priority: 'MEDIUM' as const, assigneeId: sarah.id, creatorId: manager.id, tags: ['docs', 'api'], order: 0 },
    { title: 'Create marketing landing page', status: 'IN_REVIEW' as const, priority: 'HIGH' as const, assigneeId: priya.id, creatorId: manager.id, tags: ['marketing', 'design'], order: 1 },
    { title: 'Optimize database queries', status: 'IN_PROGRESS' as const, priority: 'HIGH' as const, assigneeId: sarah.id, creatorId: admin.id, tags: ['backend', 'performance'], order: 0 },
    { title: 'Build real-time chat feature', status: 'IN_PROGRESS' as const, priority: 'URGENT' as const, assigneeId: sarah.id, creatorId: admin.id, tags: ['feature', 'realtime'], order: 1 },
    { title: 'Design component library', status: 'IN_PROGRESS' as const, priority: 'MEDIUM' as const, assigneeId: james.id, creatorId: manager.id, tags: ['design', 'components'], order: 2 },
    { title: 'Set up analytics dashboard', status: 'IN_PROGRESS' as const, priority: 'MEDIUM' as const, assigneeId: admin.id, creatorId: admin.id, tags: ['analytics', 'frontend'], order: 3 },
    { title: 'Write unit tests for auth module', status: 'TODO' as const, priority: 'HIGH' as const, assigneeId: sarah.id, creatorId: admin.id, tags: ['testing', 'auth'], order: 0 },
    { title: 'Implement leave management system', status: 'TODO' as const, priority: 'MEDIUM' as const, assigneeId: sarah.id, creatorId: manager.id, tags: ['feature', 'hr'], order: 1 },
    { title: 'Create email notification templates', status: 'TODO' as const, priority: 'LOW' as const, assigneeId: priya.id, creatorId: manager.id, tags: ['email', 'design'], order: 2 },
    { title: 'Set up Upstash Redis caching', status: 'TODO' as const, priority: 'MEDIUM' as const, assigneeId: admin.id, creatorId: admin.id, tags: ['backend', 'performance'], order: 3 },
    { title: 'Mobile responsive design review', status: 'TODO' as const, priority: 'HIGH' as const, assigneeId: james.id, creatorId: manager.id, tags: ['design', 'mobile'], order: 4 },
    { title: 'Implement file upload with Supabase Storage', status: 'TODO' as const, priority: 'MEDIUM' as const, assigneeId: sarah.id, creatorId: admin.id, tags: ['feature', 'storage'], order: 5 },
    { title: 'Q2 marketing campaign planning', status: 'TODO' as const, priority: 'HIGH' as const, assigneeId: priya.id, creatorId: manager.id, tags: ['marketing', 'planning'], order: 6 },
    { title: 'Security audit and penetration testing', status: 'TODO' as const, priority: 'URGENT' as const, assigneeId: admin.id, creatorId: admin.id, tags: ['security'], order: 7 },
    { title: 'User feedback collection and analysis', status: 'TODO' as const, priority: 'LOW' as const, assigneeId: priya.id, creatorId: manager.id, tags: ['research', 'ux'], order: 8 },
    { title: 'Implement dark mode toggle', status: 'TODO' as const, priority: 'LOW' as const, assigneeId: james.id, creatorId: manager.id, tags: ['frontend', 'ui'], order: 9 },
    { title: 'Set up error monitoring with Sentry', status: 'TODO' as const, priority: 'MEDIUM' as const, assigneeId: admin.id, creatorId: admin.id, tags: ['monitoring', 'devops'], order: 10 },
  ];

  await prisma.task.createMany({ data: taskData });
  console.log('✅ Created 20 tasks');

  // Create leave requests
  const now = new Date();
  const leaveData = [
    {
      userId: sarah.id,
      type: 'SICK' as const,
      startDate: new Date(now.getFullYear(), now.getMonth(), 15),
      endDate: new Date(now.getFullYear(), now.getMonth(), 17),
      reason: 'Feeling unwell, need to rest and recover.',
      status: 'APPROVED' as const,
      approvedBy: manager.id,
    },
    {
      userId: james.id,
      type: 'CASUAL' as const,
      startDate: new Date(now.getFullYear(), now.getMonth() + 1, 5),
      endDate: new Date(now.getFullYear(), now.getMonth() + 1, 7),
      reason: 'Family event and personal commitments.',
      status: 'PENDING' as const,
    },
    {
      userId: priya.id,
      type: 'EARNED' as const,
      startDate: new Date(now.getFullYear(), now.getMonth() + 1, 20),
      endDate: new Date(now.getFullYear(), now.getMonth() + 1, 25),
      reason: 'Annual vacation with family.',
      status: 'APPROVED' as const,
      approvedBy: manager.id,
    },
    {
      userId: sarah.id,
      type: 'CASUAL' as const,
      startDate: new Date(now.getFullYear(), now.getMonth() + 2, 10),
      endDate: new Date(now.getFullYear(), now.getMonth() + 2, 11),
      reason: 'Personal appointment and errands.',
      status: 'PENDING' as const,
    },
    {
      userId: james.id,
      type: 'SICK' as const,
      startDate: new Date(now.getFullYear(), now.getMonth() - 1, 8),
      endDate: new Date(now.getFullYear(), now.getMonth() - 1, 9),
      reason: 'Doctor appointment and recovery.',
      status: 'REJECTED' as const,
      approvedBy: manager.id,
      comments: 'Critical project deadline during this period.',
    },
  ];

  await prisma.leaveRequest.createMany({ data: leaveData });
  console.log('✅ Created 5 leave requests');

  // Create documents
  await prisma.document.createMany({
    data: [
      {
        title: 'Engineering Onboarding Guide',
        content: '<h1>Welcome to the Engineering Team</h1><p>This guide will help you get started with our development workflow, tools, and best practices.</p><h2>Tech Stack</h2><ul><li>Next.js 14 with App Router</li><li>TypeScript (strict mode)</li><li>Prisma + PostgreSQL</li><li>Supabase for auth and realtime</li></ul><h2>Getting Started</h2><p>Clone the repository and follow the setup instructions in the README.</p>',
        authorId: admin.id,
        isPublic: true,
        tags: ['engineering', 'onboarding', 'guide'],
        version: 3,
      },
      {
        title: 'Q2 Product Roadmap',
        content: '<h1>Q2 2026 Product Roadmap</h1><p>This document outlines our product priorities and milestones for Q2 2026.</p><h2>Key Initiatives</h2><ol><li>Real-time collaboration features</li><li>Mobile app development</li><li>Analytics dashboard v2</li><li>Integration marketplace</li></ol>',
        authorId: manager.id,
        isPublic: false,
        tags: ['product', 'roadmap', 'q2'],
        version: 2,
      },
      {
        title: 'Brand Guidelines 2026',
        content: '<h1>WorkNest Brand Guidelines</h1><p>Our brand identity reflects our commitment to productivity and team collaboration.</p><h2>Colors</h2><p>Primary: Electric Indigo (#6366F1)</p><p>Secondary: Soft Jade (#10B981)</p><p>Accent: Warm Gold (#F59E0B)</p><h2>Typography</h2><p>Display: Syne</p><p>Body: DM Sans</p>',
        authorId: james.id,
        isPublic: true,
        tags: ['design', 'brand', 'guidelines'],
        version: 1,
      },
    ],
  });
  console.log('✅ Created 3 documents');

  // Create announcements
  await prisma.announcement.createMany({
    data: [
      {
        title: '🎉 Welcome to WorkNest!',
        body: 'We\'re excited to launch our new team productivity platform. WorkNest brings together tasks, chat, leaves, and documents in one unified hub. Explore all the features and let us know your feedback!',
        authorId: admin.id,
        priority: 'HIGH',
        pinned: true,
      },
      {
        title: '⚠️ System Maintenance Tonight',
        body: 'We will be performing scheduled maintenance tonight from 11 PM to 1 AM EST. The platform may be temporarily unavailable during this window. Please save your work before then.',
        authorId: admin.id,
        priority: 'URGENT',
        pinned: false,
        expiresAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
      },
      {
        title: 'Q2 All-Hands Meeting',
        body: 'Our quarterly all-hands meeting is scheduled for next Friday at 2 PM EST. We\'ll be reviewing Q1 results, sharing Q2 goals, and celebrating team achievements. Attendance is mandatory for all team members.',
        authorId: manager.id,
        priority: 'HIGH',
        pinned: false,
      },
      {
        title: 'New Leave Policy Update',
        body: 'We\'ve updated our leave policy to include additional mental health days. Each employee now gets 3 additional personal wellness days per year. Please review the updated policy in the Documents section.',
        authorId: admin.id,
        priority: 'MEDIUM',
        pinned: false,
      },
    ],
  });
  console.log('✅ Created 4 announcements');

  // Create notifications for each user
  const notificationTemplates = [
    { title: 'Welcome to WorkNest!', body: 'Your account has been set up successfully.', type: 'WELCOME' },
    { title: 'New task assigned', body: 'You have been assigned a new task.', type: 'TASK_ASSIGNED' },
    { title: 'Leave request approved', body: 'Your leave request has been approved.', type: 'LEAVE_APPROVED' },
    { title: 'New announcement', body: 'There is a new company announcement.', type: 'ANNOUNCEMENT' },
    { title: 'Task deadline approaching', body: 'A task is due in 2 days.', type: 'TASK_DUE' },
    { title: 'New message in #general', body: 'You have unread messages.', type: 'MESSAGE' },
    { title: 'Team meeting reminder', body: 'Sprint review in 30 minutes.', type: 'REMINDER' },
    { title: 'Document shared with you', body: 'A document has been shared.', type: 'DOCUMENT' },
    { title: 'Leave request pending', body: 'A team member has requested leave.', type: 'LEAVE_REQUEST' },
    { title: 'Profile updated', body: 'Your profile has been updated successfully.', type: 'PROFILE' },
  ];

  for (const user of users) {
    await prisma.notification.createMany({
      data: notificationTemplates.map((n, i) => ({
        userId: user.id,
        ...n,
        read: i > 4, // First 5 unread
        link: '/dashboard',
      })),
    });
  }
  console.log('✅ Created 50 notifications (10 per user)');

  console.log('\n🎉 Seed completed successfully!');
  console.log('\nDemo accounts:');
  console.log('  Admin:    admin@worknest.app');
  console.log('  Manager:  manager@worknest.app');
  console.log('  Employee: sarah@worknest.app');
  console.log('  Employee: james@worknest.app');
  console.log('  Employee: priya@worknest.app');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
