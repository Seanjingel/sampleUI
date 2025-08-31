import {FileText, BarChart2, User, Calendar, Settings, Brain, Wallet, LogOut} from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Sidebar = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout(navigate);
    };

    const menuItems = [
        { label: 'Overview', icon: <BarChart2 size={20} />, to: '/overview' },
        { label: 'Trade Log', icon: <FileText size={20} />, to: '/trade-log' },
        { label: 'Trade Calendar', icon: <Calendar size={20} />, to: '/trade-calendar' },
        { label: 'AI Insight', icon: <Brain size={20} />, to: '/ai-insight' },
        { label: 'Fund Management', icon: <Wallet size={20} />, to: '/fund-management' },
    ];

    const userItems = [
        { label: 'Profile', icon: <User size={20} />, to: '/account-details' },
        { label: 'Settings', icon: <Settings size={20} />, to: '/settings' },
    ];

    return (
        <div className="bg-gray-900 text-white w-64 min-h-screen flex flex-col fixed ">
            {/* Logo */}
            <div className="flex items-center justify-start h-20 pl-4">
                <img src="/images/logo.png" alt="Logo" className="h-12 object-contain" />
                <span className="ml-2 text-lg font-semibold tracking-wide">Trade Journal</span>
            </div>

            {/* Navigation */}
            <nav className="p-4 space-y-6 flex-1 overflow-y-auto">
                <div className="space-y-4">
                    <h3 className="text-gray-400 text-xs uppercase">Navigation</h3>
                    {menuItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({isActive}) =>
                                isActive
                                    ? "flex items-center gap-2 text-green-400"
                                    : "flex items-center gap-2 hover:text-green-400"
                            }
                        >
                            {item.icon} {item.label}
                        </NavLink>
                    ))}
                </div>

                {/* User Section */}
                <div className="space-y-4">
                    <h3 className="text-gray-400 text-xs uppercase mb-2">User</h3>
                    {userItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({isActive}) =>
                                isActive
                                    ? "flex items-center gap-2 px-0.5 py-1 text-green-400"
                                    : "flex items-center gap-2 px-0.5 py-1 hover:text-green-400"
                            }
                        >
                            {item.icon} {item.label}
                        </NavLink>
                    ))}
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-0.5 py-1 text-red-400 hover:text-red-600"
                    >
                        <LogOut size={20}/> Logout
                    </button>
                </div>
            </nav>
        </div>
    );
};

export default Sidebar;
