import { dedupExchange, Exchange, fetchExchange, gql, ssrExchange, stringifyVariables } from "urql";
import { cacheExchange, Resolver, Cache } from "@urql/exchange-graphcache";
import { LogoutMutation, MeQuery, MeDocument, LoginMutation, RegisterMutation, VoteMutationVariables, DeletePostMutationVariables } from "../generated/graphql"
import { betterUpdateQuery } from "./betterUpdateQuery";
import {pipe, tap} from "wonka";
import Router from "next/router";
import { isServer } from "./isServer";

const router = Router;

const errorExchange: Exchange = ({ forward }) => ops$ => {
  return pipe(
    forward(ops$),
    tap(({ error }) => {
        if (error?.message.includes("not logged in")) {
          router.replace("/login");
      }
    })
  )
}

const cursorPagination = (): Resolver => {
  return (_parent, fieldArgs, cache, info) => {
    const { parentKey: entityKey, fieldName } = info;
    const allFields = cache.inspectFields(entityKey);
    console.log("allFields: ", allFields);
    const fieldInfos = allFields.filter(info => info.fieldName === fieldName);
    const size = fieldInfos.length;
    if (size === 0) {
      return undefined;
    }

    const fieldKey = `${fieldName}(${stringifyVariables(fieldArgs)})`
    const isInCache = cache.resolve(
      cache.resolve(entityKey, fieldKey) as string,
      "posts"
      );

    info.partial = !!isInCache;
    let hasMore = true;
    const results: String[] = [];
    fieldInfos.forEach((fi) => {
      const key = cache.resolve(entityKey, fi.fieldKey) as string;
      const data = cache.resolve(key, "posts") as String[];
      const _hasMore = cache.resolve(key, "hasMore");

      if(!_hasMore) {
        hasMore = _hasMore as boolean;
      }
      results.push(...data);

    });

    return {
      __typename: "PaginatedPosts",
      hasMore: true,
      posts: results
    };
  };
};

function invalidateAllPosts(cache: Cache) {
  const allFields = cache.inspectFields('Query');
  const fieldInfos = allFields.filter((info) => info.fieldName === 'posts');
  fieldInfos.forEach((fi) => {
    cache.invalidate('Query', 'posts', fi.arguments || {});
  });
}

export const createUrqlClient = (ssrExchange: any, ctx: any) => {
  let cookie = ''
  if(isServer()){
    cookie = ctx?.req?.headers?.cookie;
  }
  return {
url: 'http://localhost:4000/graphql',
  fetchOptions: {
    credentials: "include" as const,
    headers:
      cookie ? {
        cookie,
      }
      : undefined,
  },
  exchanges: [
    dedupExchange,
    cacheExchange({
    keys: {
      PaginatedPosts: () => null,
    },
    resolvers: {
      Query: {
        posts: cursorPagination(),
      },
    },
    updates: {
      Mutation: {
        deletePost: (_result, args, cache, info) => {
          cache.invalidate({
            __typename: "Post",
            id: (args as DeletePostMutationVariables).id,
          });
        },
        vote: (_result, args, cache, info) => {
          const {postId, value} = args as VoteMutationVariables;
          const data = cache.readFragment(
            gql`
            fragment _ on Post {
              id
              points
            }
            `,
            {id: postId}
          );
          if(data.voteStatus === value) {
            return;
          }
          if ( data ) {
            const newPoints = (data.points as number) + ((!data.voteStatus ? 1 : 2) * value);
            cache.writeFragment(
              gql`
                fragment _ on Post {
                  points
                  voteStatus
                }
              `,
              {id: postId, points: newPoints, voteStatus: value} as any
            );

          }
        },
        createPost: (_result, args, cache, info) => {
          invalidateAllPosts(cache);
        },
        logout: (_result, args, cache, info) => {
          //me query to null
          betterUpdateQuery<LogoutMutation, MeQuery>(
            cache, {query: MeDocument},
            _result,
            (result, query) => ({ me: null })
          )
        },
        login: (_result, _args, cache, _info) => {
            betterUpdateQuery<LoginMutation, MeQuery>(
              cache,
              {query: MeDocument},
              _result,
              (result, query) => {
                if(result.login.errors) {
                  return query
                } else {
                  return {
                    me: result.login.user,
                  };
                }
              }
            );
            invalidateAllPosts(cache);
        },

        register: (_result, _args, cache, _info) => {
          betterUpdateQuery<RegisterMutation, MeQuery>(
            cache,
            {query: MeDocument},
            _result,
            (result, query) => {
              if(result.register.errors) {
                return query
              } else {
                return {
                  me: result.register.user,
                };
              }
            }
          )
      },
      },
    },
  }), 
  errorExchange,
  ssrExchange,
  fetchExchange,
],
};
};