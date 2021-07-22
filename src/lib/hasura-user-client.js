import { GraphQLClient, gql } from "graphql-request";

const hasuraUserClient = () => {
  let token;
  let userId;
  if (typeof window !== "undefined") {
    const user = JSON.parse(localStorage.getItem("forum-auth"));
    token = user?.token;
    userId = user?.user.id;
    // return new GraphQLClient(process.env.NEXT_PUBLIC_HASURA_API_ENDPOINT, {
    //   headers: {
    //     ...(token && { Authorization: `Bearer ${token}`, 'x-hasura-user-id':user?.user.id }),
    //   },
    // });
  };

  return new GraphQLClient(process.env.NEXT_PUBLIC_HASURA_API_ENDPOINT, {
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });
};
export { hasuraUserClient, gql };
