import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma.service';
import { ConfigService } from '@nestjs/config'
import { Request, Response } from 'express';
import { User } from '@prisma/client';
import { LoginDto, RegisterDto } from './auth.dto';
import * as bcrypt from 'bcrypt'

@Injectable()
export class AuthService {
    constructor(
        private readonly jwtService: JwtService,
        private readonly prisma: PrismaService,
        private readonly configService: ConfigService
    ) { }

    async refreshToken(req: Request, res: Response) {
        const refreshToken = req.cookies['refresh_token']
        if (!refreshToken) {
            throw new UnauthorizedException('Refresh Token not found')
        }
        let payload;
        try {
            payload = this.jwtService.verify(refreshToken, {
                secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
            })
        } catch (error) {
            throw new UnauthorizedException("Invalid or expired refresh token")
        }
        const userExists = await this.prisma.user.findUnique({
            where: { id: payload.sub }
        })
        if (!userExists) {
            throw new BadRequestException("User no longer exists")
        }
        const expiresIn = 15000;
        const expiration = Math.floor(Date.now() / 1000) + expiresIn;
        const accessToken = this.jwtService.sign({
            ...payload, exp: expiration
        },
            {
                secret: this.configService.get<string>('ACCESS_TOKEN_SECRET')
            })
        res.cookie('access_token', accessToken, { httpOnly: true })
        return accessToken
    }


    private async issueToken(user: User, res: Response) {
        const payload = {
            username: user.fullname,
            sub: user.id
        }
        const accessToken = this.jwtService.sign({
            ...payload
        }, {
            secret: this.configService.get<string>("ACCESS_TOKEN_SECRET"),
            expiresIn: '150sec'
        })
        const refreshToken = this.jwtService.sign({
            ...payload
        }, {
            secret: this.configService.get<string>("REFRESH_TOKEN_SECRET"),
            expiresIn: '7d'
        })

        res.cookie('access_token', accessToken, { httpOnly: true })
        res.cookie('refresh_token', refreshToken, { httpOnly: true })
        return { user }
    }

    async validateUser(loginDto: LoginDto) {

        const user = this.prisma.user.findUnique({
            where: {
                email: loginDto.email
            }
        })
        if (user && (await bcrypt.compare(loginDto.password, (await user).password))) {
            return user
        }
        return null

    }

    async registerUser(registerDto: RegisterDto, res: Response) {

        const existingUser = this.prisma.user.findUnique({
            where: {
                email: registerDto.email
            }
        })
        if (existingUser) {
           throw new BadRequestException({email: "Email already exist"})
        }

        const hashPassword = await bcrypt.hash(registerDto.password,10)
        const user = await this.prisma.user.create({
            data:{
                fullname: registerDto.fullname,
                password: hashPassword,
                email: registerDto.email
            }
        })

        return this.issueToken(user, res)
    }

    async login(loginDto: LoginDto, res: Response) {
        const user = await this.validateUser(loginDto)
        if(!user){
            throw new BadRequestException({invalidCredentials: "Invalid credential"})
        }
        return this.issueToken(user, res)
    }

    async logout(res:Response){
        res.clearCookie('access_token')
        res.clearCookie('refresh_token')
        return "Logout successfully"

    }
}
