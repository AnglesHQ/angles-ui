import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Content, Panel, Form, ButtonToolbar, Button, Message, useToaster, Toggle, Divider } from 'rsuite';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { FormattedMessage, useIntl } from 'react-intl';


export default function AdminSettingsPage() {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const toaster = useToaster();
    const intl = useIntl();

    const [config, setConfig] = useState({
        localAuthEnabled: true,
        oktaAuthEnabled: false,
        oktaDomain: '',
        oktaClientId: '',
        oktaClientSecret: '',
        oktaClientSecretSet: false,
        oktaIssuer: '',
        oktaAdminGroup: '',
        oktaTeamLeadGroup: '',
        oktaUserGroup: ''
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
                // The client secret is write-only: the API never returns its value, only
                // the oktaClientSecretSet flag. Keep the input blank so an empty save
                // preserves the stored secret.
                setConfig({ ...response.data, oktaClientSecret: '' });
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
            const response = await axios.put('/settings/auth', config);
            // Reflect the saved state and clear the write-only secret input.
            if (response.data) {
                setConfig({ ...response.data, oktaClientSecret: '' });
            }
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
                                        <Form.ControlLabel><FormattedMessage id="page.admin.settings.okta.client-secret" /></Form.ControlLabel>
                                        <Form.Control
                                            name="oktaClientSecret"
                                            type="password"
                                            autoComplete="new-password"
                                            placeholder={config.oktaClientSecretSet ? '••••••••' : ''}
                                            value={config.oktaClientSecret || ''}
                                            onChange={(value) => setConfig({...config, oktaClientSecret: value})}
                                        />
                                        <Form.HelpText>
                                            <FormattedMessage id={config.oktaClientSecretSet
                                                ? 'page.admin.settings.okta.client-secret.help-set'
                                                : 'page.admin.settings.okta.client-secret.help-unset'} />
                                        </Form.HelpText>
                                    </Form.Group>
                                    <Form.Group>
                                        <Form.ControlLabel><FormattedMessage id="page.admin.settings.okta.issuer" /></Form.ControlLabel>
                                        <Form.Control
                                            name="oktaIssuer"
                                            value={config.oktaIssuer || ''}
                                            onChange={(value) => setConfig({...config, oktaIssuer: value})}
                                        />
                                    </Form.Group>

                                    <Divider />

                                    <h6 className="admin-settings-section-title"><FormattedMessage id="page.admin.settings.okta.groups-title" /></h6>
                                    <p className="okta-groups-help"><FormattedMessage id="page.admin.settings.okta.groups-help" /></p>
                                    <Form.Group>
                                        <Form.ControlLabel><FormattedMessage id="page.admin.settings.okta.admin-group" /></Form.ControlLabel>
                                        <Form.Control
                                            name="oktaAdminGroup"
                                            value={config.oktaAdminGroup || ''}
                                            onChange={(value) => setConfig({...config, oktaAdminGroup: value})}
                                        />
                                        <Form.HelpText><FormattedMessage id="page.admin.settings.okta.admin-group.help" /></Form.HelpText>
                                    </Form.Group>
                                    <Form.Group>
                                        <Form.ControlLabel><FormattedMessage id="page.admin.settings.okta.team-lead-group" /></Form.ControlLabel>
                                        <Form.Control
                                            name="oktaTeamLeadGroup"
                                            value={config.oktaTeamLeadGroup || ''}
                                            onChange={(value) => setConfig({...config, oktaTeamLeadGroup: value})}
                                        />
                                        <Form.HelpText><FormattedMessage id="page.admin.settings.okta.team-lead-group.help" /></Form.HelpText>
                                    </Form.Group>
                                    <Form.Group>
                                        <Form.ControlLabel><FormattedMessage id="page.admin.settings.okta.user-group" /></Form.ControlLabel>
                                        <Form.Control
                                            name="oktaUserGroup"
                                            value={config.oktaUserGroup || ''}
                                            onChange={(value) => setConfig({...config, oktaUserGroup: value})}
                                        />
                                        <Form.HelpText><FormattedMessage id="page.admin.settings.okta.user-group.help" /></Form.HelpText>
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
