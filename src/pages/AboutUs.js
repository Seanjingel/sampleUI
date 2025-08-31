import { useEffect } from 'react';

const AboutUs = () => {
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    return (
        <section className="py-20 bg-gradient-to-br from-blue-900 via-teal-800 to-slate-900 min-h-screen flex items-center">
            <div className="max-w-6xl mx-auto px-6 w-full">
                {/* Heading & Intro */}
                <div className="text-center">
                    <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
                        About MyTrade
                    </h2>
                    <p className="mt-4 text-base md:text-lg text-gray-200 dark:text-gray-300 max-w-3xl mx-auto">
                        MyTrade is your personal digital trading journal designed for modern traders.
                        Whether you’re a beginner or a seasoned investor, our mission is to help you
                        track, analyze, and improve your trading decisions — all in one intuitive platform.
                    </p>
                </div>

                {/* Cards */}
                <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3 justify-center">
                    <article className="bg-white/10 dark:bg-white/10 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-white/20 transform transition duration-300 hover:scale-105 hover:shadow-2xl">
                        <h3 className="text-lg md:text-xl font-semibold text-green-400">
                            🚀 Our Mission
                        </h3>
                        <p className="mt-3 text-gray-200 dark:text-gray-300">
                            We believe every trader deserves powerful tools to review performance,
                            learn from mistakes, and scale strategies. MyTrade empowers you with
                            data insights, performance graphs, and AI-backed analytics to optimize your edge.
                        </p>
                    </article>

                    <article className="bg-white/10 dark:bg-white/10 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-white/20 transform transition duration-300 hover:scale-105 hover:shadow-2xl">
                        <h3 className="text-lg md:text-xl font-semibold text-green-400">
                            📈 Why MyTrade?
                        </h3>
                        <p className="mt-3 text-gray-200 dark:text-gray-300">
                            Unlike spreadsheets or scattered notes, MyTrade brings all your trades,
                            setups, outcomes, and notes into one clean interface. It's built to help
                            you grow — trade by trade.
                        </p>
                    </article>

                    <article className="bg-white/10 dark:bg-white/10 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-white/20 transform transition duration-300 hover:scale-105 hover:shadow-2xl">
                        <h3 className="text-lg md:text-xl font-semibold text-green-400">
                            💡 Built for Traders
                        </h3>
                        <p className="mt-3 text-gray-200 dark:text-gray-300">
                            Developed by traders, for traders — MyTrade is built to solve real
                            problems we face daily: emotional decision-making, poor journaling
                            habits, and lack of strategy review. That ends here.
                        </p>
                    </article>
                </div>
            </div>
        </section>
    );
};

export default AboutUs;
