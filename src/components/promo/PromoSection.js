const PromoSection = () => (
    <section id="promo" className="bg-green-600 text-white text-center py-16 px-4">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Journal Smarter?</h2>
        <p className="text-lg mb-8">Join thousands of Indian traders who have transformed their trading with <span className="font-semibold">MyTrade</span>.</p>

        <div className="flex flex-col items-center space-y-4">
            <button className="bg-white text-green-600 font-medium px-6 py-3 rounded-xl shadow-md w-72 flex items-center justify-between">
                <span>Get Lifetime Access for ₹3499</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
            </button>

            <button className="border border-white text-white px-6 py-3 rounded-xl w-72">
                Demo Account
            </button>
        </div>

        <p className="mt-6 text-sm text-white/80">7-day money-back guarantee</p>
    </section>
);

export default PromoSection;
