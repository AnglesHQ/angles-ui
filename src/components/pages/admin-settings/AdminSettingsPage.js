'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Container,
    Content,
    Panel,
    Form,
    ButtonToolbar,
    Button,
    Message,
    useToaster,
    Toggle,
    Divider,
    Table,
    Loader,
    Tag,
} from 'rsuite';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { FormattedMessage, useIntl } from 'react-intl';
import ConfirmModal from '../../common/ConfirmModal';
import ProviderModal from './ProviderModal';

const { Column, HeaderCell, Cell } = Table;

// SAML service-provider metadata lives next to the callback URL the API reports. IdP
// admins import it rather than transcribing the entity id and ACS URL by hand.
const metadataUrlFor = (provider) => (
    provider.type === 'saml' && provider.callbackUrl
        ? provider.callbackUrl.replace(/\/callback$/, '/metadata')
        : undefined
);

export default function AdminSettingsPage() {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const toaster = useToaster();
    const intl = useIntl();

    const [localAuthEnabled, setLocalAuthEnabled] = useState(true);
    const [providers, setProviders] = useState([]);
    // Per-provider configuration outcome returned by a save: a provider can be enabled
    // but fail to build its strategy (unreachable issuer, unparseable certificate).
    const [providerStatus, setProviderStatus] = useState({});
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [modalState, setModalState] = useState({ open: false, provider: null });
    const [confirmState, setConfirmState] = useState({ open: false, providerId: null });

    useEffect(() => {
        if (!isLoading && (!user || user.userType !== 'admin')) {
            router.push('/');
        } else if (user && user.userType === 'admin') {
            fetchConfig();
        }
    }, [user, isLoading, router]);

    const applyResponse = (data) => {
        setLocalAuthEnabled(data.localAuthEnabled !== false);
        setProviders(data.providers || []);
        if (data.providerStatus) {
            setProviderStatus(data.providerStatus);
        }
    };

    const fetchConfig = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/settings/auth');
            if (response.data) {
                applyResponse(response.data);
            }
        } catch (error) {
            toaster.push(<Message type="error">{intl.formatMessage({ id: 'page.admin.settings.toast.fetch-error' })}</Message>, { placement: 'topEnd' });
        } finally {
            setLoading(false);
        }
    };

    // The whole settings document is sent on every save: the API treats `providers` as
    // the full desired set, so an omitted provider is a deletion.
    const persist = async (nextLocalAuthEnabled, nextProviders) => {
        setSaving(true);
        try {
            const response = await axios.put('/settings/auth', {
                localAuthEnabled: nextLocalAuthEnabled,
                providers: nextProviders,
            });
            if (response.data) {
                applyResponse(response.data);
            }
            toaster.push(<Message type="success">{intl.formatMessage({ id: 'page.admin.settings.toast.save-success' })}</Message>, { placement: 'topEnd' });
            return true;
        } catch (error) {
            // The API validates each provider individually and returns a specific
            // reason, which is far more useful than a generic failure.
            const detail = error.response?.data?.errors?.[0]?.msg
                || error.response?.data?.error;
            toaster.push(
                <Message type="error">
                    {detail || intl.formatMessage({ id: 'page.admin.settings.toast.save-error' })}
                </Message>,
                { placement: 'topEnd' },
            );
            return false;
        } finally {
            setSaving(false);
        }
    };

    const handleSaveLocalAuth = () => persist(localAuthEnabled, providers);

    const handleSaveProvider = async (provider) => {
        const exists = providers.some((candidate) => candidate.id === provider.id);
        const nextProviders = exists
            ? providers.map((candidate) => (candidate.id === provider.id ? provider : candidate))
            : [...providers, provider];

        if (await persist(localAuthEnabled, nextProviders)) {
            setModalState({ open: false, provider: null });
        }
    };

    const handleDeleteProvider = async () => {
        const { providerId } = confirmState;
        setConfirmState({ open: false, providerId: null });
        await persist(
            localAuthEnabled,
            providers.filter((provider) => provider.id !== providerId),
        );
    };

    // Providers are sent back unchanged apart from the enabled flag, so a secret that is
    // set stays set (the API keeps a stored secret when none is supplied).
    const handleToggleProvider = (providerId, enabled) => persist(
        localAuthEnabled,
        providers.map((provider) => (
            provider.id === providerId ? { ...provider, enabled } : provider
        )),
    );

    const renderStatus = (provider) => {
        if (!provider.enabled) {
            return <Tag className="provider-status-tag"><FormattedMessage id="page.admin.settings.provider.status.disabled" /></Tag>;
        }
        const status = providerStatus[provider.id];
        if (status && status.ready === false) {
            return (
                <Tag className="provider-status-tag status-bg-fail" title={status.error}>
                    <FormattedMessage id="page.admin.settings.provider.status.error" />
                </Tag>
            );
        }
        if (status && status.ready) {
            return <Tag className="provider-status-tag status-bg-pass"><FormattedMessage id="page.admin.settings.provider.status.ready" /></Tag>;
        }
        // No status yet: nothing has been saved this session, so the last known outcome
        // is unavailable without re-running configuration on the API.
        return <Tag className="provider-status-tag"><FormattedMessage id="page.admin.settings.provider.status.enabled" /></Tag>;
    };

    if (isLoading || !user || user.userType !== 'admin') {
        return null;
    }

    return (
        <Container>
            <Content className="page">
                <Panel
                    header={<span className="page-panel-header"><FormattedMessage id="page.admin.settings.header" /></span>}
                    bordered
                    className="page-panel"
                >
                    {loading ? (
                        <div className="app-alert app-alert-info">
                            <Loader content={intl.formatMessage({ id: 'page.admin.settings.loading' })} />
                        </div>
                    ) : (
                        <>
                            <Form fluid>
                                <h5 className="page-section-title"><FormattedMessage id="page.admin.settings.local-auth.title" /></h5>
                                <Form.Group>
                                    <Form.ControlLabel><FormattedMessage id="page.admin.settings.local-auth.enable" /></Form.ControlLabel>
                                    <Toggle
                                        checked={localAuthEnabled}
                                        onChange={setLocalAuthEnabled}
                                    />
                                    <Form.HelpText><FormattedMessage id="page.admin.settings.local-auth.help" /></Form.HelpText>
                                </Form.Group>
                                <Form.Group className="admin-settings-actions">
                                    <ButtonToolbar>
                                        <Button className="btn-primary" onClick={handleSaveLocalAuth} loading={saving}>
                                            <FormattedMessage id="page.admin.settings.button.save" />
                                        </Button>
                                    </ButtonToolbar>
                                </Form.Group>
                            </Form>

                            <Divider />

                            <h5 className="page-section-title"><FormattedMessage id="page.admin.settings.providers.title" /></h5>
                            <p className="page-help-text"><FormattedMessage id="page.admin.settings.providers.help" /></p>

                            <ButtonToolbar className="page-toolbar">
                                <Button
                                    className="btn-primary"
                                    onClick={() => setModalState({ open: true, provider: null })}
                                >
                                    <FormattedMessage id="page.admin.settings.button.add-provider" />
                                </Button>
                            </ButtonToolbar>

                            {providers.length === 0 ? (
                                <div className="app-alert app-alert-info">
                                    <FormattedMessage id="page.admin.settings.providers.empty" />
                                </div>
                            ) : (
                                <Table autoHeight data={providers} hover={false}>
                                    <Column flexGrow={2}>
                                        <HeaderCell><FormattedMessage id="page.admin.settings.providers.table.name" /></HeaderCell>
                                        <Cell dataKey="name" />
                                    </Column>
                                    <Column flexGrow={1}>
                                        <HeaderCell><FormattedMessage id="page.admin.settings.providers.table.id" /></HeaderCell>
                                        <Cell dataKey="id" />
                                    </Column>
                                    <Column width={110}>
                                        <HeaderCell><FormattedMessage id="page.admin.settings.providers.table.type" /></HeaderCell>
                                        <Cell>
                                            {rowData => (
                                                <FormattedMessage id={`page.admin.settings.provider.type.${rowData.type}`} />
                                            )}
                                        </Cell>
                                    </Column>
                                    <Column width={110}>
                                        <HeaderCell><FormattedMessage id="page.admin.settings.providers.table.enabled" /></HeaderCell>
                                        <Cell>
                                            {rowData => (
                                                <Toggle
                                                    size="sm"
                                                    checked={rowData.enabled}
                                                    disabled={saving}
                                                    onChange={(checked) => handleToggleProvider(rowData.id, checked)}
                                                />
                                            )}
                                        </Cell>
                                    </Column>
                                    <Column width={130}>
                                        <HeaderCell><FormattedMessage id="page.admin.settings.providers.table.status" /></HeaderCell>
                                        <Cell>{rowData => renderStatus(rowData)}</Cell>
                                    </Column>
                                    <Column width={160} fixed="right">
                                        <HeaderCell><FormattedMessage id="page.user-settings.table.action" /></HeaderCell>
                                        <Cell>
                                            {rowData => (
                                                <span>
                                                    <Button
                                                        appearance="link"
                                                        className="link-action"
                                                        onClick={() => setModalState({
                                                            open: true,
                                                            provider: {
                                                                ...rowData,
                                                                metadataUrl: metadataUrlFor(rowData),
                                                            },
                                                        })}
                                                    >
                                                        <FormattedMessage id="page.admin.users.table.edit" />
                                                    </Button>
                                                    <span className="link-separator">|</span>
                                                    <Button
                                                        appearance="link"
                                                        className="link-danger"
                                                        onClick={() => setConfirmState({ open: true, providerId: rowData.id })}
                                                    >
                                                        <FormattedMessage id="page.admin.users.table.delete" />
                                                    </Button>
                                                </span>
                                            )}
                                        </Cell>
                                    </Column>
                                </Table>
                            )}
                        </>
                    )}
                </Panel>
            </Content>

            <ProviderModal
                open={modalState.open}
                provider={modalState.provider}
                // An id may not collide with another provider's; the one being edited is
                // excluded so saving it unchanged is not reported as a duplicate.
                existingIds={providers
                    .map((provider) => provider.id)
                    .filter((id) => id !== modalState.provider?.id)}
                onSave={handleSaveProvider}
                onCancel={() => setModalState({ open: false, provider: null })}
            />

            <ConfirmModal
                open={confirmState.open}
                title={<FormattedMessage id="page.admin.settings.confirm.delete.title" />}
                message={<FormattedMessage id="page.admin.settings.confirm.delete.message" />}
                confirmLabel={<FormattedMessage id="page.admin.users.table.delete" />}
                cancelLabel={<FormattedMessage id="page.admin.users.button.cancel" />}
                onConfirm={handleDeleteProvider}
                onCancel={() => setConfirmState({ open: false, providerId: null })}
            />
        </Container>
    );
}
