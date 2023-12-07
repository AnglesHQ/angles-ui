import React from 'react';
import { IntlProvider } from 'react-intl';
import Cookies from 'js-cookie';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import App from './containers/App';
import * as serviceWorker from './serviceWorker';
import store from './redux/store';

const domNode = document.getElementById('root');
const root = createRoot(domNode);
let language = navigator.language.split(/[-_]/)[0];
const cookieLanguage = Cookies.get('language');
if (cookieLanguage) {
  language = cookieLanguage;
}
const messages = await (async () => {
  const msgs = {};
  await import(`./translations/${language}.json`)
    .catch(() => {
      language = 'en';
      return import('./translations/en.json');
    })
    .then((fileContent) => {
      msgs[language] = { ...fileContent };
    });
  return msgs;
})();

Cookies.set('language', language);

const theme = Cookies.get('theme');
if (theme) {
  document.documentElement.setAttribute('data-theme', theme);
}

root.render(
  <Provider store={store}>
    <BrowserRouter>
      <IntlProvider
        locale={navigator.language}
        messages={messages[language]}
      >
        <App />
      </IntlProvider>
    </BrowserRouter>
  </Provider>,
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
