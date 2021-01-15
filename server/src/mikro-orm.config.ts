import { MikroORM } from "@mikro-orm/core";
import { PostgreSqlDriver } from '@mikro-orm/postgresql'
import { __prod__ } from "./constants";

import path from 'path';

import { POSTGRES_URL } from "./config";
import { User } from "./entities/User";
import { Post } from "./entities/Post";


export default{
    migrations: {
    path: path.join(__dirname, './migrations'), 
    pattern: /^[\w-]+\d+\.[tj]s$/,
    },
    driver: PostgreSqlDriver,
    dbName: 'postgres',
    type: 'postgresql',
    port: 4001,
    password: 'password',
    clientUrl: POSTGRES_URL,
    entities: [Post, User],
    debug: !__prod__,
} as Parameters<typeof MikroORM.init>[0];
