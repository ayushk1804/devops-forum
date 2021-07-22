import formatRelative from "date-fns/formatRelative";
import Link from "next/link";
import { useCallback, useState } from "react";
import ReactMarkdown from "react-markdown";
import { useAuthState } from "../../Context/auth";
import { PostForm } from "./PostForm";
import { Reactions } from "./Reactions";

const Post = ({ post, actions }) => {
  const id = post.id
  const today = new Date();
  const {
    handlePostDelete,
    handlePostUpdate,
  } = actions;

  // Check author
  const { isAuthenticated, user } = useAuthState();
  const isAuthor = isAuthenticated && user.id === post.author.id;

  // Edit Time functions
  const createdAt = formatRelative(Date.parse(post.created_at), today, {
    weekStartsOn: 1,
  });
  const updatedAt = formatRelative(Date.parse(post.updated_at), today, {
    weekStartsOn: 1,
  });
  const updated = createdAt != updatedAt;

  // Edit functions for post
  const [editing, setEditing] = useState(false);
  const toggleEditing = useCallback(() => {
    setEditing((v) => !v);
  }, []);
  const deletePost = () => {
    handlePostDelete(id);
  };
  const saveAndUpdate = async ({ message }, ...args) => {
    await handlePostUpdate({ id, message }, ...args);
    setEditing(false);
  };
  return (
    <div className="py-3 place-items-center">
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
          <div className="flex justify-between">
            <Link href={`/user/${post.author.id}`}>
              <a>
                <h3 className="text-xl font-semibold">{post.author.name}</h3>
              </a>
            </Link>
            <div>
              {isAuthor && (
                <>
                  <button
                    className="appearance-none p-1"
                    onClick={toggleEditing}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      className="current-fill h-4 w-4"
                    >
                      <path fill="none" d="M0 0h24v24H0z" />
                      <path d="M15.728 9.686l-1.414-1.414L5 17.586V19h1.414l9.314-9.314zm1.414-1.414l1.414-1.414-1.414-1.414-1.414 1.414 1.414 1.414zM7.242 21H3v-4.243L16.435 3.322a1 1 0 0 1 1.414 0l2.829 2.829a1 1 0 0 1 0 1.414L7.243 21z" />
                    </svg>
                  </button>
                  <button onClick={deletePost} className="appearance-none p-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      className="current-fill h-4 w-4"
                    >
                      <path fill="none" d="M0 0h24v24H0z" />
                      <path d="M7 4V2h10v2h5v2h-2v15a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6H2V4h5zM6 6v14h12V6H6zm3 3h2v8H9V9zm4 0h2v8h-2V9z" />
                    </svg>
                  </button>
                </>
              )}
            </div>
          </div>
          <div className="text-md text-gray-600">
            {editing ? (
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
                  <PostForm
                    defaultValues={post.message}
                    onSubmit={() => saveAndUpdate({ message: post.message })}
                  />
                </div>
              </div>
            ) : (
              <ReactMarkdown children={post.message} className="prose" />
            )}
          </div>
          <div className="inline-flex space-x-1">
            <span className="align-middle text-sm">posted {createdAt}</span>
            {updated && (
              <span className="align-middle text-sm">
                &middot; editted {updatedAt}
              </span>
            )}
          </div>
          <Reactions
            postId={post.id}
            likes={post.likes}
            likes_agg={post.likes_aggregate.aggregate.count}
            {...actions}
          />
        </div>
      </div>
    </div>
  );
};

export { Post };
