import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/common/Layout';
import HomePage from './pages/HomePage';
import AboutUs from './pages/AboutUs';
import ContactForm from './components/homepage/ContactForm';
import Overview from './pages/Overview';
import TradeList from './pages/TradeList';
import Profile from "./pages/Profile";
import TradeCalendar from './pages/TradeCalendar';
import Setting from "./pages/Setting";
import AIInsight from "./pages/AIInsight";
import FundManagement from "./pages/FundManagement";
import LoginRedirect from './components/auth/LoginRedirect';
import ProtectedRoute from './routes/ProtectedRoute';
import { BarChart2, FileText, User, Calendar, Settings, Wallet, Bot } from 'lucide-react';

// App routes
const publicRoutes = [
    { path: '/', component: HomePage },
    { path: '/aboutus', component: AboutUs },
    { path: '/contactus', component: ContactForm },
];
const protectedRoutes = [
    { path: '/overview', component: Overview, pageTitle: 'Overview', pageIcon: <BarChart2 size={20} className="text-green-700" /> },
    { path: '/trade-log', component: TradeList, pageTitle: 'Trade Log', pageIcon: <FileText size={20} className="text-green-700" /> },
    { path: '/account-details', component: Profile, pageTitle: 'Profile', pageIcon: <User size={20} className="text-green-700" /> },
    { path: '/trade-calendar', component: TradeCalendar, pageTitle: 'Trade Calendar', pageIcon: <Calendar size={20} className="text-green-700" /> },
    { path: '/ai-insight', component: AIInsight, pageTitle: 'AI Insight', pageIcon: <Bot size={20} className="text-green-700" /> },
    { path: '/fund-management', component: FundManagement, pageTitle: 'Fund Management', pageIcon: <Wallet size={20} className="text-green-700" /> },
    { path: '/settings', component: Setting, pageTitle: 'Settings', pageIcon: <Settings size={20} className="text-green-700" /> },
];

const AppRoutes = () => {
    const { user } = useAuth();
    const [showLoginModal, setShowLoginModal] = useState(false);
    
    return (
        <Routes>
            {/* Login redirect route */}
            <Route
                path="/login"
                element={<LoginRedirect setShowLoginModal={setShowLoginModal} />}
            />
            
            {/* Public routes */}
            {publicRoutes.map(({ path, component: Component }) => (
                path === '/' ? (
                    <Route
                        key={path}
                        path={path}
                        element={
                            user ? (
                                <Navigate to="/overview" replace />
                            ) : (
                                <Layout isPublic showLoginModal={showLoginModal} setShowLoginModal={setShowLoginModal}>
                                    <Component />
                                </Layout>
                            )
                        }
                    />
                ) : (
                    <Route
                        key={path}
                        path={path}
                        element={
                            <Layout isPublic showLoginModal={showLoginModal} setShowLoginModal={setShowLoginModal}>
                                <Component />
                            </Layout>
                        }
                    />
                )
            ))}
            {/* Protected routes */}
            {protectedRoutes.map(({ path, component: Component, pageTitle, pageIcon }) => (
                <Route
                    key={path}
                    path={path}
                    element={
                        <ProtectedRoute>
                            <Layout pageTitle={pageTitle} pageIcon={pageIcon}>
                                <Component />
                            </Layout>
                        </ProtectedRoute>
                    }
                />
            ))}
        </Routes>
    );
};

function App() {
    return (
        <AuthProvider>
            <Router>
                <AppRoutes />
            </Router>
        </AuthProvider>
    );
}

export default App;