import { Box, Button } from '@chakra-ui/react';
import { Form, Formik } from 'formik';
import { withUrqlClient } from 'next-urql';
import { useRouter } from 'next/router';
import React from 'react';
import { InputField } from '../components/InputField';
import { NavBar } from '../components/NavBar';
import { Wrapper } from '../components/Wrapper';
import { MeDocument, MeQuery, useRegisterMutation } from '../generated/graphql';
import { createUrqlClient } from '../utils/createUrqlClient';
import { toErrorMap } from '../utils/toErrorMap';
import { withApollo } from '../utils/withApollo';

interface IRegisterProps {}


const Register: React.FC<IRegisterProps> = ({}) => {
    const router = useRouter();
    const [register] = useRegisterMutation();
    return (
        <Wrapper variant="small">
        {/* <NavBar/> */}
        <Formik initialValues={{email: "", username: "", password: ""}} 
        onSubmit={async (values, {setErrors}) => {
            const response = await register({variables: {options: values},
                update:(cache, {data}) => {
                    cache.writeQuery<MeQuery>({
                       query: MeDocument,
                       data: {
                        __typename: "Query",
                        me: data?.register.user,
                        },
                    });
                },
            });
            if( response.data?.register.errors ) {
                setErrors(toErrorMap(response.data.register.errors));
            } else if (response.data?.register.user){ 
                router.push('/');
            }
        }}>
            {({isSubmitting}) => (
                <Form>
                    <InputField name="username" placeholder="username" label="username"/>
                    <Box mt={5}>
                    <InputField name="email" placeholder="email" label="Email" />
                    </Box>
                    <Box mt={5}>
                    <InputField name="password" placeholder="password" label="password" type="password"/>
                    </Box>
                    <Button mt={3} type="submit" isLoading={isSubmitting}>Register</Button>
                </Form>
            )}
        </Formik>
        </Wrapper>
    )
};

export default withApollo({ssr: false})(Register);