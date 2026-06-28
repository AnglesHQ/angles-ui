'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Content, Panel, Form, ButtonToolbar, Button, Message, useToaster, Toggle, Divider } from 'rsuite';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const toaster = useToaster();

    const [config, setConfig] = useState({
        localAuthEnabled: true,
        oktaAuthEnabled: false,
        oktaDomain: '',
        oktaClientId: '',
        oktaIssuer: ''
    });
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!isLoading && (!user || user.userType !== 'admin')) {
            router.push('/');
        } else if (user && user.userType === 'admin') {
            fetchConfig();
        }
    }, [user, isLoading, router]);

    const fetchConfig = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/settings/auth');
            if (response.data) {
                setConfig(response.data);
            }
        } catch (error) {
            toaster.push(<Message type="error">Failed to fetch settings</Message>, { placement: 'topEnd' });
        } finally {
            setLoading(false);
        }
    };

    const handleSaveConfig = async () => {
        setSaving(true);
        try {
            await axios.put('/settings/auth', config);
            toaster.push(<Message type="success">Settings saved successfully</Message>, { placement: 'topEnd' });
        } catch (error) {
            toaster.push(<Message type="error">Failed to save settings</Message>, { placement: 'topEnd' });
        } finally {
            setSaving(false);
        }
    };

    if (isLoading || !user || user.userType !== 'admin') {
        return null;
    }

    return (
        <Container>
            <Content style={{ padding: '20px' }}>
                <Panel header={<span className="about-page-header">Authentication Settings</span>} bordered className="about-page-panel">
                    {loading ? (
                        <p>Loading settings...</p>
                    ) : (
                        <Form fluid>
                            <h5>Local Authentication</h5>
                            <Form.Group>
                                <Form.ControlLabel>Enable Local Authentication</Form.ControlLabel>
                                <Toggle 
                                    checked={config.localAuthEnabled} 
                                    onChange={(checked) => setConfig({...config, localAuthEnabled: checked})} 
                                />
                                <Form.HelpText>Allow users to log in with a username and password.</Form.HelpText>
                            </Form.Group>

                            <Divider />

                            <h5>OKTA Authentication</h5>
                            <Form.Group>
                                <Form.ControlLabel>Enable OKTA</Form.ControlLabel>
                                <Toggle 
                                    checked={config.oktaAuthEnabled} 
                                    onChange={(checked) => setConfig({...config, oktaAuthEnabled: checked})} 
                                />
                                <Form.HelpText>Allow users to log in using OKTA Single Sign-On.</Form.HelpText>
                            </Form.Group>

                            {config.oktaAuthEnabled && (
                                <Panel bordered style={{ marginTop: '20px', backgroundColor: 'var(--rs-bg-overlay)' }}>
                                    <Form.Group>
                                        <Form.ControlLabel>OKTA Domain</Form.ControlLabel>
                                        <Form.Control 
                                            name="oktaDomain" 
                                            value={config.oktaDomain || ''} 
                                            onChange={(value) => setConfig({...config, oktaDomain: value})} 
                                        />
                                    </Form.Group>
                                    <Form.Group>
                                        <Form.ControlLabel>OKTA Client ID</Form.ControlLabel>
                                        <Form.Control 
                                            name="oktaClientId" 
                                            value={config.oktaClientId || ''} 
                                            onChange={(value) => setConfig({...config, oktaClientId: value})} 
                                        />
                                    </Form.Group>
                                    <Form.Group>
                                        <Form.ControlLabel>OKTA Issuer</Form.ControlLabel>
                                        <Form.Control 
                                            name="oktaIssuer" 
                                            value={config.oktaIssuer || ''} 
                                            onChange={(value) => setConfig({...config, oktaIssuer: value})} 
                                        />
                                    </Form.Group>
                                </Panel>
                            )}

                            <Form.Group style={{ marginTop: '20px' }}>
                                <ButtonToolbar>
                                    <Button appearance="primary" onClick={handleSaveConfig} loading={saving}>
                                        Save Settings
                                    </Button>
                                </ButtonToolbar>
                            </Form.Group>
                        </Form>
                    )}
                </Panel>
            </Content>
        </Container>
    );
}
