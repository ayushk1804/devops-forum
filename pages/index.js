import { Layout } from "../src/Components/Layout/Layout";
import { hasuraUserClient, gql } from "../src/lib/hasura-user-client";
import useSWR from "swr";

import { ThreadList } from "../src/Components/Threads/ThreadList";

const GetThreads = gql`
  query GetThreads {
    threads(
      order_by: { pinned: desc, posts_aggregate: { max: { created_at: desc } } }
    ) {
      id
      locked
      answered
      pinned
      title
      author {
        name
      }
      category {
        id
        name
      }
      posts(order_by: { created_at: desc }, limit: 1) {
        id
        created_at
        message
        author {
          name
        }
      }
      posts_aggregate {
        aggregate {
          count
        }
      }
    }
  }
`;

const IndexPage = ({ initialData }) => {
  const hasuraClient = hasuraUserClient();
  const { data } = useSWR(GetThreads, (query) => hasuraClient.request(query), {
    initialData,
    refreshInterval: 1000,
    revalidateOnMount: true,
  });
  return (
    <div className="">
      <p className="text-red-500">Welcome to Forum!</p>
      <ThreadList threads={data.threads} />
    </div>
  );
};

export const getStaticProps = async () => {
  const hasuraClient = hasuraUserClient();
  const initialData = await hasuraClient.request(GetThreads);
  return { props: { initialData }, revalidate: 1 };
};

IndexPage.layout = Layout;

export default IndexPage;
