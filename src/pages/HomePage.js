import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Features from '../components/homepage/Features';
import FAQ from '../components/homepage/FAQ';
import Testimonials from '../components/homepage/Testimonials';
import Pricing from '../components/homepage/Pricing';
import HomeSection from "../components/homepage/HomeSection";

const HomePage = () => {
    const { user } = useAuth();
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    if (user) {
        return <Navigate to="/overview" replace />;
    }

    return (
        <div className="w-full min-h-screen bg-gray-200 overflow-x-hidden">
            <HomeSection />
            <div className="w-full">
                <Features />
                <Testimonials />
                <Pricing />
                <FAQ />
            </div>
        </div>  
    );
};

export default HomePage;