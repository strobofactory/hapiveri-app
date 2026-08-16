export type NewsItem = {
  id: string;
  title: string;
  url: string;
  publishedAt: string;
  tag: string | null;
  imageUrl: string | null;
};

const QUERY = `
  query News($handle: String!, $first: Int!) {
    blog(handle: $handle) {
      articles(first: $first, sortKey: PUBLISHED_AT, reverse: true) {
        edges {
          node {
            id
            title
            handle
            publishedAt
            tags
            image { url }
          }
        }
      }
    }
  }
`;

type ShopifyArticle = {
  id: string;
  title: string;
  handle: string;
  publishedAt: string;
  tags: string[];
  image: { url: string } | null;
};

export async function getNews(limit = 6): Promise<NewsItem[]> {
  const domain = process.env.SHOPIFY_STORE_DOMAIN;
  const token = process.env.SHOPIFY_STOREFRONT_TOKEN;
  if (!domain || !token) return [];

  const res = await fetch(`https://${domain}/api/2025-01/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': token,
    },
    body: JSON.stringify({
      query: QUERY,
      variables: { handle: 'news', first: limit },
    }),
    next: { revalidate: 600 },
  });

  if (!res.ok) return [];

  const json = (await res.json()) as {
    data?: { blog?: { articles?: { edges?: { node: ShopifyArticle }[] } } };
  };

  const edges = json.data?.blog?.articles?.edges ?? [];

  return edges.map(({ node }) => ({
    id: node.id,
    title: node.title,
    url: `https://${domain}/blogs/news/${node.handle}`,
    publishedAt: node.publishedAt,
    tag: node.tags?.[0] ?? null,
    imageUrl: node.image?.url ?? null,
  }));
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}.${m}.${day}`;
}
