/**
 * Core utility for fetching data from the Shopify Storefront API.
 */

const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
const storefrontAccessToken = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN;

interface ShopifyFetchParams {
    query: string;
    variables?: Record<string, unknown>;
}

export async function shopifyFetch<T>({ query, variables }: ShopifyFetchParams): Promise<{ status: number; body: T } | never> {
    if (!domain || !storefrontAccessToken) {
        throw new Error('Shopify credentials are not provided in environment variables.');
    }

    const endpoint = `https://${domain}/api/2024-01/graphql.json`;

    try {
        const result = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Shopify-Storefront-Access-Token': storefrontAccessToken,
            },
            body: JSON.stringify({
                ...(query && { query }),
                ...(variables && { variables }),
            }),
            // We often want to cache Shopify queries in Next.js
            // cache: 'force-cache', 
            // next: { revalidate: 900 } // 15 minutes
        });

        const body = await result.json();

        if (body.errors) {
            throw body.errors[0];
        }

        return {
            status: result.status,
            body,
        };
    } catch (error) {
        console.error('Error fetching from Shopify:', error);
        throw {
            error,
            query
        };
    }
}
