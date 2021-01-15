import { Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Column, BaseEntity, OneToMany } from "typeorm";
import { Field, Int, ObjectType } from "type-graphql";
import { Post } from "./Post";
import { UpVote } from "./UpVote";

@ObjectType()
@Entity()
export class User extends BaseEntity{
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column({ unique: true})
  username!: string;

  @Field()
  @Column({type: "text", unique: true})
  email!: string;
  
  @Column({type: "text"})
  password!: string;
  
  @OneToMany(() => Post, (post) => post.originalPoster)
  posts: Post[];

  @OneToMany(() => UpVote, (post) => post.user)
  upvotes: UpVote[];

  @Field(() => String)
  @CreateDateColumn({type: 'date'})
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;

}