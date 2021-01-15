"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const postgresql_1 = require("@mikro-orm/postgresql");
const constants_1 = require("./constants");
const path_1 = __importDefault(require("path"));
const config_1 = require("./config");
const User_1 = require("./entities/User");
const Post_1 = require("./entities/Post");
exports.default = {
    migrations: {
        path: path_1.default.join(__dirname, './migrations'),
        pattern: /^[\w-]+\d+\.[tj]s$/,
    },
    driver: postgresql_1.PostgreSqlDriver,
    dbName: 'postgres',
    type: 'postgresql',
    port: 4001,
    password: 'password',
    clientUrl: config_1.POSTGRES_URL,
    entities: [Post_1.Post, User_1.User],
    debug: !constants_1.__prod__,
};
//# sourceMappingURL=mikro-orm.config.js.map