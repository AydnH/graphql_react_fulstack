import { ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';
import { Flex, IconButton } from '@chakra-ui/react';
import React from 'react';
import { useState } from 'react';
import { PostSnippetFragment, PostsQuery, useVoteMutation, VoteMutation } from '../generated/graphql';
import gql from 'graphql-tag';
import { ApolloCache } from '@apollo/client';

interface UpvoteSectionProps {
    post: PostSnippetFragment;
}
const updateAfterVote = (value: number, postId: number, cache: ApolloCache<VoteMutation>) => {
    const data = cache.readFragment<{
        id: number;
        points: number; 
        voteStatus: number | null;
    }>({
        id: "Post" + postId,
        fragment: gql`
        fragment _ on Post {
            id
            points
            voteStatus
        }
        `,
    });
      if ( data ) {
        if(data.voteStatus === value) {
            return;
          }
        const newPoints = (data.points as number) + ((!data.voteStatus ? 1 : 2) * value);
        cache.writeFragment(
        {    
        id: "Post:" + postId,
        fragment: gql`
            fragment _ on Post {
              points
              voteStatus
            }
          `,
          data: {id: postId, points: newPoints, voteStatus: value} as any
        });
      }
}
export const UpvoteSection: React.FC<UpvoteSectionProps> = ({post}) => {
    const[loadingState, setLoadingState] = useState<'upvote-loading' | 'downvote-loading' | 'not-loading'>('not-loading');
    const [vote] = useVoteMutation();
    return (
    <Flex direction='column' alignItems="center" justifyContent="center" mr={4}>
      <IconButton 
        onClick={async () => {
            if(post.voteStatus === 1){
                return;
            }
            setLoadingState('upvote-loading')
            await vote({
                variables: {
                postId: post.id,
                value: 1,
                },
            update: (cache) => updateAfterVote(1, post.id, cache),
            });
            setLoadingState('not-loading')
        }}
        variantcolor={post.voteStatus === 1 ? 'green' : undefined}
        isLoading={loadingState==='upvote-loading'}
        aria-label='upvote'
        icon={<ChevronUpIcon />}
        size="24px"
       />
      {post.points}
      <IconButton 
        onClick={async () => {
            if(post.voteStatus ===-1){
                return;
            }
            setLoadingState('downvote-loading')
            vote({
                variables: {
                postId: post.id,
                value: -1,
                },
            update: (cache) => updateAfterVote(-1, post.id, cache),
            })
            setLoadingState('not-loading')
        }}
        variantcolor={post.voteStatus === -1 ? 'red' : undefined}
        isLoading={loadingState==='upvote-loading'}
        aria-label='downvote'
        icon={<ChevronDownIcon/>}
        size="24px"
      />
      </Flex>
    )
}