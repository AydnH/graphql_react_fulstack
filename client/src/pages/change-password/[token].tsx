import React, { useState } from 'react';
import { NextPage } from 'next';
import { Box, Button, Link } from '@chakra-ui/react';
import { Formik, Form } from 'formik';
import { InputField } from '../../components/InputField';
import { Wrapper } from '../../components/Wrapper';
import { toErrorMap } from '../../utils/toErrorMap';
import { useRouter } from 'next/router';
import { MeDocument, MeQuery, useChangePasswordMutation } from '../../generated/graphql';
import NextLink from "next/link";
import { withApollo } from '../../utils/withApollo';

const ChangePassword: NextPage = () => {
    const router = useRouter();
    const [changePassword] = useChangePasswordMutation();
    const [tokenError, setTokenError] = useState("");
    return (
        <Wrapper variant="small">
        <Formik initialValues={{ newPassword: "" }} 
        onSubmit={async (values, {setErrors}) => {
            const response = await changePassword({
                variables : {
                    newPassword: values.newPassword,
                    token: typeof router.query.token === 'string' ? router.query.token: ""
                },
                update: (cache, {data}) => {
                    cache.writeQuery<MeQuery>({
                        query:MeDocument,
                        data: {
                            __typename: "Query",
                            me: data?.changePassword.user,
                        },
                    });
                    cache.evict({fieldName: 'posts:[]'})
                    }
            });
            if( response.data?.changePassword.errors ) {
                const errorMap = toErrorMap(response.data.changePassword.errors)
             if ('token' in errorMap){ 
                setTokenError(errorMap.token);
            }
            setErrors(errorMap);
        } else if (response.data?.changePassword.user) {
            //worked
            router.push("/");
        }
        }}>
            {({isSubmitting}) => (
                
                <Form>
                    <Box mt={5}>
                    <InputField name="newPassword" placeholder="new Password" label="new Password" type="password"/>
                    </Box>
                   
                    { tokenError ? (
                    <Box>
                    <Box mr={2}> {tokenError} </Box> 
                    <NextLink href="/forgot-password"></NextLink>
                    <Link>forgot password?</Link>  
                    </Box>  
                    ): null}
                   
                    <Button mt={3} type="submit" isLoading={isSubmitting}>login</Button>
                </Form>
            )}
        </Formik>
        </Wrapper>
    );
};


export default withApollo({ssr: false})(ChangePassword);