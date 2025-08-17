import { Head, Link } from '@inertiajs/react';

export default function Welcome() {
    return (
        <>
            <Head title="MarketSpaze | Digital Marketplace for Filipinos" />
            <div className="min-h-screen bg-slate-900 text-white overflow-hidden">
                {/* Navigation */}
                <nav className="relative z-50 px-6 lg:px-8 py-6">
                    <div className="max-w-7xl mx-auto flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <img
                                src="/img/marketspazemainlogo.png"
                                alt="MarketSpaze"
                                className="h-10 w-10 rounded-lg"
                            />
                            <span className="text-xl font-bold text-white">MarketSpaze</span>
                        </div>
                        <div className="hidden md:flex items-center space-x-8">
                            <a href="#features" className="text-slate-300 hover:text-white transition-colors">Features</a>
                            <a href="#about" className="text-slate-300 hover:text-white transition-colors">About</a>
                            <a href="#contact" className="text-slate-300 hover:text-white transition-colors">Contact</a>
                        </div>
                        <div className="flex items-center space-x-4">
                            <Link
                                href="/login"
                                className="text-slate-300 hover:text-white transition-colors"
                            >
                                Sign in
                            </Link>
                            <Link
                                href="/register"
                                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                            >
                                Get Started
                            </Link>
                        </div>
                    </div>
                </nav>

                {/* Hero Section */}
                <main className="relative">
                    {/* Background gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"></div>
                    
                    {/* Grid pattern overlay */}
                    <div className="absolute inset-0 opacity-20">
                        <div className="absolute inset-0" style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                        }}></div>
                    </div>

                    <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-20 lg:py-32">
                        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                            {/* Left content */}
                            <div className="max-w-2xl">
                                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                                    Find your perfect
                                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">
                                        digital marketplace
                                    </span>
                                </h1>
                                <p className="text-lg md:text-xl text-slate-300 mb-8 leading-relaxed">
                                    Empowering Filipino entrepreneurs to thrive online. Discover, sell, and grow in a modern, secure, and community-driven marketplace.
                                </p>
                                
                                {/* Search bar */}
                                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-2 mb-8 border border-white/20">
                                    <div className="flex flex-col sm:flex-row gap-2">
                                        <div className="flex-1">
                                            <input
                                                type="text"
                                                placeholder="What are you looking for?"
                                                className="w-full bg-transparent text-white placeholder-slate-400 px-4 py-3 focus:outline-none"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <select className="w-full bg-transparent text-white px-4 py-3 focus:outline-none">
                                                <option value="" className="bg-slate-800">All Categories</option>
                                                <option value="electronics" className="bg-slate-800">Electronics</option>
                                                <option value="fashion" className="bg-slate-800">Fashion</option>
                                                <option value="home" className="bg-slate-800">Home & Living</option>
                                            </select>
                                        </div>
                                        <button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-medium transition-colors">
                                            Search
                                        </button>
                                    </div>
                                </div>

                                {/* Stats */}
                                <div className="grid grid-cols-3 gap-6">
                                    <div>
                                        <div className="text-2xl font-bold text-orange-400">10K+</div>
                                        <div className="text-sm text-slate-400">Active Vendors</div>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-orange-400">50K+</div>
                                        <div className="text-sm text-slate-400">Products</div>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-orange-400">100K+</div>
                                        <div className="text-sm text-slate-400">Happy Customers</div>
                                    </div>
                                </div>
                            </div>

                            {/* Right content - Image cards */}
                            <div className="relative">
                                <div className="grid grid-cols-2 gap-4">
                                    {/* Large featured card */}
                                    <div className="col-span-2 relative group">
                                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 hover:border-orange-500/50 transition-all duration-300">
                                            <img
                                                src="https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=720&q=80"
                                                alt="Featured Product"
                                                className="w-full h-40 object-cover rounded-xl mb-3"
                                            />
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h3 className="font-semibold text-white">Premium Collection</h3>
                                                    <p className="text-sm text-slate-400">From ₱999</p>
                                                </div>
                                                <div className="bg-orange-500/20 text-orange-400 px-3 py-1 rounded-full text-xs font-medium">
                                                    Featured
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Smaller cards */}
                                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 hover:border-orange-500/50 transition-all duration-300">
                                        <img
                                            src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=400&q=80"
                                            alt="Electronics"
                                            className="w-full h-24 object-cover rounded-lg mb-2"
                                        />
                                        <h4 className="text-sm font-medium text-white">Electronics</h4>
                                        <p className="text-xs text-slate-400">2.1k items</p>
                                    </div>

                                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 hover:border-orange-500/50 transition-all duration-300">
                                        <img
                                            src="https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=400&q=80"
                                            alt="Fashion"
                                            className="w-full h-24 object-cover rounded-lg mb-2"
                                        />
                                        <h4 className="text-sm font-medium text-white">Fashion</h4>
                                        <p className="text-xs text-slate-400">5.8k items</p>
                                    </div>
                                </div>

                                {/* Floating elements */}
                                <div className="absolute -top-4 -right-4 bg-orange-500/20 backdrop-blur-sm rounded-full p-3 border border-orange-500/30">
                                    <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>

                {/* Features Section */}
                <section id="features" className="relative py-20 bg-slate-800/50">
                    <div className="max-w-7xl mx-auto px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold mb-4">
                                Why choose <span className="text-orange-400">MarketSpaze</span>?
                            </h2>
                            <p className="text-slate-300 text-lg max-w-2xl mx-auto">
                                Built for the modern Filipino entrepreneur with cutting-edge features
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[
                                {
                                    icon: "🚀",
                                    title: "Fast Setup",
                                    description: "Get your store online in minutes with our intuitive setup process"
                                },
                                {
                                    icon: "🔒",
                                    title: "Secure Payments",
                                    description: "Bank-level security with multiple payment options for safe transactions"
                                },
                                {
                                    icon: "📱",
                                    title: "Mobile Ready",
                                    description: "Responsive design that looks perfect on all devices and screen sizes"
                                },
                                {
                                    icon: "📊",
                                    title: "Analytics",
                                    description: "Track your performance with detailed insights and growth metrics"
                                },
                                {
                                    icon: "🤝",
                                    title: "Local Support",
                                    description: "Dedicated Filipino support team ready to help you succeed"
                                },
                                {
                                    icon: "🌟",
                                    title: "Community",
                                    description: "Join thousands of successful Filipino entrepreneurs"
                                }
                            ].map((feature, index) => (
                                <div key={index} className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-orange-500/30 transition-all duration-300 group">
                                    <div className="text-3xl mb-4">{feature.icon}</div>
                                    <h3 className="text-xl font-semibold mb-3 text-white group-hover:text-orange-400 transition-colors">
                                        {feature.title}
                                    </h3>
                                    <p className="text-slate-300 leading-relaxed">
                                        {feature.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="relative py-20">
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-orange-500"></div>
                    <div className="relative max-w-4xl mx-auto text-center px-6 lg:px-8">
                        <h2 className="text-3xl md:text-4xl font-bold mb-6">
                            Ready to start your digital journey?
                        </h2>
                        <p className="text-orange-100 text-lg mb-8 max-w-2xl mx-auto">
                            Join thousands of Filipino entrepreneurs who have transformed their businesses with MarketSpaze
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href="/register"
                                className="bg-white text-orange-600 px-8 py-4 rounded-xl font-semibold hover:bg-orange-50 transition-colors inline-flex items-center justify-center"
                            >
                                Start Selling Today
                                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            </Link>
                            <Link
                                href="/login"
                                className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white hover:text-orange-600 transition-colors inline-flex items-center justify-center"
                            >
                                Browse Products
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="bg-slate-900 border-t border-slate-800 py-12">
                    <div className="max-w-7xl mx-auto px-6 lg:px-8">
                        <div className="grid md:grid-cols-4 gap-8 mb-8">
                            <div>
                                <div className="flex items-center space-x-3 mb-4">
                                    <img
                                        src="/img/marketspazemainlogo.png"
                                        alt="MarketSpaze"
                                        className="h-8 w-8 rounded-lg"
                                    />
                                    <span className="text-lg font-bold text-white">MarketSpaze</span>
                                </div>
                                <p className="text-slate-400 text-sm leading-relaxed">
                                    Empowering Filipino entrepreneurs to succeed in the digital marketplace.
                                </p>
                            </div>
                            <div>
                                <h4 className="font-semibold text-white mb-4">Product</h4>
                                <ul className="space-y-2 text-slate-400 text-sm">
                                    <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                                    <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                                    <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold text-white mb-4">Support</h4>
                                <ul className="space-y-2 text-slate-400 text-sm">
                                    <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                                    <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                                    <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold text-white mb-4">Company</h4>
                                <ul className="space-y-2 text-slate-400 text-sm">
                                    <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                                    <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                                    <li><a href="#" className="hover:text-white transition-colors">Press</a></li>
                                </ul>
                            </div>
                        </div>
                        <div className="border-t border-slate-800 pt-8 text-center">
                            <p className="text-slate-400 text-sm">
                                &copy; {new Date().getFullYear()} MarketSpaze. All rights reserved.
                            </p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}