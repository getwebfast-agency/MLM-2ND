import React, { useEffect, useState } from 'react';
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
import ScrollToTop from './components/ScrollToTop';
import About from './pages/About';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import MyTeam from './pages/MyTeam';
import Cart from './pages/Cart';
import Withdrawals from './pages/Withdrawals';
import { CartProvider } from './context/CartContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import API_URL from './config';

// ── Backend wake-up ping ──────────────────────────────────────────────
// Render free tier spins down after inactivity. This pings the server
// on app load so it wakes up early, and shows a friendly status overlay.
const PING_TIMEOUT_MS = 12000; // Show "waking up" message after 12s

function useBackendWakeUp() {
    const [status, setStatus] = useState('checking'); // checking | awake | slow

    useEffect(() => {
        let slowTimer;
        let done = false;

        const ping = async () => {
            slowTimer = setTimeout(() => {
                if (!done) setStatus('slow');
            }, PING_TIMEOUT_MS);

            try {
                await fetch(`${API_URL}/health`, { method: 'GET', cache: 'no-cache' });
                done = true;
                clearTimeout(slowTimer);
                setStatus('awake');
            } catch {
                // Even if /health 404s, the server responded (it's awake)
                done = true;
                clearTimeout(slowTimer);
                setStatus('awake');
            }
        };

        ping();
        return () => clearTimeout(slowTimer);
    }, []);

    return status;
}

// ── Backend status banner ─────────────────────────────────────────────
function BackendStatusBanner({ status }) {
    if (status === 'awake' || status === 'checking') return null;

    return (
        <div
            style={{
                position: 'fixed',
                bottom: '20px',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 9998,
                background: 'rgba(17, 24, 39, 0.92)',
                backdropFilter: 'blur(8px)',
                color: '#fff',
                padding: '12px 20px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
                fontSize: '14px',
                fontFamily: "'Inter', sans-serif",
                maxWidth: '92vw',
                whiteSpace: 'nowrap',
            }}
        >
            <span
                style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: '#818cf8',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                    flexShrink: 0,
                    display: 'inline-block',
                }}
            />
            <span>
                <strong>Server is waking up</strong>
                <span style={{ color: '#9ca3af', marginLeft: '6px' }}>
                    — This may take up to a minute on first load.
                </span>
            </span>
        </div>
    );
}

// ── Auth guard ────────────────────────────────────────────────────────
const PrivateRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return (
        <div className="flex justify-center items-center h-64">
            <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        </div>
    );
    return user ? children : <Navigate to="/login" />;
};

// ── Main content ──────────────────────────────────────────────────────
const AppContent = () => {
    const location = useLocation();
    const isAdmin = location.pathname.startsWith('/admin');
    const backendStatus = useBackendWakeUp();

    // Dismiss the native HTML loader once React has mounted
    useEffect(() => {
        if (typeof window.__hideLoader === 'function') {
            window.__hideLoader();
        }
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <BackendStatusBanner status={backendStatus} />
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
                        path="/withdrawals"
                        element={
                            <PrivateRoute>
                                <Withdrawals />
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

// ── Root ──────────────────────────────────────────────────────────────
function App() {
    return (
        <AuthProvider>
            <CartProvider>
                <Router>
                    <ScrollToTop />
                    <AppContent />
                </Router>
            </CartProvider>
        </AuthProvider>
    );
}

export default App;
