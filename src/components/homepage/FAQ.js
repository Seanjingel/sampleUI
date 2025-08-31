import { useState } from 'react';
import {ChevronDownIcon} from "lucide-react";

const faqData = [
    { question: "How do I start logging my trades?", answer: "You can start by clicking 'Get Started', creating an account, and adding your trades manually or through automated imports." },
    { question: "Can I track multiple trading accounts?", answer: "Yes, MyTrade supports multiple accounts, allowing you to monitor and analyze each account separately." },
    { question: "Is there real-time trade syncing?", answer: "Absolutely. Trades sync in real-time when connected to supported brokers via API integrations." },
    { question: "How secure is my trade data?", answer: "We prioritize security with end-to-end encryption, secure APIs, and robust authentication mechanisms." },
    { question: "Can I download my trade reports?", answer: "Yes, you can export your performance reports in PDF or Excel formats for offline analysis." },
    { question: "Is MyTrade suitable for intraday traders?", answer: "Definitely. Our analytics are designed for both intraday and positional traders with detailed performance metrics." },
    { question: "Do you support Indian brokers?", answer: "Yes, we have integrations with major Indian brokers like Zerodha, Upstox, Angel One, and more." },
    { question: "Can I set custom trade tags/labels?", answer: "You can create custom tags to classify your trades (e.g., Scalping, Swing, Breakout, etc.) for better filtering and insights." },
    { question: "Does it support mobile devices?", answer: "Yes, MyTrade is fully responsive and accessible on mobiles, tablets, and desktops." },
    { question: "Is there a free version?", answer: "We offer a free basic plan with essential features. Premium analytics and advanced tools are part of our paid plans." },
    {question: "Can I log trades manually?", answer: "Yes, you can manually add trade entries if they are not auto-imported."},
    {question: "Is this better than Excel?", answer: "Absolutely! We provide visual analytics, trade tagging, and performance metrics out-of-the-box."},
    {question: "Is this beginner-friendly?", answer: "Yes, it’s designed with simplicity in mind for all experience levels."},
    {question: "How secure is my data?", answer: "Your data is encrypted and securely stored with strict privacy policies."},
    {question: "What payments do you accept?", answer: "We accept UPI, Credit/Debit Cards, and Net Banking."},
    
];

const FAQ = () => {
    const [openIndex, setOpenIndex] = useState(null);

    const toggleFAQ = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section id="faq" className="max-w-2xl mx-auto px-4 py-12">
            <h2 className="text-3xl font-bold text-center mb-6">Frequently Asked Questions</h2>
            <p className="text-center text-gray-500 mb-10">Everything you need to know about MyTrade.</p>

            <div className="space-y-4">
                {faqData.map((faq, index) => (
                    <div key={index} className="border-b pb-4">
                        <button
                            onClick={() => toggleFAQ(index)}
                            className="flex justify-between items-center w-full text-left focus:outline-none"
                        >
                            <span className="text-lg font-medium">{faq.question}</span>
                            <ChevronDownIcon
                                className={`h-5 w-5 transform transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''}`}
                            />
                        </button>
                        {openIndex === index && (
                            <p className="mt-3 text-gray-600">{faq.answer}</p>
                        )}
                    </div>
                ))}
            </div>
        </section>
    );
};

export default FAQ;
