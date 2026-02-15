import { utilities as nestWinstonModuleUtilities } from 'nest-winston';
import * as winston from 'winston';
import * as path from 'path';
import config from './dotenv.config';

/**
 * Directorio para almacenar logs
 */
const logsDir = path.join(process.cwd(), 'logs');
/**
 * Transporte para consola con formato NestJS
 */
const consoleTransport = new winston.transports.Console({
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.colorize(),
    nestWinstonModuleUtilities.format.nestLike('Biotasys', {
      prettyPrint: true,
    }),
  ),
});

/**
 * Transporte para archivo con todos los logs
 */
const fileTransport = new winston.transports.File({
  filename: path.join(logsDir, 'app.log'),
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json(),
  ),
  level: 'info',
  maxsize: 5242880, // 5MB
  maxFiles: 5,
});

/**
 * Transporte para archivo solo con errores
 */
const errorTransport = new winston.transports.File({
  filename: path.join(logsDir, 'error.log'),
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json(),
  ),
  level: 'error',
  maxsize: 5242880, // 5MB
  maxFiles: 5,
});

export const winstonConfig = {
  transports:
    config.nodeEnv === 'production'
      ? [fileTransport, errorTransport]
      : [consoleTransport, fileTransport, errorTransport],
};

export default winstonConfig;
