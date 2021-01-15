import { CSSReset, ThemeProvider } from "@chakra-ui/react";
import theme from "../theme";
import { ApolloClient, ApolloProvider, InMemoryCache} from "@apollo/client";
import { PaginatedPosts, PostsQuery } from "../generated/graphql";



function MyApp({ Component, pageProps }: any) {
  return (

    <ThemeProvider theme={theme}>
      <CSSReset />
      <Component {...pageProps} />
    </ThemeProvider>

  );
}

export default MyApp;