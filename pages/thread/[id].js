import { useRouter } from "next/router";
import useSWR from "swr";

import { hasuraUserClient, gql } from "../../src/lib/hasura-user-client";
import { Layout } from "../../src/Components/Layout/Layout";

import { PostList } from "../../src/Components/Posts/PostList";
import { PostForm } from "../../src/Components/Posts/PostForm";
import { useAuthState } from "../../src/Context/auth";
import { useEffect } from "react";

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
        # likes {
        #   id
        # }
        like_aggregate {
          aggregate {
            count
          }
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

const InsertLikeById = gql`
  mutation InsertLike($postId: uuid!) {
    insert_likes_one(object: { post_id: $postId }) {
      id
    }
  }
`;
const DeleteLikeById = gql`
  mutation DeleteLike($id: uuid!) {
    delete_likes_by_pk(id: $id) {
      id
    }
  }
`;

const GetUserLikedPosts = gql`
  query getUserLikes($threadId: uuid!, $userId: uuid!) {
    likes(
      where: {
        post: { thread_id: { _eq: $threadId } }
        user_id: { _eq: $userId }
      }
    ) {
      post_id
      user_id
      id
    }
  }
`;

const ThreadPage = ({ initialData }) => {
  const { isAuthenticated } = useAuthState();
  const [hasuraClient, userId] = hasuraUserClient();
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
  const inituser = null;
  const { userLikesData } = useSWR(
    [GetUserLikedPosts, id, userId],
    (query, id, userId) => hasuraClient.request(query, { id, userId }),
    {
      initialData: inituser,
      refreshInterval: 1000,
      revalidateOnMount: true,
    }
  );

  useEffect(() => console.log(userLikesData), [userLikesData]);

  const handlePostReply = async ({ postMessage }, { target }) => {
    try {
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

  const handlePostLike = async ({ postId }) => {
    console.log("liked");
    try {
      const { insert_likes_one } = await hasuraClient.request(InsertLikeById, {
        postId,
      });
      console.log(insert_likes_one);
    } catch (err) {
      console.log(err);
    }
  };

  const handlePostUnlike = async ({ likeId }) => {
    console.log("unliked");
    try {
      const { delete_likes_by_pk } = await hasuraClient.request(
        DeleteLikeById,
        { id: likeId }
      );
      console.log(delete_likes_by_pk);
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
        <PostList
          posts={data.threads_by_pk.posts}
          actions={{ handlePostLike, handlePostUnlike }}
        />
        {!data.threads_by_pk.locked && isAuthenticated && (
          <PostForm onSubmit={handlePostReply} />
        )}
      </div>
    </>
  );
};

const getStaticPaths = async () => {
  const [hasuraClient] = hasuraUserClient();
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
  const [hasuraClient] = hasuraUserClient();
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
