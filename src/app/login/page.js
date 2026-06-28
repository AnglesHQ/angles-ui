'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { Container, Content, Panel, Form, ButtonToolbar, Button, Message } from 'rsuite';
import { FormattedMessage, useIntl } from 'react-intl';

export default function LoginPage() {
    const router = useRouter();
    const { user, login, authConfig, isLoading } = useAuth();
    const intl = useIntl();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            router.push('/');
        }
    }, [user, router]);

    if (isLoading) {
        return null; // Or a loading spinner
    }

    const handleLogin = async () => {
        setLoading(true);
        setError('');
        try {
            await login(username, password);
            router.push('/');
        } catch (err) {
            setError(err.response?.data?.message || intl.formatMessage({ id: 'page.login.error.invalid-credentials' }));
        } finally {
            setLoading(false);
        }
    };

    const handleOktaLogin = () => {
        // Here we would typically redirect to the backend endpoint that initiates OKTA flow
        window.location.href = `${process.env.NEXT_PUBLIC_ANGLES_API_URL || 'http://localhost:3000/rest/api/v1.0'}/auth/okta`;
    };

    return (
        <div className="login-page">
            <div className="login-container">
                <Panel header={
                    <div className="login-header">
                        <img src="/assets/angles-icon.png" alt="Angles" className="login-angles-icon" />
                        <img src="/assets/angles-text-logo.png" alt="Angles" className="login-angles-text-icon" />
                    </div>
                } bordered className="login-panel">
                    {error && <Message showIcon type="error" className="login-error">{error}</Message>}
                    
                    {(authConfig?.localAuthEnabled || !authConfig) && (
                        <Form fluid onSubmit={(checkStatus, e) => { e.preventDefault(); handleLogin(); }}>
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

                    {authConfig?.oktaAuthEnabled && (
                        <div className="okta-login-section">
                            {(authConfig?.localAuthEnabled || !authConfig) && <div className="divider"><span><FormattedMessage id="page.login.divider.or" /></span></div>}
                            <Button appearance="ghost" onClick={handleOktaLogin} block>
                                <FormattedMessage id="page.login.button.okta" />
                            </Button>
                        </div>
                    )}
                </Panel>
            </div>
        </div>
    );
}
