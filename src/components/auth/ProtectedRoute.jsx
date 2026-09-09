import {
    Navigate,
    useLocation,
} from 'react-router-dom';

import {
    useAuth,
} from '../../context/AuthContext';


// =========================================================
// Protected Route
// =========================================================

function ProtectedRoute({ children }) {

    const {
        isAuthenticated,
        loading,
    } = useAuth();


    const location =
        useLocation();


    // =====================================================
    // Loading
    // =====================================================

    if (loading) {

        return (

            <div
                dir="rtl"
                className="
                    min-h-screen
                    bg-slate-950
                    flex
                    items-center
                    justify-center
                    text-slate-400
                "
            >

                <div
                    className="
                        flex
                        flex-col
                        items-center
                        gap-3
                    "
                >

                    <div
                        className="
                            w-8
                            h-8
                            rounded-full
                            border-2
                            border-slate-700
                            border-t-emerald-400
                            animate-spin
                        "
                    />

                    <span className="text-sm">
                        در حال بررسی حساب...
                    </span>

                </div>

            </div>

        );

    }


    // =====================================================
    // Not Authenticated
    // =====================================================

    if (!isAuthenticated) {

        return (

            <Navigate
                to="/login"
                replace
                state={{
                    from: location,
                }}
            />

        );

    }


    // =====================================================
    // Authenticated
    // =====================================================

    return children;

}


export default ProtectedRoute;