import {
    BrowserRouter,
    Routes,
    Route,
    Navigate,
} from 'react-router-dom';


// =========================================================
// Pages
// =========================================================

import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import Sales from '../pages/Sales';
import Credit from '../pages/Credit';
import Products from '../pages/Products';
import ShoppingList from '../pages/ShoppingList';
import Reports from '../pages/Reports';
import Settings from '../pages/Settings';


// =========================================================
// Layout
// =========================================================

import DashboardLayout from '../components/layout/DashboardLayout';


// =========================================================
// Auth Guard
// =========================================================

import ProtectedRoute from '../components/auth/ProtectedRoute';


// =========================================================
// Auth Context
// =========================================================

import {
    AuthProvider,
} from '../context/AuthContext';


// =========================================================
// App Routes
// =========================================================

function AppRoutes() {

    return (

        <BrowserRouter>

            <AuthProvider>

                <Routes>

                    {/* =================================================
                        Login
                    ================================================= */}

                    <Route
                        path="/login"
                        element={
                            <Login />
                        }
                    />


                    {/* =================================================
                        Protected Application
                    ================================================= */}

                    <Route
                        element={
                            <ProtectedRoute>
                                <DashboardLayout />
                            </ProtectedRoute>
                        }
                    >

                        <Route
                            path="/dashboard"
                            element={
                                <Dashboard />
                            }
                        />

                        <Route
                            path="/sales"
                            element={
                                <Sales />
                            }
                        />

                        <Route
                            path="/credit-sales"
                            element={
                                <Credit />
                            }
                        />

                        <Route
                            path="/products"
                            element={
                                <Products />
                            }
                        />

                        <Route
                            path="/shopping-list"
                            element={
                                <ShoppingList />
                            }
                        />

                        <Route
                            path="/reports"
                            element={
                                <Reports />
                            }
                        />

                        <Route
                            path="/settings"
                            element={
                                <Settings />
                            }
                        />

                    </Route>


                    {/* =================================================
                        Root
                    ================================================= */}

                    <Route
                        path="/"
                        element={
                            <Navigate
                                to="/dashboard"
                                replace
                            />
                        }
                    />


                    {/* =================================================
                        404
                    ================================================= */}

                    <Route
                        path="*"
                        element={
                            <Navigate
                                to="/dashboard"
                                replace
                            />
                        }
                    />

                </Routes>

            </AuthProvider>

        </BrowserRouter>

    );
}


export default AppRoutes;