// Temporary Mock Data for Products
// We will replace this with real Shopify data once the API token is configured later.

export const MOCK_PRODUCTS = [
    {
        id: "gid://shopify/Product/1",
        title: "Signature Name Necklace",
        handle: "signature-name-necklace",
        description: "Our classic personalized name necklace crafted from solid 14k gold.",
        price: 350.00,
        currencyCode: "USD",
        images: [
            {
                url: "https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?q=80&w=800&auto=format&fit=crop",
                altText: "Gold Name Necklace"
            }
        ],
        materials: ["yellow-gold", "white-gold", "rose-gold"],
        basePrice: 350
    },
    {
        id: "gid://shopify/Product/2",
        title: "Diamond Letter Pendant",
        handle: "diamond-letter-pendant",
        description: "A brilliant initial pendant handset with ethically sourced diamonds.",
        price: 450.00,
        currencyCode: "USD",
        images: [
            {
                url: "https://images.unsplash.com/photo-1599459183200-59c768991d31?q=80&w=800&auto=format&fit=crop",
                altText: "Diamond Letter Pendant"
            }
        ],
        materials: ["yellow-gold", "white-gold", "rose-gold"],
        basePrice: 450
    }
];

export async function getMockProducts() {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return MOCK_PRODUCTS;
}

export async function getMockProduct(handle: string) {
    await new Promise(resolve => setTimeout(resolve, 300));
    return MOCK_PRODUCTS.find(p => p.handle === handle) || null;
}
