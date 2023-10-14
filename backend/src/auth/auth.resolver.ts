import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { LoginResponse, RegisterResponse } from './types';
import { LoginDto, RegisterDto } from './auth.dto';
import { Response, Request } from 'express';
import { BadRequestException } from '@nestjs/common'

@Resolver()
export class AuthResolver {
    constructor(
        private readonly authService: AuthService
    ) { }

    @Mutation(() => RegisterResponse)
    async register(
        @Args('registerInput') registerDto: RegisterDto,
        @Context() context: { res: Response }
    ) {
        if (registerDto.password !== registerDto.confirmPassword) {
            throw new BadRequestException({ confirmPassword: "Password and confirm not match" })
        }
        const { user } = await this.authService.registerUser(registerDto, context.res)
        return { user }
    }

    @Mutation(() => LoginResponse)
    async login(
        @Args('loginInput') loginDto: LoginDto,
        @Context() context: { res: Response }
    ) {
        return await this.authService.login(loginDto, context.res)
    }


    @Mutation(() => String)
    async logout(
        @Context() context: { res: Response }
    ) {
        return await this.authService.logout(context.res)
    }

    @Mutation(() => String)
    async refreshToken(
        @Context() context: { res: Response, req: Request }
    ) {
      try {
        return await this.authService.refreshToken(context.req,context.res)
      } catch (error) {
        throw new BadRequestException(error.message)
      }
    }

    @Query(() => String)
    async hello() {
        return 'hello'
    }
}
