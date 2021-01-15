import { Box, Button, Flex, Link } from '@chakra-ui/react';
import { Form, Formik } from 'formik';
import { withUrqlClient } from 'next-urql';
import { useRouter } from 'next/router';
import React from 'react';
import { InputField } from '../components/InputField';
import { NavBar } from '../components/NavBar';
import { Wrapper } from '../components/Wrapper';
import { MeDocument, MeQuery, useLoginMutation } from '../generated/graphql';
import { createUrqlClient } from '../utils/createUrqlClient';
import { toErrorMap } from '../utils/toErrorMap';
import NextLink from 'next/link';
import { withApollo } from '../utils/withApollo';

interface ILoginProps {}

const Login: React.FC<ILoginProps> = ({}) => {
    const router = useRouter();
    const [login] = useLoginMutation();
    return (
        
        <Wrapper variant="small">
        <NavBar/>
        <Formik initialValues={{usernameOrEmail: "", password: ""}} 
        onSubmit={async (values, {setErrors}) => {
            const response = await login({variables: values,
                update: (cache, {data}) => {
                cache.writeQuery<MeQuery>({
                    query:MeDocument,
                    data: {
                        __typename: "Query",
                        me: data?.login.user,
                    },
                });
                cache.evict({fieldName: 'posts:[]'})
                }
            });
            if( response.data?.login.errors ) {
                setErrors(toErrorMap(response.data.login.errors));
            } else if (response.data?.login.user){ 
                if (typeof router.query.next === 'string'){
                    router.push(router.query.next);
                } else {
                    router.push('/');
                }

            }
        }}>
            {({isSubmitting}) => (
                
                <Form>
                    <InputField name="usernameOrEmail" placeholder="username or email" label="username or Email"/>
                    <Box mt={5}>
                        <InputField name="password" placeholder="password" label="password" type="password"/>
                    </Box>
                    <Flex mt={2}>
                        <NextLink href="/forgot-password">
                            <Link ml="auto">forgot password?</Link>
                        </NextLink>
                    </Flex>
                    <Button mt={3} type="submit" isLoading={isSubmitting}>login</Button>
                </Form>
                    
            )}
        </Formik>
        </Wrapper>
    )
};

export default withApollo({ssr: false})(Login);