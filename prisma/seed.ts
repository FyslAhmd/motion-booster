import { PrismaClient } from '../lib/generated/prisma';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const ADMIN_DATA = {
  username: 'abuZahed',
  email: 'zahed04x@gmail.com',
  fullName: 'Abu Zahed',
  phone: '+8801647584756',
  password: 'Abuzahed1234@',
  role: 'ADMIN' as const,
};

async function seedAdmin() {
  console.log('🔧 Seeding admin user...\n');
  // Check if admin already exists
  const existing = await prisma.user.findFirst({
    where: {
      OR: [
        { email: ADMIN_DATA.email },
        { username: ADMIN_DATA.username },
      ],
    },
  });

  if (existing) {
    console.log(`⚠️  Admin already exists:`);
    console.log(`   Email:    ${existing.email}`);
    console.log(`   Username: ${existing.username}`);
    console.log(`   Role:     ${existing.role}`);
    console.log(`\n   Skipping creation. Delete the user first if you want to re-create.`);
    return;
  }

  // Hash password
  const passwordHash = await bcrypt.hash(ADMIN_DATA.password, 12);

  // Create admin
  const admin = await prisma.user.create({
    data: {
      username: ADMIN_DATA.username,
      email: ADMIN_DATA.email,
      fullName: ADMIN_DATA.fullName,
      phone: ADMIN_DATA.phone,
      passwordHash,
      role: ADMIN_DATA.role,
      emailVerified: true,
    },
  });

  console.log('✅ Admin user created successfully!\n');
  console.log('   ┌──────────────────────────────────────');
  console.log(`   │ ID:       ${admin.id}`);
  console.log(`   │ Username: ${admin.username}`);
  console.log(`   │ Email:    ${admin.email}`);
  console.log(`   │ Name:     ${admin.fullName}`);
  console.log(`   │ Role:     ${admin.role}`);
  console.log(`   │ Password: ${ADMIN_DATA.password}`);
  console.log('   └──────────────────────────────────────');
  console.log('\n   ⚠️  Change these credentials after first login!');
}

seedAdmin()
  .catch((e) => {
    console.error('❌ Failed to seed admin:', e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
