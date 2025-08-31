const BottomOfferBar = () => (
    <div className="fixed bottom-0 left-0 right-0 bg-green-700 text-white px-4 py-3 flex flex-col items-center md:flex-row md:justify-between md:px-12 z-50">
        <div className="mb-3 md:mb-0">
            <h3 className="text-lg font-semibold">Lifetime Access – ₹3,499 <span className="line-through text-white/70 ml-2">₹69,999</span></h3>
            <p className="text-sm text-white/80">Use MyTrade for the price of a single losing trade.</p>
        </div>
        <button className="mt-2 md:mt-0 bg-white text-green-700 font-semibold px-6 py-3 rounded-xl shadow-md flex items-center space-x-2">
            <span>Claim Lifetime Access</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
        </button>
    </div>
);

export default BottomOfferBar;
