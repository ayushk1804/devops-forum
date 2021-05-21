import { Thread } from "./Thread";
const ThreadList = ({ threads }) => {
  if (!threads) return null;

  return (
    <div className="divide-y p-6">
      {threads.map((thread, key) => (
          <Thread key={key} thread={thread} />
      ))}
    </div>
  );
};

export { ThreadList };
