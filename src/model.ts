import { TypeOrmModule } from "@nestjs/typeorm";


export const TypeOrmConfig = TypeOrmModule.forRoot({
    type: 'mysql',
    host: process.env.DATABASE_HOST,
    port: Number(process.env.DATABASE_PORT),
    username: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    entities: [__dirname + '/**/*.entity.{js,ts}'],
    synchronize: true, // 개발 환경에서만 true로 설정
})