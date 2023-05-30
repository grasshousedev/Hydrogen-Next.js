import { SHOPIFY_GRAPHQL_API_ENDPOINT } from "@/lib/constants";
import { isShopifyError } from "@/lib/type-guards";
import { LAYOUT_QUERY } from "./queries/layout";
import { ShopifyFeaturedCollectionOperation, ShopifyFeaturedProductOperation, ShopifyHeroOperation, ShopifyHomePageSeoOperation, ShopifyLayoutOperation } from "./types";
import { 
  HOMEPAGE_FEATURED_PRODUCTS_QUERY,
  COLLECTION_HERO_QUERY,
  FEATURED_COLLECTIONS_QUERY 
} from "./queries/homepage";

const domain = `https://${process.env.PUBLIC_STORE_DOMAIN!}`;
const endpoint = `${domain}${SHOPIFY_GRAPHQL_API_ENDPOINT}`;
const key = process.env.PUBLIC_STOREFRONT_API_TOKEN!;

type ExtractVariables<T> = T extends { variables: object }
  ? T["variables"]
  : never;

type LayoutVariables = {
  headerMenuHandle: string;
  footerMenuHandle: string;
  language: string;
};

export async function shopifyFetch<T>({
  query,
  variables,
  headers,
  cache = "force-cache",
}: {
  query: string;
  variables?: ExtractVariables<T>;
  headers?: HeadersInit;
  cache?: RequestCache;
}): Promise<{ status: number; body: T } | never> {
  try {
    const result = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": key,
        ...headers,
      },
      body: JSON.stringify({
        ...(query && { query }),
        ...(variables && { variables }),
      }),
      cache,
      next: { revalidate: 900 }, // 15 minutes
    });

    const body = await result.json();

    if (body.errors) {
      throw body.errors[0];
    }

    return {
      status: result.status,
      body,
    };
  } catch (e) {
    if (isShopifyError(e)) {
      throw {
        status: e.status || 500,
        message: e.message,
        query,
      };
    }

    throw {
      error: e,
      query,
    };
  }
}

export async function getLayoutData() {
  const data = await shopifyFetch<ShopifyLayoutOperation>({
    query: LAYOUT_QUERY,
    variables: {
      headerMenuHandle: "main-menu",
      footerMenuHandle: "footer",
    },
  });
  return data;
}

export async function getHomepageSeo() {
  const data = await shopifyFetch<ShopifyHomePageSeoOperation>({
    query: COLLECTION_HERO_QUERY,
    variables: { 
      handle: 'hydrogen',
    },  
  })
  return data;
};

export async function getFeaturedProducts() {
  const data = await shopifyFetch<ShopifyFeaturedProductOperation>({
    query: HOMEPAGE_FEATURED_PRODUCTS_QUERY,
  })
  return data;
};

export async function getSecondaryHero() {
  const data = await shopifyFetch<ShopifyHeroOperation>({
    query: COLLECTION_HERO_QUERY,
    variables: {
      handle: 'automated-collection',
    },
  })
  return data;
};

export async function getFeaturedCollections() {
  const data = await shopifyFetch<ShopifyFeaturedCollectionOperation>({
    query: FEATURED_COLLECTIONS_QUERY,
  })
  return data;
};

export async function getTertiaryHero() {
  const data = await shopifyFetch<ShopifyHeroOperation>({
    query: COLLECTION_HERO_QUERY,
    variables: {
      handle: 'frontpage',
    },
  })
  return data;
};
