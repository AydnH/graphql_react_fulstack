import { ApolloClient, InMemoryCache } from '@apollo/client';
import { withApollo as createWithApollo} from 'next-apollo';
import { PaginatedPosts } from '../generated/graphql';

const client = new ApolloClient({
    uri: 'http://localhost:4000/graphql',
    credentials: "include",
    cache: new InMemoryCache({
      typePolicies: {
        Query: {
          fields: {
            posts: {
              keyArgs: ['limit'],
              merge(existing: PaginatedPosts | undefined, incoming: PaginatedPosts): PaginatedPosts {
                return {
                  ...incoming,
                  posts: [...(existing?.posts || []), ...incoming.posts],
                };
              },
            },
          },
        },
      },
    })
  });

export const withApollo = createWithApollo(client)