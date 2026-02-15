import * as dotenv from 'dotenv';

dotenv.config();

export interface IConfig {
  port: number;
  nodeEnv: 'development' | 'production' | 'test';
  frontendUrl: string;
  jwtSecret: string;
  jwtExpiresIn: string;
  refreshTokenExpiresIn: string;
  db: {
    port: number;
    host: string;
    username: string;
    password: string;
    name: string;
    migrateData: boolean;
  };
}

/**
 * Valida que las variables requeridas estén presentes
 */
function validateConfig(): void {
  const requiredVars = ['DB_HOST', 'DB_USERNAME', 'DB_PASSWORD', 'DB_NAME'];

  const missingVars = requiredVars.filter((varName) => !process.env[varName]);

  if (missingVars.length > 0) {
    throw new Error(
      `Variables de entorno requeridas no definidas: ${missingVars.join(', ')}`,
    );
  }
}

// Validar configuración al iniciar (opcional en desarrollo)
if (process.env.NODE_ENV === 'production') {
  validateConfig();
}

export const config: IConfig = {
  // Server
  port: parseInt(process.env.PORT || '3000', 10),
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  nodeEnv: (process.env.NODE_ENV as any) || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3001',

  // JWT
  jwtSecret: process.env.JWT_SECRET || 'default-secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',
  refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '14d',

  // Database
  db: {
    port: parseInt(process.env.DB_PORT || '5432', 10),
    host: process.env.DB_HOST || 'localhost',
    username: process.env.DB_USERNAME || '',
    password: process.env.DB_PASSWORD || '',
    name: process.env.DB_NAME || '',
    migrateData: process.env.DB_MIGRATE_DATA === 'true',
  },
};

export default config;
