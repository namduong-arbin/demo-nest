import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ApolloDriver } from '@nestjs/apollo';
import { join } from 'path';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import { TokenService } from './token/token.service';

const pubSub = new RedisPubSub({
  connection: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_HOST || '6379', 10),
    retryStrategy: (time) => {
      return Math.min(time * 50, 2000)
    }
  }
})

@Module({
  imports: [AuthModule, UserModule, GraphQLModule.forRootAsync({
    imports: [ConfigModule, AppModule],
    inject: [ConfigService],
    driver: ApolloDriver,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    useFactory: async (configService: ConfigService, tokenService: TokenService) => {
      return {
        installSubscriptionHandlers: true,
        playground: true,
        autoSchemaFile: join(process.cwd(), "src/schema.gql"),
        sortSchema: true,
        subscriptions: {
          'graphql-ws': true,
          'subscriptions-transport-ws': true
        },
        onConnect: (connectParams) => {
          const token = tokenService.extractToken(connectParams)
          if (!token) {
            throw new Error("Token not provided")
          }
          const user = tokenService.validateToken(token)
          if (!user) {
            throw new Error("Invalid Token")
          }
          return { user }
        },
        context: ({ req, res, connection }) => {
          if(connection){
            return { req, res, user: connection.context.user, pubSub }; // Injecting pubSub into context
          }
          return {req,res}
        }
      }

    },

  }), ConfigModule.forRoot({ isGlobal: true })],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
