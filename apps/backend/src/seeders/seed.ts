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
 * Ejecución: npm run seed
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

  // Limpiar usuarios anteriores
  console.log('🗑️ Limpiando usuarios anteriores con patrón @seed.com...');
  try {
    const result = await userRepository.delete({
      email: process.env.DB_SEED_EMAIL_PATTERN || 'seedtest.com',
    });
    console.log(`Eliminados: ${result.affected} usuarios\n`);
  } catch (error) {
    console.log('ℹ️ Sin usuarios previos que limpiar\n');
  }

  const users = [
    // NUTRICIONISTAS
    {
      email: 'nutricionista1@seed.com',
      password: 'Password123!',
      firstName: 'Carlos',
      lastName: 'Ruiz García',
      role: Role.NUTRICIONISTA,
    },
    {
      email: 'nutricionista2@seed.com',
      password: 'Password123!',
      firstName: 'Ana',
      lastName: 'Martínez López',
      role: Role.NUTRICIONISTA,
    },
    // LABORATORIOS
    {
      email: 'laboratorio1@seed.com',
      password: 'Password123!',
      firstName: 'Dr. Pedro',
      lastName: 'Pérez Sánchez',
      role: Role.LABORATORIO,
    },
    {
      email: 'laboratorio2@seed.com',
      password: 'Password123!',
      firstName: 'Dra. María',
      lastName: 'González Rodríguez',
      role: Role.LABORATORIO,
    },
  ];

  console.log('👤 Creando usuarios ficticios...\n');

  const createdUsers: { email: string; password: string; role: string }[] = [];

  for (const userData of users) {
    try {
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      const user = userRepository.create({
        email: userData.email,
        password: hashedPassword,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role,
        emailVerified: true, // ✅ Ya verificados para poder hacer login
        isActive: true,
      });

      await userRepository.save(user);
      createdUsers.push({
        email: userData.email,
        password: userData.password,
        role: userData.role.toUpperCase(),
      });

      console.log(`✅ ${userData.role.toUpperCase()}: ${userData.email}`);
      console.log(`   Contraseña: ${userData.password}`);
      console.log(`   Nombre: ${userData.firstName} ${userData.lastName}\n`);
    } catch (error) {
      console.error(`❌ Error creando usuario ${userData.email}:`, error);
    }
  }

  console.log('═══════════════════════════════════════════════════════════');
  console.log('✨ SEED COMPLETADO\n');
  console.log('📝 Credenciales para testing:\n');

  console.log('🥗 NUTRICIONISTAS:');
  createdUsers
    .filter((u) => u.role === 'NUTRICIONISTA')
    .forEach((u) => {
      console.log(`  Email: ${u.email}`);
      console.log(`  Password: ${u.password}`);
      console.log(`  Role: nutricionista\n`);
    });

  console.log('🧪 LABORATORIOS:');
  createdUsers
    .filter((u) => u.role === 'LABORATORIO')
    .forEach((u) => {
      console.log(`  Email: ${u.email}`);
      console.log(`  Password: ${u.password}`);
      console.log(`  Role: laboratorio\n`);
    });

  console.log('═══════════════════════════════════════════════════════════\n');

  await dataSource.destroy();
}

seed().catch((error) => {
  console.error('❌ Error en seed:', error);
  process.exit(1);
});
