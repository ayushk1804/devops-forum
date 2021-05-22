import formatRelative from "date-fns/formatRelative";
import Link from "next/link";

const today = new Date();
const Post = ({ post }) => {
  const timeago = formatRelative(Date.parse(post.created_at), today, {
    weekStartsOn: 1,
  });
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
          <Link href={`/user/${post.author.id}`}>
            <a>
              <h3 className="text-xl font-semibold">{post.author.name}</h3>
            </a>
          </Link>
          <p className="text-sm">{post.message}</p>
          <div className="inline-flex space-x-3">
            <span className="align-middle text-sm text-gray-600">{timeago}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export { Post };
