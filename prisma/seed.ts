import 'dotenv/config';
import { prisma } from '../lib/db/prisma';
import bcrypt from 'bcryptjs';

async function main() {
  const username = process.env.ADMIN_USERNAME || 'admin';
  const email = process.env.ADMIN_EMAIL || 'admin@motionbooster.com';
  const phone = process.env.ADMIN_PHONE || '+8801700000000';
  const password = process.env.ADMIN_PASSWORD || 'Admin@123456';
  const fullName = process.env.ADMIN_FULL_NAME || 'Motion Booster Admin';

  const passwordHash = await bcrypt.hash(password, 12);

  // Check if an admin or user already exists by phone, email, or username
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { phone },
        { email },
        { username },
      ],
    },
  });

  if (existingUser) {
    const updated = await prisma.user.update({
      where: { id: existingUser.id },
      data: {
        phone,
        email,
        username,
        role: 'ADMIN',
        status: 'ACTIVE',
        adsAccess: true,
        emailVerified: true,
        passwordHash, // ensures the specified password is set
        fullName,
      },
    });
    console.log(`✅ Existing user updated to ADMIN: ${updated.username} (${updated.phone})`);
  } else {
    const admin = await prisma.user.create({
      data: {
        username,
        email,
        phone,
        fullName,
        passwordHash,
        role: 'ADMIN',
        status: 'ACTIVE',
        adminType: 'OTHER_ADMIN',
        adsAccess: true,
        emailVerified: true,
      },
    });
    console.log(`✅ Admin user created successfully: ${admin.username} (${admin.phone})`);
  }

  console.log('\n=======================================');
  console.log('       ADMIN SEED COMPLETED');
  console.log('=======================================');
  console.log(`Phone:    ${phone}`);
  console.log(`Password: ${password}`);
  console.log(`Username: ${username}`);
  console.log(`Email:    ${email}`);
  console.log(`Role:     ADMIN`);
  console.log('=======================================\n');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding admin:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
