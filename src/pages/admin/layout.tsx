import { FC, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router';

const AdminLayout: FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const token = localStorage.getItem('token');

    useEffect(() => {
        if (!token && location.pathname !== '/admin/login') {
            navigate('/admin/login');
        } else if (token && location.pathname === '/admin/login') {
            navigate('/admin/dashboard');
        }
    }, [token, location.pathname, navigate]);

    if (location.pathname === '/admin/login') {
        return <Outlet />;
    }

    return token ? (
        <div className="min-h-screen bg-gray-100">
            <nav className="bg-white shadow-sm">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between">
                        <div className="flex items-center">
                            <h1 className="text-xl font-semibold">Trang Quản Trị</h1>
                        </div>
                        <div className="flex items-center">
                            <button
                                onClick={() => {
                                    localStorage.removeItem('token');
                                    navigate('/admin/login');
                                }}
                                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                            >
                                Đăng xuất
                            </button>
                        </div>
                    </div>
                </div>
            </nav>
            <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                <Outlet />
            </main>
        </div>
    ) : null;
};

export default AdminLayout;
