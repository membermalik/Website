export async function shopifyFetch<T>({
    cache = 'force-cache',
    headers,
    query,
    tags,
    variables,
    next
}: {
    cache?: RequestCache;
    headers?: HeadersInit;
    query: string;
    tags?: string[];
    variables?: Record<string, any>;
    next?: NextFetchRequestConfig;
}): Promise<{ status: number; body: T } | never> {
    const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
    const storefrontAccessToken = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN;

    if (!domain || !storefrontAccessToken) {
        throw new Error('Shopify credentials are not fully configured in the environment variables.');
    }

    const endpoint = `https://${domain}/api/2024-01/graphql.json`;

    try {
        const result = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Shopify-Storefront-Access-Token': storefrontAccessToken,
                ...headers
            },
            body: JSON.stringify({
                ...(query && { query }),
                ...(variables && { variables })
            }),
            cache,
            ...(tags && { next: { tags, ...next } })
        });

        const body = await result.json();

        if (body.errors) {
            console.error('GraphQL Errors:', body.errors);
            throw body.errors[0];
        }

        return {
            status: result.status,
            body
        };
    } catch (error) {
        console.error('Error executing GraphQL query:', error);
        throw {
            error,
            query
        };
    }
}
