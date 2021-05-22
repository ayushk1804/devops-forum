import { useRouter } from "next/router";
import useSWR from "swr";

import { hasuraUserClient, gql } from "../../src/lib/hasura-user-client";
import { Layout } from "../../src/Components/Layout/Layout";

import { ThreadList } from "../../src/Components/Threads/ThreadList";

const GetCategoryIds = gql`
  query GetCategoryIds {
    categories {
      id
    }
  }
`;
const GetCategoryById = gql`
  query GetCategoryById($id: uuid!) {
    categories_by_pk(id: $id) {
      id
      name
      threads(
        order_by: {
          pinned: desc
          posts_aggregate: { max: { created_at: desc } }
        }
      ) {
        id
        locked
        pinned
        answered
        title
        author {
          name
        }
        posts(order_by: { created_at: desc }, limit: 1) {
          id
          created_at
          message
          author {
            name
          }
        }
        posts_aggregate {
          aggregate {
            count
          }
        }
      }
    }
  }
`;

const CategoryPage = ({ initialData }) => {
  const hasuraClient = hasuraUserClient();
  const router = useRouter();
  const { id, isfallback } = router.query;
  const { data, mutate } = useSWR(
    [GetCategoryById, id],
    (query, id) => hasuraClient.request(query, { id }),
    {
      initialData,
      refreshInterval: 1000,
      revalidateOnMount: true,
    }
  );

  if (!isfallback && !data) {
    return <p>No Such Thread Found</p>;
  }

  return (
    <>
      <h1 className="text-2xl font-semibold">{data.categories_by_pk.name}</h1>
      <div className="p-6 space-y-10">
        <ThreadList threads={data.categories_by_pk.threads} />
      </div>
    </>
  );
};

const getStaticPaths = async () => {
  const hasuraClient = hasuraUserClient();
  const { categories } = await hasuraClient.request(GetCategoryIds);
  return {
    paths: categories.map(({ id }) => ({
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
  const initialData = await hasuraClient.request(GetCategoryById, { id });
  return {
    props: {
      initialData,
    },
    revalidate: 1,
  };
};

CategoryPage.layout = Layout;

export { getStaticProps, getStaticPaths };
export default CategoryPage;
