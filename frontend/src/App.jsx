import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Orders from './pages/Orders';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import About from './pages/About';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import MyTeam from './pages/MyTeam';
import Cart from './pages/Cart';
import { CartProvider } from './context/CartContext';
import { AuthProvider, useAuth } from './context/AuthContext';

const PrivateRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return <div>Loading...</div>;
    return user ? children : <Navigate to="/login" />;
};

const AppContent = () => {
    const location = useLocation();
    const isAdmin = location.pathname.startsWith('/admin');

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />
            <div className="flex-grow">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/terms" element={<Terms />} />
                    <Route path="/privacy" element={<Privacy />} />
                    <Route path="/products" element={<Products />} />
                    <Route path="/products/:id" element={<ProductDetail />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/orders" element={<Orders />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route
                        path="/dashboard"
                        element={
                            <PrivateRoute>
                                <Dashboard />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/team"
                        element={
                            <PrivateRoute>
                                <MyTeam />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/admin/*"
                        element={
                            <PrivateRoute>
                                <AdminDashboard />
                            </PrivateRoute>
                        }
                    />
                </Routes>
            </div>
            {!isAdmin && <Footer />}
        </div>
    );
};

function App() {
    return (
        <AuthProvider>
            <CartProvider>
                <Router>
                    <AppContent />
                </Router>
            </CartProvider>
        </AuthProvider>
    );
}

export default App;
