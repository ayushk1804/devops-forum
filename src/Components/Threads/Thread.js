import formatRelative from "date-fns/formatRelative";
import Link from "next/link";

const today = new Date();
const Thread = ({ thread }) => {
  const { count } = thread.posts_aggregate.aggregate;
  const [lastPost] = thread.posts;
  const timeago = formatRelative(Date.parse(lastPost.created_at), today, {
    weekStartsOn: 1,
  });
  const hasReplies = count > 1;
  return (
    <div key={thread.id} className="p-6 flex space-x-3 place-items-center">
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
        <Link href={`/thread/${thread.id}`}>
          <a>
            <h3 className="text-xl font-semibold">{thread.title}</h3>
          </a>
        </Link>
        <div className="inline-flex space-x-3">
          <span className="inline-block h-5 w-5 rounded-full overflow-hidden bg-gray-200 align-middle">
            <svg
              className="h-full w-full text-gray-600"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </span>
          <span className="align-middle">
            {lastPost.author.name} {hasReplies ? "replied" : "posted"} {"in"}{" "}
            <Link href={`/category/${thread.category.id}`}>
              <a>{thread.category.name}</a>
            </Link>{" "}
            {timeago}
          </span>
        </div>
      </div>
    </div>
  );
};

export { Thread };
