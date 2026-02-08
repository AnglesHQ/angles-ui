'use client';

import React, { useEffect, useState } from 'react';
import { IntlProvider } from 'react-intl';

import Cookies from 'js-cookie';
import { Provider } from 'react-redux';
import store from '../redux/store';
import { CurrentScreenshotProvider } from '../context/CurrentScreenshotContext';
import { ExecutionStateProvider } from '../context/ExecutionStateContext';

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
        const theme = Cookies.get('theme');
        if (theme) {
            document.documentElement.setAttribute('data-theme', theme);
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
        }
    }, []);

    if (!messages) {
        return null; // or a loading spinner
    }

    return (
        <Provider store={store}>
            <IntlProvider locale={language} messages={messages}>
                <CurrentScreenshotProvider>
                    <ExecutionStateProvider>
                        {children}
                    </ExecutionStateProvider>
                </CurrentScreenshotProvider>
            </IntlProvider>
        </Provider>
    );
}
