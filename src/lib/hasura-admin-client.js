import { GraphQLClient, gql } from "graphql-request";

const hasuraAdminClient = new GraphQLClient(
  process.env.NEXT_PUBLIC_HASURA_API_ENDPOINT,
  {
    headers: {
      "x-hasura-admin-secret": process.env.HASURA_GRAPHQL_ADMIN_SECRET,
    },
  }
);

export {hasuraAdminClient, gql}
