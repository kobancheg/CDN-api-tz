import { Injectable } from '@nestjs/common';
import * as path from 'path';

@Injectable()
export class ConfigService {
   private readonly storePath: string;

   constructor() {
      this.storePath = path.resolve(__dirname, '../..', 'store');
   }

   get() {
      return this.storePath;
   }
}
