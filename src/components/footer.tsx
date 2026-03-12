export function Footer() {
    return (
        <footer className="relative z-20 w-full border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 mt-auto">
            <div className="container mx-auto px-4 md:px-8 py-12 md:py-16">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="col-span-1 md:col-span-2">
                        <h3 className="text-xl font-serif tracking-widest uppercase mb-4">Aura</h3>
                        <p className="text-neutral-500 dark:text-neutral-400 max-w-sm text-sm leading-relaxed">
                            Exquisite personalized jewelry crafted in 14k and 18k gold. Find the perfect name necklace or diamond letter to express your unique identity.
                        </p>
                    </div>
                    <div>
                        <h4 className="font-medium mb-4 text-sm uppercase tracking-wider">Shop</h4>
                        <ul className="space-y-3 text-sm text-neutral-500 dark:text-neutral-400">
                            <li><a href="#" className="hover:underline">Custom Names</a></li>
                            <li><a href="#" className="hover:underline">Diamond Letters</a></li>
                            <li><a href="#" className="hover:underline">Our Materials</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-medium mb-4 text-sm uppercase tracking-wider">Customer Care</h4>
                        <ul className="space-y-3 text-sm text-neutral-500 dark:text-neutral-400">
                            <li><a href="#" className="hover:underline">FAQ</a></li>
                            <li><a href="#" className="hover:underline">Shipping & Returns</a></li>
                            <li><a href="#" className="hover:underline">Contact Us</a></li>
                        </ul>
                    </div>
                </div>
                <div className="mt-12 pt-8 border-t border-neutral-200 dark:border-neutral-800 text-sm text-neutral-500 dark:text-neutral-400 flex flex-col md:flex-row items-center justify-between">
                    <p>© {new Date().getFullYear()} Aura Jewelry. All rights reserved.</p>
                    <div className="flex space-x-4 mt-4 md:mt-0">
                        <a href="#" className="hover:text-black dark:hover:text-white transition-colors">Instagram</a>
                        <a href="#" className="hover:text-black dark:hover:text-white transition-colors">TikTok</a>
                        <a href="#" className="hover:text-black dark:hover:text-white transition-colors">Pinterest</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
