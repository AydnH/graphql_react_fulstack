import { Box, Flex, Link, Button, Heading } from '@chakra-ui/react';
import React from 'react';
import NextLink from 'next/link'
import { useLogoutMutation, useMeQuery } from '../generated/graphql';
import { isServer } from '../utils/isServer';
import {useRouter} from 'next/router';
import { useApolloClient } from '@apollo/client';

interface NavBarProps {

}

export const NavBar: React.FC<NavBarProps> = ({}) => {
    const router = useRouter();
    const [logout, {loading: logoutFetching}] = useLogoutMutation();
    const apolloClient = useApolloClient();
    const {data, loading} = useMeQuery({
        skip: isServer(),
    });
    console.log('data: ' , data)

    let body = null;
    //data is loading
    if(loading) {
        body = null
        //user not logged
    } else if (!data?.me) {
        body = (
        <>
        <NextLink href="/">
            <Link color='white' mr={2}>home</Link>
        </NextLink>
        <NextLink href="/login">
            <Link color='white' mr={2}>login</Link>
        </NextLink>
        <NextLink href="/register">
            <Link color='white' mr={2}>Register</Link>
        </NextLink>
        </>
        )
        //user logged
    } else {
        body = (
            <Flex align="center">
                <NextLink href='/create-post'>
                    <Button as={Link} mr={2}>
                        create post
                    </Button>
                </NextLink>
                <Box>
                    <Box mr={2}>{data.me.username}</Box>
                        <Button 
                            onClick={async () => { 
                                await logout();
                                await apolloClient.resetStore();
                            }}
                            isLoading={logoutFetching}
                            variant="link">logout
                        </Button>
                </Box>
            </Flex>
        )
    }

return (
    <Flex zIndex={1} position='sticky' top={0} bg='tomato' p={4} ml='auto' >
        <Flex flex={1} m='auto' maxW={800} align={'center'}>
        <NextLink href='/'>
            <Link>
            <Heading>home</Heading>
            </Link>
        </NextLink>
        <Box ml={"auto"}>
            {body}
        </Box>
        </Flex>
    </Flex>
);
}