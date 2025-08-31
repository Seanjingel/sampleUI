import React from 'react';
import { Navigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import TradeList from '../pages/TradeList';
import Overview from '../pages/Overview';
import Profile from '../pages/Profile';
import Setting from '../pages/Setting';
import TradeCalendar from '../pages/TradeCalendar';
import AIInsight from '../pages/AIInsight';
import FundManagement from '../pages/FundManagement';
import TradeDetailsPage from '../pages/TradeDetailsPage';

const ProtectedRoute = ({ children }) => {
  const { state } = useAuth();
  
  if (state.loading) {
    return <div>Loading...</div>;
  }
  
  if (!state.isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return <MainLayout>{children}</MainLayout>;
};

export const routes = [
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <Overview />
      </ProtectedRoute>
    ),
  },
  {
    path: '/trades',
    element: (
      <ProtectedRoute>
        <TradeList />
      </ProtectedRoute>
    ),
  },
  {
    path: '/calendar',
    element: (
      <ProtectedRoute>
        <TradeCalendar />
      </ProtectedRoute>
    ),
  },
  {
    path: '/insights',
    element: (
      <ProtectedRoute>
        <AIInsight />
      </ProtectedRoute>
    ),
  },
  {
    path: '/funds',
    element: (
      <ProtectedRoute>
        <FundManagement />
      </ProtectedRoute>
    ),
  },
  {
    path: '/profile',
    element: (
      <ProtectedRoute>
        <Profile />
      </ProtectedRoute>
    ),
  },
  {
    path: '/settings',
    element: (
      <ProtectedRoute>
        <Setting />
      </ProtectedRoute>
    ),
  },
  {
    path: '/trade/:id',
    element: (
      <ProtectedRoute>
        <TradeDetailsPage />
      </ProtectedRoute>
    ),
  }
];
