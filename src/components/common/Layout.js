import React, { useState } from "react";
import Sidebar from "../Sidebar";
import Navbar from '../homepage/Navbar';
import Footer from '../Footer';
import TradeModal from "../modals/TradeModal";
import LoginModal from '../modals/LoginModal';
import RegisterModal from '../modals/RegisterModal';
import { ToastContainer } from "../ToastNotification";
import { Menu } from 'lucide-react';
import Button from './Button';

const Layout = ({ 
    children, 
    isPublic = false, 
    pageTitle, 
    pageIcon, 
    showLoginModal: externalShowLoginModal, 
    setShowLoginModal: externalSetShowLoginModal 
}) => {
    const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    
    // Use external state if provided, otherwise use local state
    const [internalShowLoginModal, setInternalShowLoginModal] = useState(false);
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    
    // Use the external state if provided, otherwise fall back to internal state
    const showLoginModal = externalShowLoginModal !== undefined ? externalShowLoginModal : internalShowLoginModal;
    const setShowLoginModal = externalSetShowLoginModal || setInternalShowLoginModal;

    // Modal handlers
    const handleOpenLogin = () => {
        setShowLoginModal(true);
        setShowRegisterModal(false);
    };
    const handleOpenRegister = () => {
        setShowRegisterModal(true);
        setShowLoginModal(false);
    };
    const handleCloseModals = () => {
        setShowLoginModal(false);
        setShowRegisterModal(false);
    };

    return (
        <div className={`min-h-screen flex flex-col ${isPublic ? 'bg-transparent w-full p-0 m-0' : 'bg-gray-100'}`}>
            {/* Navbar for public routes */}
            {isPublic && <Navbar onLoginClick={handleOpenLogin} />}
            <div className="flex flex-1">
                {/* Sidebar for protected routes */}
                {!isPublic && (
                    <>
                        {/* Desktop Sidebar */}
                        <div className="hidden md:block fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-30">
                            <Sidebar />
                        </div>
                        {/* Mobile Sidebar Drawer */}
                        {isSidebarOpen && (
                            <div className="fixed inset-0 z-40 flex">
                                <div className="w-64 bg-white shadow-lg h-full">
                                    <Sidebar />
                                </div>
                                <div
                                    className="flex-1 bg-black bg-opacity-50"
                                    onClick={() => setIsSidebarOpen(false)}
                                />
                            </div>
                        )}
                    </>
                )}
                {/* Main Content */}
                <main className={`flex-1 ${!isPublic ? 'ml-0 md:ml-64 p-0' : 'w-full p-0'} transition-all duration-300`}> 
                    {/* Protected route navbar */}
                    {!isPublic && (
                        <div className="flex items-center justify-between px-4 py-3 bg-white shadow-sm border-b sticky top-0 z-20">
                            {/* Left side: Hamburger menu for mobile and Page Title/Icon */}
                            <div className="flex items-center gap-4">
                                {/* Hamburger menu for mobile */}
                                <button
                                    className="md:hidden p-2 rounded text-gray-700 hover:bg-gray-200"
                                    onClick={() => setIsSidebarOpen(true)}
                                    aria-label="Open sidebar"
                                >
                                    <Menu size={28} />
                                </button>
                                {/* Page Title and Icon */}
                                <div className="flex items-center gap-2">
                                    {pageIcon && <span>{pageIcon}</span>}
                                    {pageTitle && <span className="text-xl font-semibold text-gray-800">{pageTitle}</span>}
                                </div>
                            </div>

                            {/* Trade Button using Button.js - Enhanced with Features */}
                            <div className="relative group">
                                <Button
                                    variant="custom"
                                    size="md"
                                    className="relative overflow-hidden bg-gray-900 hover:bg-gray-800 text-white font-bold py-2 px-5 rounded-lg shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
                                    onClick={() => setIsTradeModalOpen(true)}
                                >
                                    <span className="flex items-center">    
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                        Trade
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </span>
                                    <span className="absolute inset-0 bg-white rounded-lg opacity-20 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
                                </Button>
                                
                                {/* Dropdown Menu */}
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                                    <div className="py-1">
                                        <button 
                                            onClick={() => setIsTradeModalOpen(true)}
                                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-green-50 w-full text-left"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                            </svg>
                                            Add New Trade
                                        </button>
                                        <button 
                                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-green-50 w-full text-left"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                            </svg>
                                            Import Trades
                                        </button>
                                        <button 
                                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-green-50 w-full text-left"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            Schedule Trade
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    {/* Main page content */}
                    <div className={isPublic ? 'w-full p-0 m-0' : 'p-4'}>
                        {children}
                    </div>
                </main>
            </div>
            {/* Footer for public routes */}
            {isPublic && <Footer />}
            {/* Toasts and Modals */}
            <ToastContainer />
            <TradeModal isOpen={isTradeModalOpen} onClose={() => setIsTradeModalOpen(false)} />
            <LoginModal isOpen={showLoginModal} onClose={handleCloseModals} onRegisterClick={handleOpenRegister} />
            <RegisterModal isOpen={showRegisterModal} onClose={handleCloseModals} onLoginClick={handleOpenLogin} />
        </div>
    );
};

export default Layout;
