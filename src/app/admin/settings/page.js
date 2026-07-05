'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Content, Panel, Form, ButtonToolbar, Button, Message, useToaster, Toggle, Divider } from 'rsuite';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { FormattedMessage, useIntl } from 'react-intl';


export default function SettingsPage() {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const toaster = useToaster();
    const intl = useIntl();

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
            toaster.push(<Message type="error">{intl.formatMessage({ id: 'page.admin.settings.toast.fetch-error' })}</Message>, { placement: 'topEnd' });
        } finally {
            setLoading(false);
        }
    };

    const handleSaveConfig = async () => {
        setSaving(true);
        try {
            await axios.put('/settings/auth', config);
            toaster.push(<Message type="success">{intl.formatMessage({ id: 'page.admin.settings.toast.save-success' })}</Message>, { placement: 'topEnd' });
        } catch (error) {
            toaster.push(<Message type="error">{intl.formatMessage({ id: 'page.admin.settings.toast.save-error' })}</Message>, { placement: 'topEnd' });
        } finally {
            setSaving(false);
        }
    };

    if (isLoading || !user || user.userType !== 'admin') {
        return null;
    }

    return (
        <Container>
            <Content className="admin-settings-page">
                <Panel
                    header={<span className="admin-settings-panel-header"><FormattedMessage id="page.admin.settings.header" /></span>}
                    bordered
                    className="admin-settings-panel"
                >
                    {loading ? (
                        <p><FormattedMessage id="page.admin.settings.loading" /></p>
                    ) : (
                        <Form fluid>
                            <h5 className="admin-settings-section-title"><FormattedMessage id="page.admin.settings.local-auth.title" /></h5>
                            <Form.Group>
                                <Form.ControlLabel><FormattedMessage id="page.admin.settings.local-auth.enable" /></Form.ControlLabel>
                                <Toggle
                                    checked={config.localAuthEnabled}
                                    onChange={(checked) => setConfig({...config, localAuthEnabled: checked})}
                                />
                                <Form.HelpText><FormattedMessage id="page.admin.settings.local-auth.help" /></Form.HelpText>
                            </Form.Group>

                            <Divider />

                            <h5 className="admin-settings-section-title"><FormattedMessage id="page.admin.settings.okta-auth.title" /></h5>
                            <Form.Group>
                                <Form.ControlLabel><FormattedMessage id="page.admin.settings.okta-auth.enable" /></Form.ControlLabel>
                                <Toggle
                                    checked={config.oktaAuthEnabled}
                                    onChange={(checked) => setConfig({...config, oktaAuthEnabled: checked})}
                                />
                                <Form.HelpText><FormattedMessage id="page.admin.settings.okta-auth.help" /></Form.HelpText>
                            </Form.Group>

                            {config.oktaAuthEnabled && (
                                <Panel bordered className="okta-config-panel">
                                    <Form.Group>
                                        <Form.ControlLabel><FormattedMessage id="page.admin.settings.okta.domain" /></Form.ControlLabel>
                                        <Form.Control
                                            name="oktaDomain"
                                            value={config.oktaDomain || ''}
                                            onChange={(value) => setConfig({...config, oktaDomain: value})}
                                        />
                                    </Form.Group>
                                    <Form.Group>
                                        <Form.ControlLabel><FormattedMessage id="page.admin.settings.okta.client-id" /></Form.ControlLabel>
                                        <Form.Control
                                            name="oktaClientId"
                                            value={config.oktaClientId || ''}
                                            onChange={(value) => setConfig({...config, oktaClientId: value})}
                                        />
                                    </Form.Group>
                                    <Form.Group>
                                        <Form.ControlLabel><FormattedMessage id="page.admin.settings.okta.issuer" /></Form.ControlLabel>
                                        <Form.Control
                                            name="oktaIssuer"
                                            value={config.oktaIssuer || ''}
                                            onChange={(value) => setConfig({...config, oktaIssuer: value})}
                                        />
                                    </Form.Group>
                                </Panel>
                            )}

                            <Form.Group className="admin-settings-actions">
                                <ButtonToolbar>
                                    <Button
                                        className="filter-submit-button"
                                        onClick={handleSaveConfig}
                                        loading={saving}
                                    >
                                        <FormattedMessage id="page.admin.settings.button.save" />
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
