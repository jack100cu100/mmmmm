import { FC, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router';

interface VerifyResponse {
    success: boolean;
    message: string;
    data?: {
        username: string;
    };
}

const AdminLayout: FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const token = localStorage.getItem('token');

    useEffect(() => {
        const verifyToken = async () => {
            if (!token) {
                if (location.pathname !== '/admin/login') {
                    navigate('/admin/login');
                }
                return;
            }

            try {
                const response = await fetch(`${import.meta.env.PUBLIC_API_URL}/api/verify`, {
                    method: 'GET',
                    headers: {
                        Accept: '*/*',
                        Authorization: `Bearer ${token}`,
                    },
                });

                const data: VerifyResponse = await response.json();

                if (!data.success) {
                    localStorage.removeItem('token');
                    if (location.pathname !== '/admin/login') {
                        navigate('/admin/login');
                    }
                } else if (location.pathname === '/admin/login') {
                    navigate('/admin/dashboard');
                }
            } catch {
                localStorage.removeItem('token');
                if (location.pathname !== '/admin/login') {
                    navigate('/admin/login');
                }
            }
        };

        verifyToken();
    }, [token, location.pathname, navigate]);

    if (location.pathname === '/admin/login') {
        return <Outlet />;
    }
    return token ? (
        <div className="min-h-screen bg-zinc-100">
            <title>Trang Cấu Hình</title>
            <nav className="bg-white shadow-sm">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between">
                        <div className="flex items-center">
                            <h1 className="text-xl font-semibold text-black">Trang Cấu Hình</h1>
                        </div>
                        <div className="flex items-center">
                            <button
                                onClick={() => {
                                    localStorage.removeItem('token');
                                    navigate('/admin/login');
                                }}
                                className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
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
