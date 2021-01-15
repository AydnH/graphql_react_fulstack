import { Box, Flex, Link, Button } from "@chakra-ui/react";
import { Formik, Form } from "formik";
import { withUrqlClient } from "next-urql";
import React, { useState } from "react";
import { InputField } from "../components/InputField";
import { NavBar } from "../components/NavBar";
import { Wrapper } from "../components/Wrapper";
import { useForgotPasswordMutation } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";
import { withApollo } from "../utils/withApollo";


const ForgotPassword: React.FC<{}> = ({}) => {
    const [complete, setComplete] = useState(false);
    const [forgotPassword] = useForgotPasswordMutation();
    return (
        <Wrapper variant="small">
        <NavBar/>
        <Formik initialValues={{email: ""}} 
        onSubmit={async (values) => {
            await forgotPassword({variables: values});
            setComplete(true);
        }}>
            {({isSubmitting }) => complete ? <Box> check your email for your reset link</Box> : (
                <Form>
                    <InputField name="email" placeholder="email" label="email" type="email"/>
                    <Button mt={3} type="submit">reset password</Button>
                </Form>
                    
            )}
        </Formik>
        </Wrapper>
    )
};

export default withApollo({ssr: false})(ForgotPassword);