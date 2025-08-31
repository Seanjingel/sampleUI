// components/Footer.jsx
import { Link } from 'react-router-dom';
export default function Footer() {
    return (
        <footer className="bg-gray-900 text-white px-6 md:px-16 py-10">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 text-sm">
                {/* Logo & Description */}
                <div>
                    <div className="flex items-center space-x-3 mb-4">
                        <div className="bg-white text-black font-bold">
                            <img src="/images/logo.png" className="h-12" alt="Logo" />
                        </div>
                        <h1 className="text-xl font-semibold">MyTrade</h1>
                    </div>
                    <p className="text-gray-400">
                        The trading journal serious traders use to track, analyze, and improve their trading results.
                    </p>
                    <div className="mt-4 space-y-2 text-gray-400">
                        <p>📧 support@mytrade.app</p>
                        {/*<div className="flex space-x-4 text-lg">*/}
                        {/*    <a href=""><i className="fab fa-twitter" /></a>*/}
                        {/*    <a href=""><i className="fab fa-instagram" /></a>*/}
                        {/*</div>*/}
                    </div>
                </div>

                {/* Quick Links */}
                <div>
                    <h3 className="font-semibold mb-2">Quick Links</h3>
                    <ul className="space-y-2 text-gray-400">
                        <li><Link to="/">
                            Home
                        </Link></li>
                        <li><Link to="/aboutus">
                            About Us
                        </Link></li>
                        <li><Link to="/contactus">
                            Contact Us
                        </Link></li>
                    </ul>
                </div>

                {/* Legal */}
                <div>
                    <h3 className="font-semibold mb-2">Legal</h3>
                    <ul className="space-y-2 text-gray-400">
                        {/*<li><a href="#">Terms of Service</a></li>*/}
                        {/*<li><a href="#">Refund Policy</a></li>*/}
                        {/*<li><a href="#">GDPR Policy</a></li>*/}
                    </ul>
                </div>
            </div>

            <div className="border-t border-gray-700 mt-10 pt-6 text-center text-gray-500 text-sm">
                © 2025 MyTrade. All rights reserved.
            </div>
        </footer>
    );
}
