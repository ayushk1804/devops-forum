import { Post } from "./Post";
const PostList = ({ posts, actions }) => {
  if (!posts) {
    return null;
  }

  return (
    <div className="divide-y">
      {posts.map((post, key) => (
        <Post key={key} post={post} actions={actions} />
      ))}
    </div>
  );
};

export { PostList };
