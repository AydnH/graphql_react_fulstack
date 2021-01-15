import { Box, Button } from '@chakra-ui/react';
import { Formik, Form } from 'formik';
import { withUrqlClient } from 'next-urql';
import { useRouter } from 'next/router';
import React from 'react';
import { InputField } from '../../../components/InputField';
import { Layout } from '../../../components/layout';
import { usePostQuery, useUpdatePostMutation } from '../../../generated/graphql';
import { createUrqlClient } from '../../../utils/createUrqlClient';
import { useGetIntId } from '../../../utils/useGetIntId';
import { withApollo } from '../../../utils/withApollo';


const EditPost = ({}) => {
    const router = useRouter();
    const intId = useGetIntId();
    const {data, loading } = usePostQuery({
        skip: intId === -1,
        variables: {
            id: intId
        },
    });
    const [updatePost] = useUpdatePostMutation();
    if( loading ) {
        return (
            <Layout>
                <div>loading...</div>
            </Layout>
        );
    }
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
        <Layout variant='small'>
        <Formik initialValues={{title: data.post.title, text: data.post.text}} 
           onSubmit={async (values) => {
            await updatePost({variables: {id: intId, ...values}});
            router.back();
           }
    }>
        {({isSubmitting}) => (
            
            <Form>
                <InputField name="title" placeholder="title" label="title"/>
                <Box mt={5}>
                    <InputField textarea name="text" placeholder="text..." label="body"/>
                </Box>
                <Button mt={3} type="submit" isLoading={isSubmitting} variantColor='teal'>update post</Button>
            </Form>
                
        )}
    </Formik>
    </Layout>
    );
};

export default withApollo({ssr: false})(EditPost);