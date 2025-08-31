import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from "../common/Button";
import { AuthContext } from '../../contexts/AuthContext';

const Navbar = ({ title, onAddTrade, onLoginClick }) => {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const navigate = useNavigate();
    const { token } = useContext(AuthContext);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };

        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    return (
        <nav
            className={`fixed top-0 w-full z-50 transition-all duration-500 ${scrolled ? 'backdrop-blur-lg bg-black/60 border-gray-700 shadow-lg' : ''}`}
        >
            <div className="flex items-center justify-between max-w-screen-xl mx-auto p-2">
                {/* Logo */}
                <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}> 
                    <img src="/images/logo.png" className="h-12" alt="Logo" />
                    <span className="text-2xl font-semibold text-white">TradeJournal</span>
                </div>

                {/* Hamburger for mobile */}
                <button className="md:hidden text-white focus:outline-none" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>

                {/* Desktop Menu */}
                {!token ? (
                    <div className="hidden md:flex items-center space-x-6">
                        {[{ label: "Home", path: "/#home" }, { label: "Features", path: "/#features" }, { label: "Testimonials", path: "/#testimonials" }, { label: "FAQ", path: "/#faq" }].map((section, index) => (
                            <a
                                key={index}
                                href={section.path}
                                className={`mx-3 cursor-pointer capitalize text-sm transition-colors duration-300 ${scrolled ? 'text-white hover:text-indigo-400' : 'text-gray-300 hover:text-white'}`}
                            >
                                {section.label}
                            </a>
                        ))}
                        <Button onClick={onLoginClick} className="px-6 py-2 ml-4 bg-cyan-900 text-white hover:bg-gray-800 transition-all animate-fadeInUp delay-400">
                            Login
                        </Button>
                    </div>
                ) : (
                    <div className="hidden md:flex items-center justify-between flex-1 ml-10">
                        {/* Private menu here */}
                    </div>
                )}
            </div>
            {/* Mobile Menu Dropdown */}
            {mobileMenuOpen && (
                <div className="md:hidden bg-black/90 backdrop-blur-lg border-t border-gray-700 px-4 py-4">
                    <div className="flex flex-col space-y-4">
                        {[{ label: "Home", path: "/#home" }, { label: "Features", path: "/#features" }, { label: "Testimonials", path: "/#testimonials" }, { label: "FAQ", path: "/#faq" }].map((section, index) => (
                            <a
                                key={index}
                                href={section.path}
                                className="text-white text-lg capitalize"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                {section.label}
                            </a>
                        ))}
                        <Button onClick={() => { setMobileMenuOpen(false); onLoginClick(); }} className="w-full py-2 bg-cyan-900 text-white hover:bg-gray-800">
                            Login
                        </Button>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
