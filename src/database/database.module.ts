import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/mysql2';
import * as mysqlImport from 'mysql2/promise';
const mysql = (mysqlImport as any).default || mysqlImport;

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'DATABASE',
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const logger = new Logger('DatabaseModule');
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

        if (!host || !port || !user || !password || !database) {
          logger.warn(
            `\u26A0\uFE0F  Warning: One or more DB environment variables are missing!` +
              `\n  host: ${host}` +
              `\n  port: ${port}` +
              `\n  user: ${user}` +
              `\n  password: ${password ? '***' : ''}` +
              `\n  database: ${database}`,
          );
        }

        logger.log(
          `\u{1F4BE} Connecting to DB: \u{1F5A5} ${host}:${port} \u{1F4D1} DB Name: \u{1F4C1} ${database}`,
        );

        const pool = mysql.createPool({
          host,
          port,
          user,
          password,
          database,
          ssl: { rejectUnauthorized: false },
        });

        return drizzle(pool);
      },
    },
  ],
  exports: ['DATABASE'],
})
export class DatabaseModule {}
