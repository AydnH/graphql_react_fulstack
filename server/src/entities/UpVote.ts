import { Entity, Column, BaseEntity, ManyToOne, PrimaryColumn } from "typeorm";
import {  ObjectType } from "type-graphql";
import { User } from "./User";
import { Post } from "./Post";


//many to many relationship
//user <--> posts
//user -> join table <-posts
//user -> upvote <- posts

@ObjectType()
@Entity()
export class UpVote extends BaseEntity{
    @Column({type: "int"})
    value: number;

    @PrimaryColumn()
    userId: number;

    @ManyToOne(() => User, (user) => user.upvotes)
    user: User;

    @PrimaryColumn()
    postId: number;

    @ManyToOne(() => Post, (post) => post.upvotes, {
        onDelete: "CASCADE",
    })
    post: Post;

}