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
        updated_at
        author {
          id
          name
        }
        likes {
          id
          user_id
        }
        likes_aggregate {
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
      updated_at
      author {
        id
        name
      }
      likes {
        id
        user_id
      }
      likes_aggregate {
        aggregate {
          count
        }
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

const DeletePostById = gql`
  mutation DeletePost($id: uuid!) {
    delete_posts_by_pk(id: $id) {
      id
    }
  }
`;
const UpdatePostById = gql`
  mutation UpdatePost($id: uuid!, $message: String!) {
    update_posts_by_pk(pk_columns: { id: $id }, _set: { message: $message }) {
      id
      message
      updated_at
    }
  }
`;
const UpdateLockedThreadStatus = gql`
  mutation UpdatePost($id: uuid!, $locked: Boolean) {
    update_threads_by_pk(pk_columns: { id: $id }, _set: { locked: $locked }) {
      id
      locked
    }
  }
`;

const ThreadPage = ({ initialData }) => {
  const router = useRouter();
  const hasuraClient = hasuraUserClient();
  const { isAuthenticated } = useAuthState();
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

  const handlePostUpdate = async ({ id, message }, { target }) => {
    try {
      const { update_posts_by_pk } = await hasuraClient.request(
        UpdatePostById,
        {
          id,
          message,
          updated_at,
        }
      );

      mutate({
        ...data,
        threads_by_pk: {
          ...data.threads_by_pk,
          posts: data.threads_by_pk.posts.reduce((posts, post) => {
            if (post.id === id)
              return [...posts, { ...post, ...update_posts_by_pk }];

            return [...posts, post];
          }, []),
        },
      });
    } catch (err) {
      console.log(err);
    }
  };

  const handlePostLike = async (postId) => {
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

  const handlePostUnlike = async (likeId) => {
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

  const handlePostDelete = async (id) => {
    try {
      await hasuraClient.request(DeletePostById, { id });
      mutate({
        ...data,
        threads_by_pk: {
          ...data.threads_by_pk,
          posts: data.threads_by_pk.posts.filter((p) => p.id != id),
        },
      });
    } catch (err) {
      console.log(err);
    }
  };

  const handleThreadLocked = async () => {
    try {
      const { update_threads_by_pk } = await hasuraClient.request(
        UpdateLockedThreadStatus,
        {
          id,
          locked: !data.threads_by_pk.locked,
        }
      );

      mutate({
        ...data,
        ...update_threads_by_pk,
      });
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
      <div className="flex p-1 items-center">
        {data.threads_by_pk.locked && (
          <span className="bg-red-300 text-red-800 px-2 py-1 rounded-full uppercase">
            Locked
          </span>
        )}
        <button className="flex apearance-none p-1" onClick={handleThreadLocked}>
          {data.threads_by_pk.locked ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="w-5 h-5 current-fill"
            >
              <path fill="none" d="M0 0h24v24H0z" />
              <path d="M7 10h13a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V11a1 1 0 0 1 1-1h1V9a7 7 0 0 1 13.262-3.131l-1.789.894A5 5 0 0 0 7 9v1zm-2 2v8h14v-8H5zm5 3h4v2h-4v-2z" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="w-5 h-5 current-fill"
            >
              <path fill="none" d="M0 0h24v24H0z" />
              <path d="M19 10h1a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V11a1 1 0 0 1 1-1h1V9a7 7 0 1 1 14 0v1zM5 12v8h14v-8H5zm6 2h2v4h-2v-4zm6-4V9A5 5 0 0 0 7 9v1h10z" />
            </svg>
          )}
        </button>
      </div>
      <div className="p-6 space-y-10">
        <PostList
          posts={data.threads_by_pk.posts}
          actions={{
            handlePostLike,
            handlePostUnlike,
            handlePostDelete,
            handlePostUpdate,
          }}
        />
        {!data.threads_by_pk.locked && isAuthenticated && (
          <div className="flex space-x-3">
            <div>
              <span className="inline-block h-8 w-8 rounded-full overflow-hidden bg-gray-200">
                <svg
                  className="h-full w-full text-gray-600"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </span>
            </div>
            <div className="flex-1">
              <PostForm onSubmit={handlePostReply} />
            </div>
          </div>
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
