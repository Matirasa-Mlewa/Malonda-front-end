import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Auth Screens
import LoginScreen from './screens/auth/LoginScreen';
import OtpScreen from './screens/auth/OtpScreen';
import RegisterScreen from './screens/auth/RegisterScreen';
import IdVerifyScreen from './screens/auth/IdVerifyScreen';

// Public layout (home, search, product detail — no login needed)
import PublicLayout from './components/layout/PublicLayout';
import HomeScreen from './screens/main/HomeScreen';
import SearchScreen from './screens/main/SearchScreen';
import ProductDetailScreen from './screens/products/ProductDetailScreen';
import SellerProfileScreen from './screens/profile/SellerProfileScreen';

// Protected layout (requires login)
import MainLayout from './components/layout/MainLayout';
import CartScreen from './screens/cart/CartScreen';
import CheckoutScreen from './screens/cart/CheckoutScreen';
import PaymentSuccessScreen from './screens/cart/PaymentSuccessScreen';
import OrdersScreen from './screens/orders/OrdersScreen';
import OrderDetailScreen from './screens/orders/OrderDetailScreen';
import ConfirmDeliveryScreen from './screens/orders/ConfirmDeliveryScreen';
import DisputeScreen from './screens/orders/DisputeScreen';
import ChatListScreen from './screens/chat/ChatListScreen';
import ChatScreen from './screens/chat/ChatScreen';
import ProfileScreen from './screens/profile/ProfileScreen';
import WishlistScreen from './screens/profile/WishlistScreen';
import NotificationsScreen from './screens/profile/NotificationsScreen';
import ReportScreen from './screens/profile/ReportScreen';
import AddProductScreen from './screens/products/AddProductScreen';
import EditProductScreen from './screens/products/EditProductScreen';
import SellerDashboardScreen from './screens/seller/SellerDashboardScreen';
import SellerAnalyticsScreen from './screens/seller/SellerAnalyticsScreen';
import AdminPanelScreen from './screens/admin/AdminPanelScreen';

// ─── Auth-only route wrapper ──────────────────────────────────────────────────
function ProtectedRoute({ children, requiredRole }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (requiredRole && user.role !== requiredRole) return <Navigate to="/" replace />;
  return children;
}

// ─── Redirect logged-in users away from auth pages ───────────────────────────
function AuthOnlyRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;
  if (user) return <Navigate to="/" replace />;
  return children;
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* ── Auth screens (no layout) ── */}
      <Route path="/login"     element={<AuthOnlyRoute><LoginScreen /></AuthOnlyRoute>} />
      <Route path="/otp"       element={<AuthOnlyRoute><OtpScreen /></AuthOnlyRoute>} />
      <Route path="/register"  element={<AuthOnlyRoute><RegisterScreen /></AuthOnlyRoute>} />
      <Route path="/verify-id" element={<ProtectedRoute><IdVerifyScreen /></ProtectedRoute>} />

      {/* ── PUBLIC routes — no login required ── */}
      <Route element={<PublicLayout />}>
        <Route path="/"           element={<HomeScreen />} />
        <Route path="/search"     element={<SearchScreen />} />
        <Route path="/product/:id" element={<ProductDetailScreen />} />
        <Route path="/seller/:id"  element={<SellerProfileScreen />} />
      </Route>

      {/* ── PROTECTED routes — login required ── */}
      <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
        <Route path="/cart"    element={<CartScreen />} />
        <Route path="/orders"  element={<OrdersScreen />} />
        <Route path="/profile" element={<ProfileScreen />} />
      </Route>

      {/* ── Protected standalone screens ── */}
      <Route path="/checkout"              element={<ProtectedRoute><CheckoutScreen /></ProtectedRoute>} />
      <Route path="/payment-success"       element={<ProtectedRoute><PaymentSuccessScreen /></ProtectedRoute>} />
      <Route path="/orders/:id"            element={<ProtectedRoute><OrderDetailScreen /></ProtectedRoute>} />
      <Route path="/orders/:id/confirm"    element={<ProtectedRoute><ConfirmDeliveryScreen /></ProtectedRoute>} />
      <Route path="/orders/:id/dispute"    element={<ProtectedRoute><DisputeScreen /></ProtectedRoute>} />
      <Route path="/messages"              element={<ProtectedRoute><ChatListScreen /></ProtectedRoute>} />
      <Route path="/messages/:userId"      element={<ProtectedRoute><ChatScreen /></ProtectedRoute>} />
      <Route path="/wishlist"              element={<ProtectedRoute><WishlistScreen /></ProtectedRoute>} />
      <Route path="/notifications"         element={<ProtectedRoute><NotificationsScreen /></ProtectedRoute>} />
      <Route path="/report"                element={<ProtectedRoute><ReportScreen /></ProtectedRoute>} />
      <Route path="/product/add"           element={<ProtectedRoute><AddProductScreen /></ProtectedRoute>} />
      <Route path="/product/edit/:id"      element={<ProtectedRoute><EditProductScreen /></ProtectedRoute>} />
      <Route path="/seller-dashboard"      element={<ProtectedRoute><SellerDashboardScreen /></ProtectedRoute>} />
      <Route path="/seller-analytics"      element={<ProtectedRoute><SellerAnalyticsScreen /></ProtectedRoute>} />
      <Route path="/admin"                 element={<ProtectedRoute requiredRole="admin"><AdminPanelScreen /></ProtectedRoute>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
