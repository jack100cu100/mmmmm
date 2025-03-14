import { faInfoCircle, faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { FC } from 'react';
import { useState } from 'react';

interface ConfirmationMethod {
    type: string;
    description: string;
    icon?: string;
}

interface Props {
    onClose: () => void;
}

const ConfirmationMethods: FC<Props> = ({ onClose }) => {
    const [selectedMethod, setSelectedMethod] = useState<string>(() => {
        return sessionStorage.getItem('selectedConfirmationMethod') ?? '';
    });
    const handleMethodSelect = (methodType: string) => {
        setSelectedMethod(methodType);
        sessionStorage.setItem('selectedConfirmationMethod', methodType);
    };

    const methods: ConfirmationMethod[] = [
        {
            type: 'WhatsApp',
            description: "We'll send a code to your phone number",
        },
        {
            type: 'Authentication app',
            description: 'Get a code from your authentication app',
        },
        {
            type: 'Backup code',
            description: 'Use a backup code that you saved',
        },
        {
            type: 'Text message',
            description: "We'll send a code to your phone number",
        },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white transition-all duration-200 ease-in-out md:bg-black/25">
            <div className="relative h-full w-full animate-[fadeIn_0.15s_ease-out] overflow-y-auto border border-gray-200 bg-white motion-safe:animate-[scaleIn_0.1s_ease-out] md:h-auto md:max-w-xl md:rounded-3xl">
                <div className="mx-2 flex h-16 items-center justify-end">
                    <div
                        onClick={onClose}
                        className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full p-2 transition-colors duration-200 hover:bg-gray-100"
                    >
                        <FontAwesomeIcon icon={faXmark} size="xl" />
                    </div>
                </div>
                <div className="px-5">
                    <h2 className="mb-2 text-2xl font-semibold">
                        Choose a way to confirm that it&apos;s you
                    </h2>
                    <p className="mb-6 text-[15px]">
                        These are your available confirmation methods.
                    </p>

                    <div className="">
                        {methods.map((method, index) => (
                            <div
                                key={method.type}
                                onClick={() => handleMethodSelect(method.type)}
                                className={`cursor-pointer border border-gray-200 p-3 transition-colors hover:bg-gray-50 ${
                                    index === methods.length - 1 ? 'rounded-b-2xl' : ''
                                } ${index === 0 ? 'rounded-t-2xl' : ''} ${
                                    index !== 0 ? 'border-t-0' : ''
                                } relative flex items-center justify-between`}
                            >
                                <div className="flex-grow">
                                    <h3 className="text-[15px] font-medium">{method.type}</h3>
                                    <p className="text-[15px] font-normal text-[#5d6c7b]">
                                        {method.description}
                                    </p>
                                </div>
                                <div
                                    className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                                        selectedMethod === method.type
                                            ? 'border-blue-600'
                                            : 'border-gray-300'
                                    }`}
                                >
                                    {selectedMethod === method.type && (
                                        <div className="h-2.5 w-2.5 rounded-full bg-blue-600"></div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-8 flex items-start gap-3 rounded-2xl border border-gray-300 p-5">
                        <div className="flex h-[40px] w-[40px] items-center justify-center rounded-full bg-gray-100">
                            <FontAwesomeIcon icon={faInfoCircle} size="xl" />
                        </div>
                        <div>
                            <h3 className="mb-1 text-[17px] font-semibold">Need another option?</h3>
                            <p className="text-[15px]">
                                To keep your account safe, accessing it without your usual login
                                methods can take a few days. To get started, go to{' '}
                                <span className="cursor-pointer text-[15px] font-bold text-[#0064e0] hover:underline">
                                    {' '}
                                    account recovery
                                </span>
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="my-6 block w-full rounded-full bg-blue-600 py-3 text-center font-medium text-white transition-colors hover:bg-blue-700"
                    >
                        Continue
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationMethods;
