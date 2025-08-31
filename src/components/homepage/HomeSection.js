import React from 'react';
import Button from "../common/Button";

const HomeSection = () => (
    <section
        id="home"
        className="relative min-h-screen flex items-center justify-center text-white overflow-hidden bg-cover bg-center"
        style={{ backgroundImage: `url(/images/homepage/homepage5.png)` }}
    >
        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-black/70 z-0"></div>

        {/* Floating Blobs */}
        {/*<div className="absolute top-20 left-10 w-64 h-64 bg-indigo-400 opacity-20 rounded-full filter blur-3xl animate-pulse"></div>*/}
        {/*<div className="absolute bottom-20 right-10 w-72 h-72 bg-teal-400 opacity-20 rounded-full filter blur-3xl animate-pulse animation-delay-2000"></div>*/}

        {/* Main Content */}
        <div className="relative z-10 text-center px-4 md:px-0 max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-4 animate-fadeInUp">
                India's #1
                Trading Journal<br/>
                <br/>
                Simplify Your <span className="text-indigo-400">Trading Journal</span>
            </h1>
            <p className="text-lg md:text-xl mb-6 animate-fadeInUp delay-200">
                Track your trades, analyze performance, and grow as a trader with ease.
            </p>
            <a href="#pricing">
                <Button
                    className="bg-cyan-900 text-white hover:bg-gray-900 px-8 py-3 rounded-lg shadow-lg transition-all animate-fadeInUp delay-400">
                    Get Started
                </Button>
            </a>    
        </div>

        {/* Scroll Down Arrow */}
        {/*<div className="absolute bottom-10 w-full flex justify-center z-10">*/}
        {/*    <a href="#features" className="animate-bounce">*/}
        {/*        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">*/}
        {/*            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />*/}
        {/*        </svg>*/}
        {/*    </a>*/}
        {/*</div>*/}
    </section>
);

export default HomeSection;