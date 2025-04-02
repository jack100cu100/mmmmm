import { Outlet, useLocation } from 'react-router';
import { useEffect } from 'react';
import country_to_language from '@/assets/country_to_language.json';

interface TranslateElementConstructor {
    new (
        options: {
            pageLanguage: string;
            includedLanguages: string;
            autoDisplay: boolean;
        },
        elementId: string,
    ): TranslateElement;
    getInstance(): TranslateInstance | null;
}

interface TranslateInstance {
    setEnabled(enabled: boolean): void;
}

interface TranslateElement {
    getInstance(): TranslateInstance | null;
}

interface GoogleTranslate {
    translate: {
        TranslateElement: TranslateElementConstructor;
    };
}

declare global {
    interface Window {
        googleTranslateElementInit: () => void;
        google: GoogleTranslate;
    }
}

const attemptTranslation = (languageCode: string, retryCount = 0) => {
    const maxRetries = 20;
    const retryInterval = 300;

    const gtcombo = document.querySelector<HTMLSelectElement>('.goog-te-combo');
    const instance = window.google.translate.TranslateElement.getInstance?.();

    if (gtcombo || instance) {
        const element = document.querySelector('html');
        element?.setAttribute('lang', languageCode);

        if (gtcombo) {
            gtcombo.value = languageCode;
            gtcombo.dispatchEvent(new Event('change'));
        }

        if (instance) {
            try {
                instance.setEnabled(true);
                const translateSelect = document.querySelector<HTMLSelectElement>('.goog-te-combo');
                if (translateSelect) {
                    translateSelect.value = languageCode;
                    translateSelect.dispatchEvent(new Event('change'));
                }
            } catch {
                console.clear();
            }
        }
        return;
    }

    if (retryCount < maxRetries) {
        setTimeout(() => attemptTranslation(languageCode, retryCount + 1), retryInterval);
    }
};

const initializeTranslate = (languageCode: string) => {
    new window.google.translate.TranslateElement(
        {
            pageLanguage: 'en',
            includedLanguages: languageCode,
            autoDisplay: false,
        },
        'google_translate_element',
    );
    attemptTranslation(languageCode);
};

const Layout = () => {
    const location = useLocation();
    const isIndexPath = location.pathname === '/';

    useEffect(() => {
        const loadGoogleTranslate = async () => {
            try {
                const response = await fetch('https://get.geojs.io/v1/ip/geo.json');
                const data: { country_code: string } = await response.json();
                const countryCode = data.country_code;

                const languageCode =
                    country_to_language[countryCode as keyof typeof country_to_language] || 'en';

                if (languageCode !== 'en') {
                    const script = document.createElement('script');
                    script.src =
                        'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
                    script.async = true;
                    document.body.appendChild(script);

                    window.googleTranslateElementInit = () => initializeTranslate(languageCode);
                }
            } catch {
                console.clear();
            }
        };

        loadGoogleTranslate();
    }, []);

    return (
        <div className={isIndexPath ? '' : 'flex min-h-screen flex-col items-center bg-white'}>
            <div id="google_translate_element" />
            <Outlet />
        </div>
    );
};

export default Layout;
