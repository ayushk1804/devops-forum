import { GraphQLClient, gql } from "graphql-request";

const hasuraUserClient = () => {
  let token;
  if (typeof window !== "undefined") {
    const user = JSON.parse(JSON.parse(localStorage.getItem("forum-auth")));
    token = user?.token;
  }

  return new GraphQLClient(process.env.NEXT_PUBLIC_HASURA_API_ENDPOINT, {
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });
};

export { hasuraUserClient, gql };
