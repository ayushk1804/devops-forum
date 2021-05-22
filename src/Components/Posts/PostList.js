import { Post } from "./Post";
const PostList = ({ posts }) => {
  if (!posts) {
    return null;
  }

  return (
    <div className="divide-y">
      {posts.map((post, key) => (
        <Post key={key} post={post} />
      ))}
    </div>
  );
};

export { PostList };
