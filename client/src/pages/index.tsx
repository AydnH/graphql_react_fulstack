import { Box, Button, Flex, Heading, Link, Stack, Text } from "@chakra-ui/react";
import NextLink from 'next/link';
import React, { useState } from "react";
import { EditDeletePostButtons } from "../components/EditDeletePostButtons";
import { Layout } from "../components/layout";
import { UpvoteSection } from "../components/UpvoteSection";
import { PostQuery, PostsQuery, useDeletePostMutation, useMeQuery, usePostsQuery } from "../generated/graphql";
import { withApollo } from "../utils/withApollo";

const Index = () => {
  const {data, error, loading, fetchMore, variables} = usePostsQuery({
    variables: {
      limit: 15,
      cursor: null,
    },
    notifyOnNetworkStatusChange: true,
  });

    if(!loading && !data) {
    return (
      <div>
        <div>query failed</div>
        <div>{error?.message}</div>
      </div>
    )
  }

  return (
  <Layout>
    <Flex>
      <Heading>joe mama</Heading>
      <NextLink href='/create-post'>
        <Link ml='auto'>create post</Link>
      </NextLink>
    </Flex>

  {!data && loading ? (
  <div>... loading</div>
  ) : (
    <Stack spacing={8}>
      {data!.posts.posts.map((p) =>
      //if any null values return null
        !p ? null : (
      <Flex key={p.id} p={5} shadow="md" borderWidth="1px">
        <UpvoteSection post={p}/>
        <Box flex={1}>
        <NextLink href="/post/[id]" as={`/post/${p.id}`}>
          <Link>
            <Heading fontSize="xl">{p.title} </Heading> 
          </Link>
        </NextLink>
          <Text>OP: {p.originalPoster.username}</Text>
        <Flex>
          <Text flex={1} mt={4}>{p.textSnippet}</Text>
            <Box ml="auto">
              <EditDeletePostButtons 
                id={p.id} 
                creatorId={p.originalPoster.id}
              />
            </Box>
          </Flex>
        </Box>
      </Flex>
      ))}
    </Stack>
  )}
  { data && data.posts.hasMore ?(
  <Button onClick={() => {
    fetchMore({
      variables: {
        limit: variables?.limit,
        cursor: data.posts.posts[data.posts.posts.length -1].createdAt,
      },
      // updateQuery: (
      //   previousValue,
      //   {fetchMoreResult}
      //   ): PostsQuery => {
      //   if(!fetchMoreResult){
      //     return previousValue as PostsQuery
      //   }
      //   return {
      //     __typename: 'Query',
      //     posts: {
      //       __typename: "PaginatedPosts",
      //       hasMore: (fetchMoreResult as PostsQuery).posts.hasMore,
      //       posts:[
      //         ...(previousValue as PostsQuery).posts.posts,
      //         ...(fetchMoreResult as PostsQuery).posts.posts,
      //       ],
      //     }
      //   }
      // }
    });
  }} isLoading={loading} m='auto' my={4}> load more</Button>
  ): null}
  </Layout>
  )
}
  

export default withApollo({ssr: true})(Index);
