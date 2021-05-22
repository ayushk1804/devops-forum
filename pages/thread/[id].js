import { useRouter } from "next/router";
import useSWR from "swr";

import { hasuraUserClient, gql } from "../../src/lib/hasura-user-client";
import { Layout } from "../../src/Components/Layout/Layout";

import { PostList } from "../../src/Components/Posts/PostList";
import { PostForm } from "../../src/Components/Posts/PostForm";
import { useAuthState } from "../../src/Context/auth";

const GetThreadIds = gql`
  query GetThreadIds {
    threads {
      id
    }
  }
`;
const GetThreadsById = gql`
  query GetThreadsById($id: uuid!) {
    threads_by_pk(id: $id) {
      id
      title
      locked
      posts(order_by: { created_at: asc }) {
        id
        message
        created_at
        author {
          id
          name
        }
      }
    }
  }
`;

const AddPostReply = gql`
  mutation AddPostReply($ThreadId: uuid!, $postMessage: String!) {
    insert_posts_one(object: { thread_id: $ThreadId, message: $postMessage }) {
      id
      message
      created_at
      author {
        name
      }
    }
  }
`;

const ThreadPage = ({ initialData }) => {
  const { isAuthenticated } = useAuthState();
  const hasuraClient = hasuraUserClient();
  const router = useRouter();
  const { id, isfallback } = router.query;
  const { data, mutate } = useSWR(
    [GetThreadsById, id],
    (query, id) => hasuraClient.request(query, { id }),
    {
      initialData,
      refreshInterval: 1000,
      revalidateOnMount: true,
    }
  );
  const handlePostReply = async ({ postMessage }, { target }) => {
    try {
      const hasuraClient = hasuraUserClient();
      const { insert_posts_one } = await hasuraClient.request(AddPostReply, {
        ThreadId: id,
        postMessage,
      });
      mutate({
        ...data,
        threads_by_pk: {
          ...data.threads_by_pk,
          posts: [...data.threads_by_pk.posts, insert_posts_one],
        },
      });
      target.reset();
    } catch (err) {
      console.log(err);
    }
  };

  if (!isfallback && !data) {
    return <p>No Such Thread Found</p>;
  }

  return (
    <>
      <h1 className="text-2xl font-semibold">{data.threads_by_pk.title}</h1>
      <div className="p-6 space-y-10">
        <PostList posts={data.threads_by_pk.posts} />
        {!data.threads_by_pk.locked && isAuthenticated && (
          <PostForm onSubmit={handlePostReply} />
        )}
      </div>
    </>
  );
};

const getStaticPaths = async () => {
  const hasuraClient = hasuraUserClient();
  const { threads } = await hasuraClient.request(GetThreadIds);
  return {
    paths: threads.map(({ id }) => ({
      params: {
        id,
      },
    })),
    fallback: true,
  };
};

const getStaticProps = async ({ params }) => {
  const { id } = params;
  const hasuraClient = hasuraUserClient();
  const initialData = await hasuraClient.request(GetThreadsById, { id });
  return {
    props: {
      initialData,
    },
    revalidate: 1,
  };
};

ThreadPage.layout = Layout;

export { getStaticProps, getStaticPaths };
export default ThreadPage;
