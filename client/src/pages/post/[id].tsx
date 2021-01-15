import { Box, Heading, layout } from '@chakra-ui/react';
import { withUrqlClient } from 'next-urql';
import React from 'react';
import { EditDeletePostButtons } from '../../components/EditDeletePostButtons';
import { Layout } from '../../components/layout';
import { createUrqlClient } from '../../utils/createUrqlClient';
import { useGetIntId } from '../../utils/useGetIntId';
import { useGetPostFromUrl } from '../../utils/useGetPostFromUrl';
import { withApollo } from '../../utils/withApollo';

const Post = ({}) => {
    const intId = useGetIntId();
    const {data, error, loading } = useGetPostFromUrl();

    if (loading) {
        return (
            <Layout>
                <div>loading...</div>
            </Layout>
        );
    }

    if(!data?.post){
        return(
            <Layout>
                <Box>could not find post</Box>
            </Layout>
        )
    }
    return (
        <Layout>
            <Heading mb={4}>
                {data?.post?.title}
            </Heading>
            <Box mb={4} >
                {data?.post?.text}
            </Box>
                <EditDeletePostButtons
                    id={data.post.id}
                    creatorId={data.post.originalPoster.id}
                />
        </Layout>
    )
}

export default withApollo({ssr: true})(Post);