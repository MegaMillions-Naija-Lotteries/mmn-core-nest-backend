import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getWelcomeMessage() {
    return {
      code: 200,
      message: 'MegaMillionsNaijaV2 API built with NestJS',
      maintainer: 'MegaMillions Naija',
      version: '1.0.0',
    };
  }
}
