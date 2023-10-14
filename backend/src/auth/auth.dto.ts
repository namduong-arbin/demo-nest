import {InputType, Field} from '@nestjs/graphql'
import { IsNotEmpty,IsString, MinLength, IsEmail } from 'class-validator'

@InputType()
export class RegisterDto {
    @Field()
    @IsNotEmpty({message:"Fullname is required"})
    @IsString({message:"Fullname must be string"})
    fullname: string

    @Field()
    @IsNotEmpty({message:"Password is required"})
    @MinLength(8,{message:"Password must be at least 8 characters"})
    password: string


    @Field()
    @IsNotEmpty({message:"confirmPassword is required"})
    confirmPassword: string

    @Field()
    @IsNotEmpty({message:"email is required"})
    @IsEmail({},{message:"email must be valid"})
    email: string
}

@InputType()
export class LoginDto {
    @Field()
    @IsNotEmpty({message:"email is required"})
    @IsEmail({},{message:"email must be valid"})
    email: string


    @Field()
    @IsNotEmpty({message:"Password is required"})
    @MinLength(8,{message:"Password must be at least 8 characters"})
    password: string



}