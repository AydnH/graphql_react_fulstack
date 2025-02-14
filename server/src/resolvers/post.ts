import { Post } from '../entities/Post'
import { Resolver, Query, Arg, Int, Mutation, InputType, Field, Ctx, UseMiddleware, FieldResolver, Root, ObjectType } from "type-graphql";
import { MyContext } from 'src/types';
import { isAuth } from '../middleware/isAuth';
import { getConnection } from 'typeorm';
import { UpVote } from '../entities/UpVote';
import { User } from '../entities/User';


// CRUD resolvers

@InputType()
 class PostInput {
     @Field()
     title: string
     @Field()
     text: string
 }

@ObjectType()
class PaginatedPosts {
    @Field(() => [Post])
    posts: Post[]
    @Field()
    hasMore: boolean;
}

 //cursor pagenation
@Resolver(Post)
export class PostResolver {
    @FieldResolver(() => String)
    textSnippet(@Root() root: Post ) {
        return root.text.slice(0,50);
    }

    @FieldResolver(() => User)
    originalPoster(
        @Root() post: Post,
        @Ctx() {userLoader}: MyContext
    ) {
        return userLoader.load(post.creatorId);
    }

    @FieldResolver(() => Int, {nullable: true})
    async voteStatus(@Root() post: Post, @Ctx(){ upvoteLoader, req }: MyContext) {
        if(!req.session.userId) {
            return null;
        }
        const upvote = await upvoteLoader.load({
            postId: post.id, userId: req.session.userId
        });

        return upvote ? upvote.value : null;
    }



    @Mutation(() => Boolean)
    @UseMiddleware(isAuth)
    async vote(        
        @Arg('postId', () => Int) postId: number,
        @Arg('value', () => Int) value: number,
        @Ctx() {req}: MyContext
        ) {
        const isUpvote = value !== -1;
        const realValue = isUpvote ? 1 : -1;
        const { userId } = req.session

        const upvote = await UpVote.findOne({where: { postId, userId}})
            //user has voted on post befroe
        if(upvote && upvote.value !== realValue) {
            await getConnection().transaction(async (tm) => {
                await tm.query(
                `
                update vote
                set value = $1
                where "postId" = $2 and "userId" = $3
                `, [userId, postId, realValue]
            );
            await tm.query(`
            update post
            set points = points + $1
            where id = $2
            `, [2 * realValue, postId]
            );
        });
    } else if (!upvote){
            // has never voted
            await getConnection().transaction(async tm => {
                await tm.query(
                    `           
                    insert into upvote ("userId", "postId", value)
                    values ($1, $2, $3);
                    `, [userId, postId, realValue]
                );
                await tm.query(`
                update post
                set points = points + $1
                where id = $2
                `, [realValue, postId]
                );
            })
            return true;
        }
        // await UpVote.insert({
        //     userId,
        //     postId,
        //     value: realValue,
        // });
        getConnection().query(
        `
        START TRANSACTION;

        update post
        set p.points = p.points + ${realValue}
        where p.id = ${postId};

        COMMIT;
        `
        );
        return true
    }

    @Query(() => PaginatedPosts)
    async posts(
        @Arg("limit", () => Int) limit: number,
        @Arg("cursor", () => String, { nullable: true}) cursor: string | null,
        @Ctx() {req}: MyContext
    ): Promise<PaginatedPosts> {
        const realLimit = Math.max(15, limit); 
        const realLimitPlusOne = realLimit + 1;

        const replacements: any[] = [realLimitPlusOne];

        if(cursor) {
            replacements.push(new Date(parseInt(cursor)));
        }

        const posts = await getConnection().query(`
        select p.*
        from post p
        ${cursor ? `where "p.createdAt" < $2` : ""}
        order by p."createdAt" Desc
        limit $1
        `, replacements);

        // const qb = getConnection()
        // .getRepository(Post)
        // .createQueryBuilder("p")
        // .innerJoinAndSelect( "p.originalPoster", "u", 'u.id = p."creatorId"')
        // .orderBy('p."createdAt"', "DESC")
        // .take(realLimitPlusOne)
        // if (cursor){
        //    qb.where('"createdAt" < :cursor', {
        //        cursor: new Date(parseInt(cursor))
        //     });
        // }
        // const posts = await qb.getMany()
        return { 
            posts: posts.slice(0, realLimit),
            hasMore: posts.length === realLimitPlusOne,
        };

    }

    @Query(() => Post, {nullable: true})
    post( @Arg("id", () => Int) id: number): Promise<Post | undefined> { 
        return Post.findOne(id);
    }

    @Mutation(() => Post)
    @UseMiddleware(isAuth)
    async createPost( 
        @Arg("input") input: PostInput,
        @Ctx() { req }: MyContext): Promise<Post> {
            if (!req.session.userId){
                throw new Error('Not Logged in')
            }
        return Post.create({
           ...input,
           creatorId: req.session.userId,
        }).save();
    }

    @Mutation(() => Post, {nullable: true})
    @UseMiddleware(isAuth)
    async updatePost(
        @Arg("id", ()=> Int) id: number,
        @Arg("title") title: string,
        @Arg("text") text: string,
        @Ctx() {req}: MyContext
        ): Promise<Post | null> {
            const result = await getConnection()
            .createQueryBuilder()
            .update(Post)
            .set({title, text})
            .where( 'id = : id and "creatorId" = :creatorId', {
                id,
                creatorId: req.session.userId 
            })
            .returning("*")
            .execute();
        
            return result.raw[0];
    }

    @Mutation(() => Boolean)
    @UseMiddleware(isAuth)
    async deletePost( 
        @Arg("id", () => Int) id: number,
        @Ctx() {req}: MyContext
     ): Promise<Boolean> {
         //not cascade delete
        // const post = await Post.findOne(id)
        // if(!post){
        //     return false
        // }
        // if(post.creatorId !== req.session.userId){
        //     throw new Error('not authorized')
        // }
        // await UpVote.delete({ postId: id});
        // await Post.delete({ id });

        //cascade delete
        await Post.delete({id, creatorId: req.session.userId})
        return true;
    }
}