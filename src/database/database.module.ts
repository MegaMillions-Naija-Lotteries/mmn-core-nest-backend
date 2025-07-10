// // database/database.module.ts
// import { Module } from '@nestjs/common';
// import { ConfigModule, ConfigService } from '@nestjs/config';
// import { DrizzleModule } from '@sixaphone/nestjs-drizzle';
// import { drizzle } from 'drizzle-orm/mysql2';
// import mysql from 'mysql2';
// import { schema } from './schema';

// @Module({
//   imports: [
//     DrizzleModule.forRootAsync({
//       inject: [ConfigService],
//       useFactory: async (config: ConfigService) => {
//         const host = config.get('DB_HOST');
//         const user = config.get('DB_USER');
//         const password = config.get('DB_PASSWORD');
//         const database = config.get('DB_NAME');
        
//         const connection = await mysql.createConnection({
//           host, user, password, database,
//         });
        
//         const driver = drizzle(connection, { schema, mode: 'default'});
        
//         return {
//           name: 'default',
//           type: 'mysql',
//           url: `mysql://${user}:${password}@${host}/${database}`,
//           schema: schema as unknown as Record<string, any>,
//           driver,
//         };
//       },
//     }),
//   ],
//   exports: [DrizzleModule],
// })
// export class DatabaseModule {}
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/mysql2';
// Safe default import that works in both CommonJS and ESM
import * as mysqlImport from 'mysql2/promise';
const mysql = (mysqlImport as any).default || mysqlImport;

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'DATABASE',
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const pool = mysql.createPool({
          host: configService.get<string>('DB_HOST'),
          user: configService.get<string>('DB_USER'),
          password: configService.get<string>('DB_PASSWORD'),
          database: configService.get<string>('DB_NAME'),
        });

        return drizzle(pool);
      },
    },
  ],
  exports: ['DATABASE'],
})
export class DatabaseModule {}

