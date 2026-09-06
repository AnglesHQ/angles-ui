'use client';

import React, { useEffect, useState } from 'react';
import { IntlProvider } from 'react-intl';

import Cookies from 'js-cookie';
import { Provider } from 'react-redux';
import store from '../redux/store';
import { applyTheme } from '../utility/Themes';
import { CurrentScreenshotProvider } from '../context/CurrentScreenshotContext';
import { ExecutionStateProvider } from '../context/ExecutionStateContext';
import { AuthProvider } from '../context/AuthContext';

// Helper to load messages
// In a real app, you might want to load this on the server or better handle the async nature
const loadMessages = async (lang) => {
    try {
        const fileContent = await import(`../translations/${lang}.json`);
        return fileContent.default || fileContent;
    } catch (error) {
        const fileContent = await import('../translations/en.json');
        return fileContent.default || fileContent;
    }
};

export default function Providers({ children }) {
    const [messages, setMessages] = useState(null);
    const [language, setLanguage] = useState('en');

    useEffect(() => {
        let lang = navigator.language.split(/[-_]/)[0];
        const cookieLanguage = Cookies.get('language');
        if (cookieLanguage) {
            lang = cookieLanguage;
        }
        setLanguage(lang);

        loadMessages(lang).then(setMessages);
    }, []);

    useEffect(() => {
        // Only pin an explicit theme when the user has chosen one. With no
        // cookie we leave `data-theme` unset so the CSS follows the OS
        // preference (prefers-color-scheme) — see tokens/_color.less.
        //
        // `applyTheme` validates against the registry: an unrecognised cookie
        // (a theme that was renamed or removed, or a hand-edited value) leaves
        // the attribute off rather than writing an id that matches no selector,
        // which would render the page with no theme's primitives at all.
        applyTheme(Cookies.get('theme'));
    }, []);

    if (!messages) {
        return null; // or a loading spinner
    }

    return (
        <Provider store={store}>
            <IntlProvider locale={language} messages={messages}>
                <AuthProvider>
                    <CurrentScreenshotProvider>
                        <ExecutionStateProvider>
                            {children}
                        </ExecutionStateProvider>
                    </CurrentScreenshotProvider>
                </AuthProvider>
            </IntlProvider>
        </Provider>
    );
}
