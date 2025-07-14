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
        const env = process.env.NODE_ENV;
        let host, port, user, password, database;
        if (env === 'production') {
          host = configService.get<string>('PROD_DB_HOST');
          port = configService.get<number>('PROD_DB_PORT') || 3306;
          user = configService.get<string>('PROD_DB_USERNAME');
          password = configService.get<string>('PROD_DB_PASSWORD');
          database = configService.get<string>('PROD_DB_DATABASE');
        } else if (env === 'staging') {
          host = configService.get<string>('STAGING_DB_HOST');
          port = configService.get<number>('STAGING_DB_PORT') || 3306;
          user = configService.get<string>('STAGING_DB_USERNAME');
          password = configService.get<string>('STAGING_DB_PASSWORD');
          database = configService.get<string>('STAGING_DB_DATABASE');
        } else {
          host = configService.get<string>('DB_HOST');
          port = configService.get<number>('DB_PORT') || 3306;
          user = configService.get<string>('DB_USERNAME');
          password = configService.get<string>('DB_PASSWORD');
          database = configService.get<string>('DB_DATABASE');
        }
        // Warn if any DB env variable is missing
        if (!host || !port || !user || !password || !database) {
          // eslint-disable-next-line no-console
          console.warn(
            `\u26A0\uFE0F  Warning: One or more DB environment variables are missing!` +
              `\n  host: ${host}` +
              `\n  port: ${port}` +
              `\n  user: ${user}` +
              `\n  password: ${password ? '***' : ''}` +
              `\n  database: ${database}`,
          );
        }
        // eslint-disable-next-line no-console
        console.log(
          `\u{1F4BE} Connecting to DB: \u{1F5A5} ${host}:${port} \u{1F4D1} DB Name: \u{1F4C1} ${database}`,
        );
        const pool = mysql.createPool({
          host,
          port,
          user,
          password,
          database,
        });
        return drizzle(pool);
      },
    },
  ],
  exports: ['DATABASE'],
})
export class DatabaseModule {}
