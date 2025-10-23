import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function migrateExistingUsers() {
  try {
    console.log('🔄 Migrating existing users to new auth system...\n');

    // Find users without email/password
    const usersToMigrate = await prisma.user.findMany({
      where: {
        OR: [{ email: null }, { passwordHash: null }],
      },
    });

    if (usersToMigrate.length === 0) {
      console.log('✅ No users need migration. All users have email/password set.');
      return;
    }

    console.log(`Found ${usersToMigrate.length} user(s) to migrate:\n`);

    for (const user of usersToMigrate) {
      // Create default email based on name
      const defaultEmail = `${user.name.toLowerCase()}@gymbros.app`;
      const defaultPassword = `${user.name}123!`; // Temporary password

      // Hash the password
      const passwordHash = await bcrypt.hash(defaultPassword, 10);

      // Update user
      await prisma.user.update({
        where: { id: user.id },
        data: {
          email: defaultEmail,
          passwordHash: passwordHash,
          // Enable rehab for Devlin by default
          rehabEnabled: user.name === 'Devlin' ? true : false,
        },
      });

      console.log(`✅ Migrated: ${user.name}`);
      console.log(`   Email: ${defaultEmail}`);
      console.log(`   Temporary Password: ${defaultPassword}`);
      console.log(`   ⚠️  Please change this password in Settings!\n`);
    }

    console.log('✅ Migration complete!');
    console.log('\n📝 Next steps:');
    console.log('1. Users can now login with their email and temporary password');
    console.log('2. Users should change their password in Settings page');
    console.log('3. Devlin has rehab features enabled by default\n');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

migrateExistingUsers();
