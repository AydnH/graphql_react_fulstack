import { EditIcon, DeleteIcon } from '@chakra-ui/icons';
import { Box, Flex, IconButton } from '@chakra-ui/react';
import NextLink from 'next/link';import React from 'react';
import { useDeletePostMutation, useMeQuery } from '../generated/graphql';

interface EditDeletePostButtonsProps {
    id: number;
    creatorId: number
}

export const EditDeletePostButtons: React.FC<EditDeletePostButtonsProps> = ({id, creatorId}) => {
const [deletePost] = useDeletePostMutation();
const { data: meData} = useMeQuery();

if( meData?.me?.id !== creatorId ){
    return null;
}
    return (
        <Box>
            <NextLink href='/post/edit/[id]' as={`post/edit/${id}`} >
                <IconButton 
                  mr={4}
                  icon={<EditIcon />} 
                  aria-label="Edit Post" 
                  size="24px"
            />
                </NextLink>
                  <IconButton 
                    variantcolor="red"
                    ml="auto" 
                    icon={<DeleteIcon/>} 
                    aria-label="Delete post" 
                    onClick={() => {
                      deletePost({ variables: {id}, update: (cache) => {
                          cache.evict({id: 'Post' + id});
                      } });
                    }} 
                    size="24px"
                />
        </Box>
    );
}