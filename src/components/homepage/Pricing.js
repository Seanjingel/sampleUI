import React from 'react';

const Pricing = () => {
    return (
        <section id="pricing" className="py-16 bg-white text-center">
            <h2 className="text-3xl font-bold mb-2">Special Pricing for Indian Traders</h2>
            <p className="text-gray-600 mb-8">One bad trade costs more than JournalPlus.</p>

            <div className="max-w-md mx-auto bg-green-600 text-white rounded-xl shadow-lg overflow-hidden">
                <div className="bg-green-800 py-4">
                    <p className="text-sm font-medium">Limited Time Offer Ends In:</p>
                    <div className="flex justify-center gap-4 text-lg mt-2">
                        <span>0 Days</span>
                        <span>10 Hours</span>
                        <span>31 Mins</span>
                        <span>27 Secs</span>
                    </div>
                </div>

                <div className="py-6 px-6">
                    <p className="uppercase text-xs mb-2">Lifetime Access</p>
                    <p className="text-3xl font-bold mb-1">₹3499 <span className="line-through text-sm text-gray-200 ml-2">₹69999</span></p>
                    <p className="mb-4">No monthly fees. Pay once, use forever.</p>
                    <p className="text-sm font-semibold">Save over 90% - Limited Time Offer!</p>
                </div>

                <ul className="text-left px-6 py-4 space-y-2 text-sm">
                    <li>✔ Unlimited trade logging with no limits</li>
                    <li>✔ AI-powered performance insights</li>
                    <li>✔ All Indian brokers supported</li>
                    <li>✔ Lifetime updates included</li>
                </ul>
            </div>
        </section>
    );
};

export default Pricing;
