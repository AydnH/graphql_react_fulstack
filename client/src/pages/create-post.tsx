import { Box, Flex, Link, Button } from '@chakra-ui/react';
import { Formik, Form } from 'formik';
import React, { useEffect } from 'react';
import { InputField } from '../components/InputField';
import { useCreatePostMutation, useMeQuery } from '../generated/graphql';
import { useRouter } from 'next/router';
import { Layout } from '../components/layout';
import { useIsAuth } from '../utils/useIsAuth';
import { withApollo } from '../utils/withApollo';

const CreatePost: React.FC<{}> = ({}) => {
    const router = useRouter();
    useIsAuth();
    
    const [createPost] = useCreatePostMutation();
    return (
        <Layout variant='small'>
            <Formik initialValues={{title: '', text: ''}} 
               onSubmit={async (values) => {
                   const {errors} = await createPost({variables: {input: values},
                    update: (cache) => {
                        cache.evict({fieldName: "post:{}"});
                    },
                });
                   if (!errors) {
                    router.push('/')
                   }
               }
        }>
            {({isSubmitting}) => (
                <Form>
                    <InputField name="title" placeholder="title" label="title"/>
                    <Box mt={5}>
                        <InputField textarea name="text" placeholder="text..." label="body"/>
                    </Box>
                    <Button mt={3} type="submit" isLoading={isSubmitting} variantColor='teal'>create post</Button>
                </Form>
            )}
        </Formik>
        </Layout>
    );
};

export default withApollo({ssr: false})(CreatePost);