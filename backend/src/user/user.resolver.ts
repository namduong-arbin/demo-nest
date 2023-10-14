import { Resolver, Mutation, Args, Context } from '@nestjs/graphql';
import * as GraphQLUpload from 'graphql-upload/GraphQLUpload.js';
import { v4 as uuidv4 } from 'uuid'
import { Request } from 'express';
import { UserService } from './user.service';
import { UseGuards } from '@nestjs/common';
import { GraphqlAuthGuard } from 'src/auth/gaphql-auth.guard';
import { User } from './user.type';
import { join } from 'path';
import { createWriteStream } from 'fs';
@Resolver()
export class UserResolver {
    constructor(
        private readonly userService: UserService
    ) { }


    @UseGuards(GraphqlAuthGuard)
    @Mutation(() => User)
    async updateProfile(
        @Args('fullname') fullname: string,
        @Args('file', { type: () => GraphQLUpload, nullable: true }) file: GraphQLUpload.FileUpload,
        @Context() context: { req: Request }
    ) {
        const imgUrl = file ? await this.storeImageAndGetUrl(file) : null;
        const userId = context.req.user.sub;
        return this.userService.updateProfile(userId, fullname, imgUrl)
    }


    private async storeImageAndGetUrl(file: GraphQLUpload): Promise<string> {
        const { filename, createReadStream } = await file
        const uniqueFilename = `${uuidv4()}_${filename}`
        const imgPath = join(process.cwd(), 'public', uniqueFilename)
        const imgUrl = `${process.env.APP_URL}/${uniqueFilename}`
        const readStream = createReadStream();
        readStream.pipe(createWriteStream(imgPath))
        return imgUrl
    }
}
