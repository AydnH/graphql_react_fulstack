import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, BaseEntity, ManyToOne, OneToMany } from "typeorm";
import { Field, Int, ObjectType } from "type-graphql";
import { User } from "./User";
import { UpVote } from "./UpVote";

@ObjectType()
@Entity()
export class Post extends BaseEntity{
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column()
  title!: string;

  @Field()
  @Column()
  text!: string;

  @Field()
  @Column({type: 'int', default: 0})
  points!: number;

  @Field(() => Int, {nullable: true})
  voteStatus: number | null; //1 or -1

  @Field()
  @Column()
  creatorId: number;

  @Field()
  @ManyToOne(() => User, user => user.posts)
  originalPoster: User;

  @OneToMany(() => UpVote, (upvote) => upvote.post)
  upvotes: UpVote[];

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;
}