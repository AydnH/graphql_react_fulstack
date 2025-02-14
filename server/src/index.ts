import "reflect-metadata";
import {  COOKIE_NAME, __prod__ } from "./constants";
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";

import Redis from 'ioredis';
import session from 'express-session';
import connectRedis from 'connect-redis';
import  cors  from 'cors';

import {createConnection} from 'typeorm';
// import { sendEmail } from "./utils/sendEmail";

import {POSTGRES_DB} from "./config";
import { Post } from "./entities/Post";
import { User } from "./entities/User";
import { UpVote } from "./entities/UpVote";
import path from "path";
import { createUserLoader } from "./utils/createUserLoader";
import { createUpvoteLoader } from "./utils/createVoteLoader";


const main = async () => {
    const conn = await createConnection({
        type:'postgres',
        database: 'postgres',
        username:'postgres',
        password:'password',
        logging: true,
        // synchronize: true,
        port: 4001,
        migrations: [path.join(__dirname, "./migrations/*")],
        entities: [Post, User, UpVote],
   
    });

    // await conn.runMigrations();
    const app = express();

    const RedisStore = connectRedis(session);
    const redis = new Redis();


    app.use(cors({
        origin: 'http://localhost:3000',
        credentials: true,
    }));
    app.use(
        session({
        name: COOKIE_NAME,
        store: new RedisStore({ 
            client: redis,
            disableTouch: true,
         }),
         cookie: {
             maxAge: 1000 * 60 * 60 * 24 * 365 * 10, //10 years
             httpOnly: true,
             sameSite: 'lax',
             secure: __prod__, //only works in https
             
         },
        saveUninitialized: false,
        secret: 'qiuyghaad',
        resave: false,
        })
    )

    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [HelloResolver, PostResolver, UserResolver],
            validate: false
        }),
        context: ({req, res}) => ({ 
            req,
            res,
            redis, 
            userLoader: createUserLoader(),
            upvoteLoader: createUpvoteLoader(),
        }),
    });
    apolloServer.applyMiddleware({ 
        app, 
        cors: false,
    });
    console.log(`this is the db name ${POSTGRES_DB}`);
    app.listen(4000, () => {
        console.log('Server started on localhost:4000')
    });
}

main();