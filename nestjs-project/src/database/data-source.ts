import { DataSource } from 'typeorm';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'streamtube',
  password: process.env.DB_PASSWORD || 'streamtube',
  database: process.env.DB_NAME || 'streamtube',
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/database/migrations/*.ts'],
  subscribers: [],
});
