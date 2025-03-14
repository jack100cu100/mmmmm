import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FC, useState } from 'react';
import { useNavigate } from 'react-router';
interface LoginResponse {
    success: boolean;
    message: string;
    data?: {
        token: string;
        type: string;
    };
}

const Login: FC = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch(`${import.meta.env.API_URL}/api/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const data: LoginResponse = await response.json();

            if (data.success) {
                localStorage.setItem('token', data.data?.token ?? '');
                navigate('/admin/dashboard');
            } else {
                setError(data.message);
            }
        } catch {
            setError('Có lỗi xảy ra khi đăng nhập');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-100 px-4 py-12 sm:px-6 lg:px-8">
            <title>Đăng nhập</title>
            <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-10 shadow-lg">
                <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                    {error && (
                        <div
                            className="relative rounded border border-zinc-200 bg-zinc-50 px-4 py-3 text-black"
                            role="alert"
                        >
                            {error}
                        </div>
                    )}
                    <div className="-space-y-px rounded-md shadow-sm">
                        <div>
                            <label htmlFor="username" className="sr-only">
                                Tên đăng nhập
                            </label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                required
                                className="relative block w-full appearance-none rounded-none rounded-t-md border border-zinc-300 px-3 py-2 text-black placeholder-zinc-500 focus:z-10 focus:border-black focus:ring-black sm:text-sm"
                                placeholder="Tên đăng nhập"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">
                                Mật khẩu
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="relative block w-full appearance-none rounded-none rounded-b-md border border-zinc-300 px-3 py-2 text-black placeholder-zinc-500 focus:z-10 focus:border-black focus:ring-black sm:text-sm"
                                placeholder="Mật khẩu"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative flex w-full justify-center rounded-md border border-transparent bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:opacity-50"
                        >
                            {loading ? (
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                    <FontAwesomeIcon
                                        icon={faSpinner}
                                        className="h-5 w-5 animate-spin text-white"
                                    />
                                </span>
                            ) : null}
                            {loading ? 'Đang xử lý...' : 'Đăng nhập'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
