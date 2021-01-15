import { User } from "../entities/User";
import { MyContext } from "src/types";
import { Resolver, Mutation, Ctx, Field, Arg, ObjectType, Query, FieldResolver, Root } from "type-graphql";
import argon2 from 'argon2';

import { COOKIE_NAME, FORGET_PASSWORD_PREFIX } from "../constants";
import { UsernamePasswordInput } from "./UsernamePasswordInput";
import { validateRegister } from "../utils/validateRegister";
import { sendEmail } from "../utils/sendEmail";

import {v4} from 'uuid';
import { getConnection } from "typeorm";

@ObjectType()
class FieldError {
    @Field()
    field: string;
    @Field()
    message: string;
}

@ObjectType()
class UserResponse {
    @Field(() => [FieldError], {nullable: true})
    errors?: FieldError[]

    @Field(() => User, {nullable: true})
    user?: User
}

@Resolver(User)
export class UserResolver {
@FieldResolver(() => String)
    email(@Root() user: User, @Ctx() {req}: MyContext){
        //this is current user and shows user email
        if(req.session.userId === user.id) {
            return user.email;
        }
        //dont show other peoples email
        return '';
    }

@Mutation(() => UserResponse)
    async changePassword(
        @Arg('token') token: string,
        @Arg('newPassword') newPassword: string,
        @Ctx() {redis, req}: MyContext
    ): Promise<UserResponse> {
        if( newPassword.length <= 3) {
            return { errors: [
                    {
                    field: 'newPassword',
                    message: 'password must be longer than 3 characters',
                    },
                ]};
            }
            const key = FORGET_PASSWORD_PREFIX+token;
            const userId = await redis.get(key);
            if (!userId) {
                return {
                    errors: [
                        {
                            field:"token",
                            message: "token expired",
                        },
                    ],
                };
            }
            const userIdNum = parseInt(userId);
            const user = await User.findOne(userIdNum);

            if( !user ) {
                return {
                        errors: [
                            {
                                field: 'token',
                                message: "user no longer exsists",
                            }
                        ]
                }
            }


            await User.update({id: userIdNum}, {
                password: await argon2.hash(newPassword)
            }
            );
            await redis.del(key);
            //log in user after password reset
            req.session.userId = user.id;

            return{ user };
    }

    @Mutation(() => Boolean)
        async forgotPassword(
            @Arg('email') email: string, @Ctx() { redis} : MyContext) {
            const user = await User.findOne({where: {email}})
                if(!user) {
                    //email no in db
                    return true;
                }
                    const token = v4();

                    redis.set(FORGET_PASSWORD_PREFIX + token, user.id, 'ex', 1000 * 60 * 60 * 24 * 3) //stores for 3 days
                    await sendEmail(email, 
                        `<a href="http://localhost:3000/change-password/${token}">"reset password"</a>`
                        );
            return true;
        };


    @Query(() => User, {nullable: true})
     me( @Ctx() { req}: MyContext ) {
        if (!req.session.userId) {
            return null
        }
        return User.findOne(req.session.userId);
    }


    @Mutation(() => UserResponse)
    async register(
        @Arg("options") options: UsernamePasswordInput,
        @Ctx() {req}: MyContext
    ):Promise<UserResponse> {
        const errors = validateRegister(options);
        if  (errors) {
            return {errors};
        }
        const hashedPassword = await argon2.hash(options.password)
        let user;
        try {
            const result = await getConnection().createQueryBuilder().insert().into(User).values(
                {
                    username: options.username,
                    email: options.email,
                    password: hashedPassword,
                }
            )
            .returning('*')
            .execute();
            console.log(`result is ${result}`);
            user = result.raw[0];
        } catch (err) {
            // if(err.code === "23505" || err.detail.inclues("already exists")) {
                if (err.code === "23505"){
                return {
                    errors: [
                        {
                        field: "username",
                        message: "this username is already taken",
                        },
                    ],
                };
            }
        }
        //store user id session
        //sets cookie on user and keeps logged in
        req.session.userId = user.id;
        return { user };
    }

    @Mutation(() => UserResponse)
    async login(
        @Arg('usernameOrEmail') usernameOrEmail: string,
        @Arg('password') password: string,
        @Ctx() {  req }: MyContext
    ): Promise<UserResponse> {
        const user = await User.findOne(
            User,
            usernameOrEmail.includes('@')
              ? { where: { email: usernameOrEmail} }
              : { where: {username: usernameOrEmail } }
        );
        if(!user) {
            return {
                errors: [
                    {
                        field: "usernameOrEmail",
                        message: 'couldnt find username'
                    },
                ],
            };
        }
        const valid = await argon2.verify(user.password, password);
        if(!valid) {
            return {
                errors: [
                    {
                        field: "password",
                        message: "password is invalid",
                    },
                ],
            };
        }

        req.session!.userId = user.id
        
        return {
            user,
        }
        
    }


    @Mutation(() => Boolean)
    logout(
        @Ctx() {req, res}: MyContext
    ) {
    new Promise(resolve =>  
        req.session.destroy((err: any) => {
        res.clearCookie(COOKIE_NAME);
        if (err) {
            console.log(err);
            resolve(false);
            return;
        }
        return resolve(true);
    })
    );
}

}
