import { Request, Response } from 'express';
import { Session, SessionData } from 'express-session';
import { Redis } from "ioredis";
import { createUserLoader } from "./utils/createUserLoader";
import { createUpvoteLoader } from './utils/createVoteLoader';

export type MyContext = {
    req: Request & { session: Session & Partial<SessionData> & { userId?: number } }
    redis: Redis;
    res: Response;
    userLoader: ReturnType<typeof createUserLoader>;
    upvoteLoader: ReturnType<typeof createUpvoteLoader>;
}