import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import config from '../../../config/dotenv.config';

@Injectable()
export class PythonCallbackGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const headerValue = request.headers['x-api-key'];
    const receivedApiKey = Array.isArray(headerValue)
      ? headerValue[0]
      : headerValue;
    const expectedApiKey = config.ai.callbackApiKey;

    if (!expectedApiKey || receivedApiKey !== expectedApiKey) {
      throw new UnauthorizedException('Invalid callback API key');
    }

    return true;
  }
}

