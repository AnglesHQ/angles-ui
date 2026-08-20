import React, { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { Panel, Form, ButtonToolbar, Button, Message, SelectPicker } from 'rsuite';
import { FormattedMessage, useIntl } from 'react-intl';

// Providers that authenticate by redirecting the browser to the identity provider,
// as opposed to LDAP which takes the credentials directly.
const REDIRECT_TYPES = ['oidc', 'saml'];

// Sentinel for the built-in local account option in the directory picker. Provider ids
// are validated as lowercase alphanumeric/hyphen by the API, so a colon cannot collide
// with one.
const LOCAL_SOURCE = 'local:';

export default function LoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user, login, loginWithProvider, startProviderLogin, authConfig, isLoading } = useAuth();
    const intl = useIntl();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [source, setSource] = useState(LOCAL_SOURCE);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const localAuthEnabled = authConfig ? authConfig.localAuthEnabled !== false : true;
    const providers = useMemo(() => (authConfig?.providers || []), [authConfig]);

    // A provider that is enabled but failed to configure (bad issuer, unparseable
    // certificate) reports ready: false and would only fail at the IdP, so it is not
    // offered. `ready` is absent on older API versions — treat that as available.
    const available = useMemo(
        () => providers.filter((provider) => provider.ready !== false),
        [providers],
    );
    const ldapProviders = useMemo(
        () => available.filter((provider) => provider.type === 'ldap'),
        [available],
    );
    const redirectProviders = useMemo(
        () => available.filter((provider) => REDIRECT_TYPES.includes(provider.type)),
        [available],
    );

    // The credential form covers local accounts and every LDAP directory. Which of them
    // it submits to is chosen with the picker, which is only worth showing when there is
    // more than one option.
    const credentialSources = useMemo(() => [
        ...(localAuthEnabled ? [{
            label: intl.formatMessage({ id: 'page.login.source.local' }),
            value: LOCAL_SOURCE,
        }] : []),
        ...ldapProviders.map((provider) => ({ label: provider.name, value: provider.id })),
    ], [localAuthEnabled, ldapProviders, intl]);

    useEffect(() => {
        if (user) {
            router.push('/');
        }
    }, [user, router]);

    // The SSO callback bounces failures back here with ?error=true rather than exposing
    // the underlying reason, which is logged by the API instead.
    useEffect(() => {
        if (searchParams.get('error')) {
            setError(intl.formatMessage({ id: 'page.login.error.sso-failed' }));
        }
    }, [searchParams, intl]);

    // Keep the selected source valid once the config arrives: local auth may be off, in
    // which case the first directory is selected instead.
    useEffect(() => {
        if (credentialSources.length > 0
            && !credentialSources.some((option) => option.value === source)) {
            setSource(credentialSources[0].value);
        }
    }, [credentialSources, source]);

    if (isLoading) {
        return null; // Or a loading spinner
    }

    const handleLogin = async () => {
        setLoading(true);
        setError('');
        try {
            if (source === LOCAL_SOURCE) {
                await login(username, password);
            } else {
                const provider = ldapProviders.find((candidate) => candidate.id === source);
                await loginWithProvider(provider, username, password);
            }
            router.push('/');
        } catch (err) {
            setError(err.response?.data?.error
                || err.response?.data?.message
                || intl.formatMessage({ id: 'page.login.error.invalid-credentials' }));
        } finally {
            setLoading(false);
        }
    };

    const showCredentialForm = credentialSources.length > 0;
    const showSourcePicker = credentialSources.length > 1;
    // Nothing to offer at all: local auth is disabled and no provider is usable.
    const noMethodsAvailable = !showCredentialForm && redirectProviders.length === 0;

    return (
        <div className="login-page">
            <div className="login-container">
                <Panel header={
                    <div className="login-header">
                        <img src="/assets/angles-icon.png" alt="Angles" className="brand-logo-icon" />
                        <img src="/assets/angles-text-logo.png" alt="Angles" className="brand-logo-text" />
                    </div>
                } bordered className="login-panel">
                    {error && <Message showIcon type="error" className="login-error">{error}</Message>}

                    {noMethodsAvailable && (
                        <div className="app-alert app-alert-error">
                            <FormattedMessage id="page.login.error.no-methods" />
                        </div>
                    )}

                    {showCredentialForm && (
                        <Form fluid onSubmit={(checkStatus, e) => { e.preventDefault(); handleLogin(); }}>
                            {showSourcePicker && (
                                <Form.Group>
                                    <Form.ControlLabel><FormattedMessage id="page.login.label.sign-in-with" /></Form.ControlLabel>
                                    <SelectPicker
                                        data={credentialSources}
                                        value={source}
                                        onChange={(value) => setSource(value || LOCAL_SOURCE)}
                                        cleanable={false}
                                        searchable={false}
                                        block
                                    />
                                </Form.Group>
                            )}
                            <Form.Group>
                                <Form.ControlLabel><FormattedMessage id="page.login.label.username" /></Form.ControlLabel>
                                <Form.Control
                                    name="username"
                                    type="text"
                                    value={username}
                                    onChange={setUsername}
                                />
                            </Form.Group>
                            <Form.Group>
                                <Form.ControlLabel><FormattedMessage id="page.login.label.password" /></Form.ControlLabel>
                                <Form.Control
                                    name="password"
                                    type="password"
                                    value={password}
                                    onChange={setPassword}
                                />
                            </Form.Group>
                            <Form.Group>
                                <ButtonToolbar>
                                    <Button type="submit" appearance="primary" loading={loading} block>
                                        <FormattedMessage id="page.login.button.login" />
                                    </Button>
                                </ButtonToolbar>
                            </Form.Group>
                        </Form>
                    )}

                    {redirectProviders.length > 0 && (
                        <div className="sso-login-section">
                            {showCredentialForm && (
                                <div className="divider"><span><FormattedMessage id="page.login.divider.or" /></span></div>
                            )}
                            {redirectProviders.map((provider) => (
                                <Button
                                    key={provider.id}
                                    appearance="ghost"
                                    className="sso-login-button"
                                    onClick={() => startProviderLogin(provider)}
                                    block
                                >
                                    <FormattedMessage
                                        id="page.login.button.sso"
                                        values={{ name: provider.name }}
                                    />
                                </Button>
                            ))}
                        </div>
                    )}
                </Panel>
            </div>
        </div>
    );
}
