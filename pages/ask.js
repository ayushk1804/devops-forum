import { useRouter } from "next/router";

import { useForm } from "react-hook-form";
import { Layout } from "../src/Components/Layout/Layout";
import { hasuraAdminClient } from "../src/lib/hasura-admin-client";
import { hasuraUserClient, gql } from "../src/lib/hasura-user-client";

const GetCategories = gql`
  {
    categories {
      id
      name
    }
  }
`;

const InsertThread = gql`
  mutation InsertThread(
    $categoryId: uuid!
    $postTitle: String!
    $postMessage: String!
  ) {
    insert_threads_one(
      object: {
        category_id: $categoryId
        title: $postTitle
        posts: { data: { message: $postMessage } }
      }
    ) {
      id
      updated_at
      title
      posts {
        message
        created_at
        thread {
          category {
            name
          }
          author {
            name
          }
        }
      }
    }
  }
`;

const AskPage = ({ categories }) => {
  const {
    handleSubmit,
    register,
    formState: { isSubmitting, errors },
  } = useForm();
  const router = useRouter();

  const onSubmit = async ({ categoryId, postTitle, postMessage }) => {
    console.log("posting");
    const hasuraClient = hasuraUserClient();
    try {
      const { insert_threads_one } = await hasuraClient.request(InsertThread, {
        categoryId,
        postTitle,
        postMessage,
      });
      console.log(insert_threads_one);
      router.push(`/threads/${insert_threads_one.id}`);
    } catch (err) {
      console.log(err);
    }
  };
  return (
    <>
      <h1 className="text-3xl">Ask a Question:</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <select {...register("categoryId")}>
          {categories.map(({ id, name }) => (
            <option value={id} key={id}>
              {name}
            </option>
          ))}
        </select>
        <div>
          <input
            type="text"
            {...register("postTitle", {
              required: "You must provide a valid title.",
            })}
            placeholder="Post Title"
          />
          {errors.postTitle && <span>{errors.postTitle.message}</span>}
        </div>
        <div>
          <textarea
            {...register("postMessage", {
              required: "Leaving an Empty post?",
            })}
            placeholder="Enter your message"
          />
          {errors.postMessage && <span>{errors.postMessage.message}</span>}
        </div>
        <button type="submit" disabled={isSubmitting}>
          Make the post
        </button>
      </form>
    </>
  );
};

export const getStaticProps = async () => {
  const { categories } = await hasuraAdminClient.request(GetCategories);
  return { props: { categories } };
};

AskPage.layout = Layout;

export default AskPage;
