import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser'
import * as graphqlUploadExpress from 'graphql-upload/graphqlUploadExpress.js'
import {ValidationPipe, BadRequestException} from '@nestjs/common'

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

app.enableCors({
  origin:"http:localhost:5173",
  credentials:true,
  allowedHeaders: [
    'Accept',
    "Authorization",
    "Content-type",
    "X-Requested-With",
    "apollo-require-preflight"
  ],
  methods:["GET","POST","PUT", "DELETE","OPTIONS"]
})
  app.use(cookieParser())
  app.use(graphqlUploadExpress({maxFileSize:10000000000,maxFiles:1}))
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist:true,
      transform:true,
      exceptionFactory:(errors) => {
        const formatErrors = errors.reduce((accumulator,error) => {
          accumulator[error.property] = Object.values(error.constraints).join(', ')
          return accumulator
        })
        throw new BadRequestException(formatErrors)
      }
    })
  )
  await app.listen(3000);
}
bootstrap();
