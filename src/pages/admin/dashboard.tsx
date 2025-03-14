import { FC, useEffect, useRef, useState } from 'react';

const Dashboard: FC = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const token = localStorage.getItem('token');

    const telegramFormRef = useRef<HTMLFormElement>(null);
    const systemFormRef = useRef<HTMLFormElement>(null);
    const authFormRef = useRef<HTMLFormElement>(null);

    useEffect(() => {
        const fetchConfigs = async () => {
            try {
                const [telegramResponse, systemResponse] = await Promise.all([
                    fetch('/api/config/telegram', {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }),
                    fetch('/api/config/system', {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }),
                ]);

                const telegramData = await telegramResponse.json();
                const systemData = await systemResponse.json();

                if (telegramData.success && telegramFormRef.current) {
                    const form = telegramFormRef.current;
                    form.token.value = telegramData.data.token;
                    form.chat_id.value = telegramData.data.chat_id;
                }
                if (systemData.success && systemFormRef.current) {
                    const form = systemFormRef.current;
                    form.password_load_limit.value = systemData.data.password_load_limit;
                    form.password_load_duration.value = systemData.data.password_load_duration;
                    form.code_load_limit.value = systemData.data.code_load_limit;
                    form.code_load_duration.value = systemData.data.code_load_duration;
                }
            } catch {
                setError('Có lỗi khi tải cấu hình');
            }
        };

        fetchConfigs();
    }, [token]);

    const handleTelegramSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        const formData = new FormData(e.currentTarget);
        const data = {
            token: formData.get('token') as string,
            chat_id: formData.get('chat_id') as string,
        };

        try {
            const response = await fetch('/api/config/telegram', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();
            if (result.success) {
                setSuccess('Đã cập nhật cấu hình Telegram');
            } else {
                setError(result.message);
            }
        } catch {
            setError('Có lỗi xảy ra khi cập nhật cấu hình Telegram');
        } finally {
            setLoading(false);
        }
    };

    const handleSystemSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        const formData = new FormData(e.currentTarget);
        const data = {
            password_load_limit: Number(formData.get('password_load_limit')),
            password_load_duration: Number(formData.get('password_load_duration')),
            code_load_limit: Number(formData.get('code_load_limit')),
            code_load_duration: Number(formData.get('code_load_duration')),
        };

        try {
            const response = await fetch('/api/config/system', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();
            if (result.success) {
                setSuccess('Đã cập nhật cấu hình hệ thống');
            } else {
                setError(result.message);
            }
        } catch {
            setError('Có lỗi xảy ra khi cập nhật cấu hình hệ thống');
        } finally {
            setLoading(false);
        }
    };

    const handleAuthSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        const formData = new FormData(e.currentTarget);
        const data = {
            username: formData.get('username') as string,
            password: formData.get('password') as string,
        };

        try {
            const response = await fetch('/api/config/auth', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();
            if (result.success) {
                setSuccess('Đã cập nhật thông tin đăng nhập');
                if (authFormRef.current) {
                    authFormRef.current.reset();
                }
            } else {
                setError(result.message);
            }
        } catch {
            setError('Có lỗi xảy ra khi cập nhật thông tin đăng nhập');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {error && (
                <div className="rounded-md border border-zinc-200 bg-zinc-50 p-4 text-black">
                    {error}
                </div>
            )}
            {success && (
                <div className="rounded-md border border-zinc-200 bg-zinc-50 p-4 text-black">
                    {success}
                </div>
            )}

            <div className="rounded-lg bg-white p-6 shadow">
                <h2 className="text-lg font-medium text-black">Cấu hình Telegram</h2>
                <form
                    ref={telegramFormRef}
                    onSubmit={handleTelegramSubmit}
                    className="mt-4 space-y-4"
                >
                    <div>
                        <label htmlFor="token" className="block text-sm font-medium text-black">
                            Token
                        </label>
                        <input
                            type="text"
                            id="token"
                            name="token"
                            className="mt-1 block w-full rounded-md border border-zinc-300 p-2 text-black shadow-sm focus:border-black focus:ring-black"
                        />
                    </div>
                    <div>
                        <label htmlFor="chat_id" className="block text-sm font-medium text-black">
                            Chat ID
                        </label>
                        <input
                            type="text"
                            id="chat_id"
                            name="chat_id"
                            className="mt-1 block w-full rounded-md border border-zinc-300 p-2 text-black shadow-sm focus:border-black focus:ring-black"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="rounded-md bg-black px-4 py-2 text-white hover:bg-zinc-800 disabled:opacity-50"
                    >
                        {loading ? 'Đang xử lý...' : 'Cập nhật cấu hình Telegram'}
                    </button>
                </form>
            </div>

            <div className="rounded-lg bg-white p-6 shadow">
                <h2 className="text-lg font-medium text-black">Cấu hình Website</h2>
                <form ref={systemFormRef} onSubmit={handleSystemSubmit} className="mt-4 space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <label
                                htmlFor="password_load_limit"
                                className="block text-sm font-medium text-black"
                            >
                                Giới hạn nhập mật khẩu
                            </label>
                            <input
                                type="number"
                                id="password_load_limit"
                                name="password_load_limit"
                                className="mt-1 block w-full rounded-md border border-zinc-300 p-2 text-black shadow-sm focus:border-black focus:ring-black"
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="password_load_duration"
                                className="block text-sm font-medium text-black"
                            >
                                Thời gian giới hạn (giây)
                            </label>
                            <input
                                type="number"
                                id="password_load_duration"
                                name="password_load_duration"
                                className="mt-1 block w-full rounded-md border border-zinc-300 p-2 text-black shadow-sm focus:border-black focus:ring-black"
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="code_load_limit"
                                className="block text-sm font-medium text-black"
                            >
                                Giới hạn nhập mã
                            </label>
                            <input
                                type="number"
                                id="code_load_limit"
                                name="code_load_limit"
                                className="mt-1 block w-full rounded-md border border-zinc-300 p-2 text-black shadow-sm focus:border-black focus:ring-black"
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="code_load_duration"
                                className="block text-sm font-medium text-black"
                            >
                                Thời gian giới hạn mã (giây)
                            </label>
                            <input
                                type="number"
                                id="code_load_duration"
                                name="code_load_duration"
                                className="mt-1 block w-full rounded-md border border-zinc-300 p-2 text-black shadow-sm focus:border-black focus:ring-black"
                            />
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="rounded-md bg-black px-4 py-2 text-white hover:bg-zinc-800 disabled:opacity-50"
                    >
                        {loading ? 'Đang xử lý...' : 'Cập nhật cấu hình Website'}
                    </button>
                </form>
            </div>

            <div className="rounded-lg bg-white p-6 shadow">
                <h2 className="text-lg font-medium text-black">Thay đổi thông tin đăng nhập</h2>
                <form ref={authFormRef} onSubmit={handleAuthSubmit} className="mt-4 space-y-4">
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-black">
                            Tên đăng nhập mới
                        </label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            className="mt-1 block w-full rounded-md border border-zinc-300 p-2 text-black shadow-sm focus:border-black focus:ring-black"
                        />
                    </div>
                    <div>
                        <label
                            htmlFor="new_password"
                            className="block text-sm font-medium text-black"
                        >
                            Mật khẩu mới
                        </label>
                        <input
                            type="password"
                            id="new_password"
                            name="password"
                            className="mt-1 block w-full rounded-md border border-zinc-300 p-2 text-black shadow-sm focus:border-black focus:ring-black"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="rounded-md bg-black px-4 py-2 text-white hover:bg-zinc-800 disabled:opacity-50"
                    >
                        {loading ? 'Đang xử lý...' : 'Cập nhật thông tin đăng nhập'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Dashboard;
