import React from 'react';

const features = [
    { img: '/images/feature/real.png', title: "Track Your Trades", desc: "Easily log and review every trade with detailed analytics." },
    { img: '/images/feature/performance.png', title: 'Performance Analytics', desc: 'Visualize profits, losses, and strategy efficiency with interactive charts.' },
    { img: '/images/feature/multiuser.png', title: 'Multi-Account Support', desc: 'Manage multiple trading accounts seamlessly in one place.' },
    { img: '/images/feature/setting.png', title: 'Custom Tagging System', desc: 'Classify trades with custom tags for better filtering and insights.' },
    { img: '/images/feature/automate.png', title: 'Automated Trade Import', desc: 'Sync trades automatically from your broker via secure APIs.' },
    { img: '/images/feature/analytics.png', title: 'Comprehensive Reports', desc: 'Export detailed performance reports in PDF or Excel formats.' }
];

const featuresList = [
    { name: 'Indian Market Support', journalPlus: true, others: false, spreadsheet: false },
    { name: 'NSE/BSE Symbol Integration', journalPlus: true, others: false, spreadsheet: false },
    { name: 'AI-Powered Insights', journalPlus: true, others: false, spreadsheet: false },
    { name: 'Trade Analytics', journalPlus: true, others: true, spreadsheet: false },
    { name: 'Risk Management Tools', journalPlus: true, others: true, spreadsheet: false },
    { name: 'One-time Payment', journalPlus: true, others: false, spreadsheet: true },
    { name: 'Easy to Use', journalPlus: true, others: false, spreadsheet: false },
    { name: 'Customization', journalPlus: true, others: true, spreadsheet: true },
];

const Features = () => (
    <section id="features" className="relative min-h-screen p-10 md:p-20 bg-blue-100">
        <h2 className="text-3xl font-bold text-center mb-16 text-gray-800">Features</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 max-w-7xl mx-auto">
            {features.map((item, idx) => (
                <div key={idx} className="relative pt-16 pb-6 px-6 bg-white/30 backdrop-blur-md rounded-2xl shadow-lg hover:shadow-2xl transition-transform transform hover:scale-105 border border-white/10">
                    {/* Feature Icon */}
                    <div className="absolute left-1/2 -top-12 transform -translate-x-1/2">
                        <div className={`w-24 h-24 ${idx === 5 ? 'bg-green-500' : 'bg-white'} rounded-full flex items-center justify-center shadow-lg border border-white`}>
                            <img src={item.img} alt={item.title} className="w-14 h-14 object-contain" />
                        </div>
                    </div>

                    {/* Feature Content */}
                    <div className="text-center mt-6">
                        <h3 className="text-xl font-semibold mb-2 text-gray-800">{item.title}</h3>
                        <p className="text-gray-600">{item.desc}</p>
                    </div>
                </div>
            ))}
        </div>

        {/* Comparison Table */}
        <div className="max-w-6xl mx-auto mt-24">
            <h2 className="text-3xl font-bold mb-2 text-gray-800">Why Choose TradeJournal?</h2>
            <p className="text-gray-600 mb-8">See how TradeJournal compares to traditional trading journals and spreadsheets</p>

            <div className="overflow-x-auto">
                <table className="table-auto w-full bg-white shadow-lg rounded-lg overflow-hidden">
                    <thead>
                    <tr className="bg-gray-100 text-left">
                        <th className="p-4 font-medium text-gray-700">Features</th>
                        <th className="p-4 font-semibold text-green-600">TradeJournal</th>
                        <th className="p-4 font-medium text-gray-700">Other Trading Journals</th>
                        <th className="p-4 font-medium text-gray-700">Spreadsheets</th>
                    </tr>
                    </thead>
                    <tbody>
                    {featuresList.map((f, idx) => (
                        <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                            <td className="p-4">{f.name}</td>
                            <td className="p-4 text-green-600 text-xl">{f.journalPlus ? "✔" : "✘"}</td>
                            <td className="p-4 text-red-500 text-xl">{f.others ? "✔" : "✘"}</td>
                            <td className="p-4 text-red-500 text-xl">{f.spreadsheet ? "✔" : "✘"}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            <p className="mt-8 text-gray-700 text-center">TradeJournal offers the most comprehensive solution specifically built for Indian traders.</p>
        </div>
    </section>
);

export default Features;
