import { DataSource } from 'typeorm';
import bcrypt from 'bcrypt';
import { User } from '../modules/users/entities/user.entity';
import { Role } from '../common/enums/role.enum';
import dotenv from 'dotenv';
import path from 'path';

// Cargar variables de entorno
dotenv.config({ path: path.join(__dirname, '../../.env') });

/**
 * Script para crear usuarios ficticios para testing
 * Ejecución: npx ts-node -r tsconfig-paths/register src/seeders/seed.ts
 */
async function seed() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'biotasys_dev',
    entities: [User],
    synchronize: true,
    logging: false,
  });

  await dataSource.initialize();
  console.log('✅ Conexión a PostgreSQL establecida\n');

  const userRepository = dataSource.getRepository(User);

  // Limpiar usuarios anteriores (opcional)
  console.log('🗑️ Limpiando usuarios anteriores...');
  try {
    const result = await userRepository.delete({
      email: process.env.DB_SEED_EMAIL_PATTERN || 'seedtest.com',
    });
    console.log(`Eliminados: ${result.affected} usuarios\n`);
  } catch (error) {
    console.log('ℹ️ Sin usuarios previos que limpiar\n');
  }

  const users = [
    {
      email: 'nutricionista1@seedtest.com',
      password: 'Password123',
      fullName: 'Carlos Ruiz',
      role: Role.NUTRICIONISTA,
    },
    {
      email: 'nutricionista2@seedtest.com',
      password: 'Password123',
      fullName: 'Ana García',
      role: Role.NUTRICIONISTA,
    },
    {
      email: 'laboratorio1@seedtest.com',
      password: 'Password123',
      fullName: 'Dr. Pérez López',
      role: Role.LABORATORIO,
    },
    {
      email: 'laboratorio2@seedtest.com',
      password: 'Password123',
      fullName: 'Dra. Martínez González',
      role: Role.LABORATORIO,
    },
  ];

  console.log('👤 Creando usuarios ficticios...\n');

  for (const userData of users) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const user = userRepository.create({
      email: userData.email,
      password: hashedPassword,
      fullName: userData.fullName,
      role: userData.role,
      emailVerified: true, // ✅ Ya verificados para poder hacer login
      isActive: true,
    });

    await userRepository.save(user);

    console.log(`✅ ${userData.role.toUpperCase()}: ${userData.email}`);
    console.log(`   Contraseña: ${userData.password}`);
    console.log(`   Nombre: ${userData.fullName}\n`);
  }

  console.log('═══════════════════════════════════════════');
  console.log('✨ SEED COMPLETADO\n');
  console.log('📝 Para testear, usa estos logins:\n');
  console.log('NUTRICIONISTA:');
  console.log('  Email: nutricionista1@seedtest.com');
  console.log('  Password: Password123');
  console.log('  Role: nutricionista\n');
  console.log('LABORATORIO:');
  console.log('  Email: laboratorio1@seedtest.com');
  console.log('  Password: Password123');
  console.log('  Role: laboratorio\n');
  console.log('═══════════════════════════════════════════\n');

  await dataSource.destroy();
}

seed().catch((error) => {
  console.error('❌ Error en seed:', error);
  process.exit(1);
});
