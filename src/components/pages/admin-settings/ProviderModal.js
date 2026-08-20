'use client';

import React, { useState, useEffect } from 'react';
import {
    Modal,
    Form,
    Button,
    SelectPicker,
    Toggle,
    Input,
    InputGroup,
    IconButton,
    Divider,
} from 'rsuite';
import TrashIcon from '@rsuite/icons/Trash';
import { FormattedMessage, useIntl } from 'react-intl';

// Provider ids form part of the callback URL registered with the identity provider, so
// the API pins them to the same shape. Validated here too, to fail before the round trip.
const PROVIDER_ID_PATTERN = /^[a-z0-9][a-z0-9-]{0,30}[a-z0-9]$/;

// Schema defaults, mirrored from the API model so a newly added provider shows the same
// values it would be saved with rather than a set of empty boxes.
const CONFIG_DEFAULTS = {
    oidc: {
        issuer: '',
        clientId: '',
        clientSecret: '',
        scopes: 'openid profile email',
        groupsClaim: 'groups',
        usernameClaim: 'email',
    },
    saml: {
        entryPoint: '',
        idpCert: '',
        issuer: '',
        privateKey: '',
        signatureAlgorithm: 'sha256',
        identifierFormat: 'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress',
        groupsAttribute: 'groups',
        usernameAttribute: '',
        wantAuthnResponseSigned: true,
        allowUnsolicited: false,
    },
    ldap: {
        url: '',
        bindDN: '',
        bindCredentials: '',
        searchBase: '',
        searchFilter: '(uid={{username}})',
        groupSearchBase: '',
        groupSearchFilter: '(member={{dn}})',
        groupNameAttribute: 'cn',
        usernameAttribute: 'uid',
        tlsRejectUnauthorized: true,
        startTLS: false,
    },
};

// The write-only secret field for each provider type. The API returns `<field>Set`
// instead of the value, and treats a blank submission as "keep what is stored".
const SECRET_FIELD = {
    oidc: 'clientSecret',
    saml: 'privateKey',
    ldap: 'bindCredentials',
};

export const emptyProvider = () => ({
    id: '',
    name: '',
    type: 'oidc',
    enabled: false,
    defaultRole: '',
    roleMappings: [],
    oidc: { ...CONFIG_DEFAULTS.oidc },
});

// Fills in any field the API omitted (it only returns the block matching the provider's
// type, minus secrets) so every input stays controlled.
const toFormState = (provider) => ({
    ...provider,
    roleMappings: (provider.roleMappings || []).map((mapping) => ({ ...mapping })),
    defaultRole: provider.defaultRole || '',
    [provider.type]: { ...CONFIG_DEFAULTS[provider.type], ...(provider[provider.type] || {}) },
});

export default function ProviderModal({ open, provider, existingIds, onSave, onCancel }) {
    const intl = useIntl();
    const [form, setForm] = useState(emptyProvider());
    const [error, setError] = useState('');

    const isNew = !provider || !provider.id;

    useEffect(() => {
        if (open) {
            setForm(provider ? toFormState(provider) : emptyProvider());
            setError('');
        }
    }, [open, provider]);

    const providerTypes = [
        { label: intl.formatMessage({ id: 'page.admin.settings.provider.type.oidc' }), value: 'oidc' },
        { label: intl.formatMessage({ id: 'page.admin.settings.provider.type.saml' }), value: 'saml' },
        { label: intl.formatMessage({ id: 'page.admin.settings.provider.type.ldap' }), value: 'ldap' },
    ];

    const roles = [
        { label: intl.formatMessage({ id: 'page.admin.users.user-type.admin' }), value: 'admin' },
        { label: intl.formatMessage({ id: 'page.admin.users.user-type.team_lead' }), value: 'team_lead' },
        { label: intl.formatMessage({ id: 'page.admin.users.user-type.user' }), value: 'user' },
    ];

    // Empty means "deny when nothing matches", which is the API default.
    const defaultRoles = [
        { label: intl.formatMessage({ id: 'page.admin.settings.provider.default-role.deny' }), value: '' },
        ...roles,
    ];

    const signatureAlgorithms = [
        { label: 'SHA-256', value: 'sha256' },
        { label: 'SHA-512', value: 'sha512' },
    ];

    const setField = (field, value) => setForm((current) => ({ ...current, [field]: value }));

    const setConfigField = (field, value) => setForm((current) => ({
        ...current,
        [current.type]: { ...current[current.type], [field]: value },
    }));

    // Switching type seeds that type's defaults, keeping whatever was already entered for
    // it so flipping back and forth is not destructive.
    const handleTypeChange = (type) => setForm((current) => ({
        ...current,
        type,
        [type]: { ...CONFIG_DEFAULTS[type], ...(current[type] || {}) },
    }));

    const config = form[form.type] || {};

    const addMapping = () => setForm((current) => ({
        ...current,
        roleMappings: [...current.roleMappings, { value: '', role: 'user' }],
    }));

    const updateMapping = (index, field, value) => setForm((current) => ({
        ...current,
        roleMappings: current.roleMappings.map(
            (mapping, i) => (i === index ? { ...mapping, [field]: value } : mapping),
        ),
    }));

    const removeMapping = (index) => setForm((current) => ({
        ...current,
        roleMappings: current.roleMappings.filter((mapping, i) => i !== index),
    }));

    const handleSave = () => {
        const id = (form.id || '').trim().toLowerCase();
        if (!PROVIDER_ID_PATTERN.test(id)) {
            setError(intl.formatMessage({ id: 'page.admin.settings.provider.error.id' }));
            return;
        }
        if (existingIds.includes(id)) {
            setError(intl.formatMessage({ id: 'page.admin.settings.provider.error.duplicate-id' }));
            return;
        }
        if (!(form.name || '').trim()) {
            setError(intl.formatMessage({ id: 'page.admin.settings.provider.error.name' }));
            return;
        }
        if (form.roleMappings.some((mapping) => !mapping.value.trim())) {
            setError(intl.formatMessage({ id: 'page.admin.settings.provider.error.mapping-value' }));
            return;
        }

        // Only the block for the selected type is sent: the API rejects unknown keys, and
        // a blank secret means "keep the stored one".
        const outgoingConfig = { ...config };
        const secretField = SECRET_FIELD[form.type];
        if (!outgoingConfig[secretField]) {
            delete outgoingConfig[secretField];
        }
        // `<field>Set` is a read-only flag from the API, not a setting.
        delete outgoingConfig[`${secretField}Set`];

        onSave({
            id,
            name: form.name.trim(),
            type: form.type,
            enabled: form.enabled,
            defaultRole: form.defaultRole || '',
            roleMappings: form.roleMappings.map((mapping) => ({
                value: mapping.value.trim(),
                role: mapping.role,
            })),
            [form.type]: outgoingConfig,
        });
    };

    const secretHelp = (isSet) => (
        <Form.HelpText>
            <FormattedMessage id={isSet
                ? 'page.admin.settings.provider.secret.help-set'
                : 'page.admin.settings.provider.secret.help-unset'} />
        </Form.HelpText>
    );

    return (
        <Modal open={open} onClose={onCancel} size="md" className="provider-modal">
            <Modal.Header>
                <Modal.Title>
                    <FormattedMessage id={isNew
                        ? 'page.admin.settings.provider.modal.add'
                        : 'page.admin.settings.provider.modal.edit'} />
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {error && <div className="app-alert app-alert-error">{error}</div>}
                <Form fluid>
                    <Form.Group>
                        <Form.ControlLabel><FormattedMessage id="page.admin.settings.provider.name" /></Form.ControlLabel>
                        <Input value={form.name} onChange={(value) => setField('name', value)} />
                        <Form.HelpText><FormattedMessage id="page.admin.settings.provider.name.help" /></Form.HelpText>
                    </Form.Group>

                    <Form.Group>
                        <Form.ControlLabel><FormattedMessage id="page.admin.settings.provider.id" /></Form.ControlLabel>
                        <Input
                            value={form.id}
                            disabled={!isNew}
                            onChange={(value) => setField('id', value)}
                        />
                        <Form.HelpText>
                            <FormattedMessage id={isNew
                                ? 'page.admin.settings.provider.id.help'
                                : 'page.admin.settings.provider.id.help-locked'} />
                        </Form.HelpText>
                    </Form.Group>

                    <Form.Group>
                        <Form.ControlLabel><FormattedMessage id="page.admin.settings.provider.type" /></Form.ControlLabel>
                        <SelectPicker
                            data={providerTypes}
                            value={form.type}
                            onChange={handleTypeChange}
                            disabled={!isNew}
                            cleanable={false}
                            searchable={false}
                            block
                        />
                        {!isNew && (
                            <Form.HelpText><FormattedMessage id="page.admin.settings.provider.type.help-locked" /></Form.HelpText>
                        )}
                    </Form.Group>

                    <Form.Group>
                        <Form.ControlLabel><FormattedMessage id="page.admin.settings.provider.enabled" /></Form.ControlLabel>
                        <Toggle
                            checked={form.enabled}
                            onChange={(checked) => setField('enabled', checked)}
                        />
                        <Form.HelpText><FormattedMessage id="page.admin.settings.provider.enabled.help" /></Form.HelpText>
                    </Form.Group>

                    {!isNew && provider.callbackUrl && (
                        <Form.Group>
                            <Form.ControlLabel>
                                <FormattedMessage id={form.type === 'saml'
                                    ? 'page.admin.settings.provider.acs-url'
                                    : 'page.admin.settings.provider.callback-url'} />
                            </Form.ControlLabel>
                            <Input readOnly value={provider.callbackUrl} className="provider-readonly-url" />
                            <Form.HelpText><FormattedMessage id="page.admin.settings.provider.callback-url.help" /></Form.HelpText>
                        </Form.Group>
                    )}

                    <Divider />

                    {form.type === 'oidc' && (
                        <>
                            <h6 className="page-section-title"><FormattedMessage id="page.admin.settings.oidc.title" /></h6>
                            <Form.Group>
                                <Form.ControlLabel><FormattedMessage id="page.admin.settings.oidc.issuer" /></Form.ControlLabel>
                                <Input value={config.issuer} onChange={(value) => setConfigField('issuer', value)} />
                                <Form.HelpText><FormattedMessage id="page.admin.settings.oidc.issuer.help" /></Form.HelpText>
                            </Form.Group>
                            <Form.Group>
                                <Form.ControlLabel><FormattedMessage id="page.admin.settings.oidc.client-id" /></Form.ControlLabel>
                                <Input value={config.clientId} onChange={(value) => setConfigField('clientId', value)} />
                            </Form.Group>
                            <Form.Group>
                                <Form.ControlLabel><FormattedMessage id="page.admin.settings.oidc.client-secret" /></Form.ControlLabel>
                                <Input
                                    type="password"
                                    autoComplete="new-password"
                                    placeholder={provider?.clientSecretSet ? '••••••••' : ''}
                                    value={config.clientSecret || ''}
                                    onChange={(value) => setConfigField('clientSecret', value)}
                                />
                                {secretHelp(provider?.clientSecretSet)}
                            </Form.Group>
                            <Form.Group>
                                <Form.ControlLabel><FormattedMessage id="page.admin.settings.oidc.scopes" /></Form.ControlLabel>
                                <Input value={config.scopes} onChange={(value) => setConfigField('scopes', value)} />
                                <Form.HelpText><FormattedMessage id="page.admin.settings.oidc.scopes.help" /></Form.HelpText>
                            </Form.Group>
                            <Form.Group>
                                <Form.ControlLabel><FormattedMessage id="page.admin.settings.oidc.groups-claim" /></Form.ControlLabel>
                                <Input value={config.groupsClaim} onChange={(value) => setConfigField('groupsClaim', value)} />
                                <Form.HelpText><FormattedMessage id="page.admin.settings.oidc.groups-claim.help" /></Form.HelpText>
                            </Form.Group>
                            <Form.Group>
                                <Form.ControlLabel><FormattedMessage id="page.admin.settings.oidc.username-claim" /></Form.ControlLabel>
                                <Input value={config.usernameClaim} onChange={(value) => setConfigField('usernameClaim', value)} />
                                <Form.HelpText><FormattedMessage id="page.admin.settings.oidc.username-claim.help" /></Form.HelpText>
                            </Form.Group>
                        </>
                    )}

                    {form.type === 'saml' && (
                        <>
                            <h6 className="page-section-title"><FormattedMessage id="page.admin.settings.saml.title" /></h6>
                            {!isNew && provider.metadataUrl && (
                                <Form.Group>
                                    <Form.ControlLabel><FormattedMessage id="page.admin.settings.saml.metadata-url" /></Form.ControlLabel>
                                    <Input readOnly value={provider.metadataUrl} className="provider-readonly-url" />
                                    <Form.HelpText><FormattedMessage id="page.admin.settings.saml.metadata-url.help" /></Form.HelpText>
                                </Form.Group>
                            )}
                            <Form.Group>
                                <Form.ControlLabel><FormattedMessage id="page.admin.settings.saml.entry-point" /></Form.ControlLabel>
                                <Input value={config.entryPoint} onChange={(value) => setConfigField('entryPoint', value)} />
                                <Form.HelpText><FormattedMessage id="page.admin.settings.saml.entry-point.help" /></Form.HelpText>
                            </Form.Group>
                            <Form.Group>
                                <Form.ControlLabel><FormattedMessage id="page.admin.settings.saml.idp-cert" /></Form.ControlLabel>
                                <Input
                                    as="textarea"
                                    rows={5}
                                    value={config.idpCert}
                                    onChange={(value) => setConfigField('idpCert', value)}
                                />
                                <Form.HelpText><FormattedMessage id="page.admin.settings.saml.idp-cert.help" /></Form.HelpText>
                            </Form.Group>
                            <Form.Group>
                                <Form.ControlLabel><FormattedMessage id="page.admin.settings.saml.issuer" /></Form.ControlLabel>
                                <Input value={config.issuer} onChange={(value) => setConfigField('issuer', value)} />
                                <Form.HelpText><FormattedMessage id="page.admin.settings.saml.issuer.help" /></Form.HelpText>
                            </Form.Group>
                            <Form.Group>
                                <Form.ControlLabel><FormattedMessage id="page.admin.settings.saml.private-key" /></Form.ControlLabel>
                                <Input
                                    as="textarea"
                                    rows={4}
                                    autoComplete="new-password"
                                    placeholder={provider?.privateKeySet ? '••••••••' : ''}
                                    value={config.privateKey || ''}
                                    onChange={(value) => setConfigField('privateKey', value)}
                                />
                                <Form.HelpText><FormattedMessage id="page.admin.settings.saml.private-key.help" /></Form.HelpText>
                            </Form.Group>
                            <Form.Group>
                                <Form.ControlLabel><FormattedMessage id="page.admin.settings.saml.signature-algorithm" /></Form.ControlLabel>
                                <SelectPicker
                                    data={signatureAlgorithms}
                                    value={config.signatureAlgorithm}
                                    onChange={(value) => setConfigField('signatureAlgorithm', value)}
                                    cleanable={false}
                                    searchable={false}
                                    block
                                />
                            </Form.Group>
                            <Form.Group>
                                <Form.ControlLabel><FormattedMessage id="page.admin.settings.saml.identifier-format" /></Form.ControlLabel>
                                <Input
                                    value={config.identifierFormat}
                                    onChange={(value) => setConfigField('identifierFormat', value)}
                                />
                            </Form.Group>
                            <Form.Group>
                                <Form.ControlLabel><FormattedMessage id="page.admin.settings.saml.username-attribute" /></Form.ControlLabel>
                                <Input
                                    value={config.usernameAttribute}
                                    onChange={(value) => setConfigField('usernameAttribute', value)}
                                />
                                <Form.HelpText><FormattedMessage id="page.admin.settings.saml.username-attribute.help" /></Form.HelpText>
                            </Form.Group>
                            <Form.Group>
                                <Form.ControlLabel><FormattedMessage id="page.admin.settings.saml.groups-attribute" /></Form.ControlLabel>
                                <Input
                                    value={config.groupsAttribute}
                                    onChange={(value) => setConfigField('groupsAttribute', value)}
                                />
                            </Form.Group>
                            <Form.Group>
                                <Form.ControlLabel><FormattedMessage id="page.admin.settings.saml.response-signed" /></Form.ControlLabel>
                                <Toggle
                                    checked={config.wantAuthnResponseSigned !== false}
                                    onChange={(checked) => setConfigField('wantAuthnResponseSigned', checked)}
                                />
                                <Form.HelpText><FormattedMessage id="page.admin.settings.saml.response-signed.help" /></Form.HelpText>
                            </Form.Group>
                            <Form.Group>
                                <Form.ControlLabel><FormattedMessage id="page.admin.settings.saml.allow-unsolicited" /></Form.ControlLabel>
                                <Toggle
                                    checked={config.allowUnsolicited === true}
                                    onChange={(checked) => setConfigField('allowUnsolicited', checked)}
                                />
                                <Form.HelpText><FormattedMessage id="page.admin.settings.saml.allow-unsolicited.help" /></Form.HelpText>
                            </Form.Group>
                        </>
                    )}

                    {form.type === 'ldap' && (
                        <>
                            <h6 className="page-section-title"><FormattedMessage id="page.admin.settings.ldap.title" /></h6>
                            <Form.Group>
                                <Form.ControlLabel><FormattedMessage id="page.admin.settings.ldap.url" /></Form.ControlLabel>
                                <Input value={config.url} onChange={(value) => setConfigField('url', value)} />
                                <Form.HelpText><FormattedMessage id="page.admin.settings.ldap.url.help" /></Form.HelpText>
                            </Form.Group>
                            <Form.Group>
                                <Form.ControlLabel><FormattedMessage id="page.admin.settings.ldap.bind-dn" /></Form.ControlLabel>
                                <Input value={config.bindDN} onChange={(value) => setConfigField('bindDN', value)} />
                                <Form.HelpText><FormattedMessage id="page.admin.settings.ldap.bind-dn.help" /></Form.HelpText>
                            </Form.Group>
                            <Form.Group>
                                <Form.ControlLabel><FormattedMessage id="page.admin.settings.ldap.bind-credentials" /></Form.ControlLabel>
                                <Input
                                    type="password"
                                    autoComplete="new-password"
                                    placeholder={provider?.bindCredentialsSet ? '••••••••' : ''}
                                    value={config.bindCredentials || ''}
                                    onChange={(value) => setConfigField('bindCredentials', value)}
                                />
                                {secretHelp(provider?.bindCredentialsSet)}
                            </Form.Group>
                            <Form.Group>
                                <Form.ControlLabel><FormattedMessage id="page.admin.settings.ldap.search-base" /></Form.ControlLabel>
                                <Input value={config.searchBase} onChange={(value) => setConfigField('searchBase', value)} />
                                <Form.HelpText><FormattedMessage id="page.admin.settings.ldap.search-base.help" /></Form.HelpText>
                            </Form.Group>
                            <Form.Group>
                                <Form.ControlLabel><FormattedMessage id="page.admin.settings.ldap.search-filter" /></Form.ControlLabel>
                                <Input value={config.searchFilter} onChange={(value) => setConfigField('searchFilter', value)} />
                                <Form.HelpText><FormattedMessage id="page.admin.settings.ldap.search-filter.help" /></Form.HelpText>
                            </Form.Group>
                            <Form.Group>
                                <Form.ControlLabel><FormattedMessage id="page.admin.settings.ldap.username-attribute" /></Form.ControlLabel>
                                <Input
                                    value={config.usernameAttribute}
                                    onChange={(value) => setConfigField('usernameAttribute', value)}
                                />
                                <Form.HelpText><FormattedMessage id="page.admin.settings.ldap.username-attribute.help" /></Form.HelpText>
                            </Form.Group>
                            <Form.Group>
                                <Form.ControlLabel><FormattedMessage id="page.admin.settings.ldap.group-search-base" /></Form.ControlLabel>
                                <Input
                                    value={config.groupSearchBase}
                                    onChange={(value) => setConfigField('groupSearchBase', value)}
                                />
                                <Form.HelpText><FormattedMessage id="page.admin.settings.ldap.group-search-base.help" /></Form.HelpText>
                            </Form.Group>
                            <Form.Group>
                                <Form.ControlLabel><FormattedMessage id="page.admin.settings.ldap.group-search-filter" /></Form.ControlLabel>
                                <Input
                                    value={config.groupSearchFilter}
                                    onChange={(value) => setConfigField('groupSearchFilter', value)}
                                />
                            </Form.Group>
                            <Form.Group>
                                <Form.ControlLabel><FormattedMessage id="page.admin.settings.ldap.group-name-attribute" /></Form.ControlLabel>
                                <Input
                                    value={config.groupNameAttribute}
                                    onChange={(value) => setConfigField('groupNameAttribute', value)}
                                />
                                <Form.HelpText><FormattedMessage id="page.admin.settings.ldap.group-name-attribute.help" /></Form.HelpText>
                            </Form.Group>
                            <Form.Group>
                                <Form.ControlLabel><FormattedMessage id="page.admin.settings.ldap.start-tls" /></Form.ControlLabel>
                                <Toggle
                                    checked={config.startTLS === true}
                                    onChange={(checked) => setConfigField('startTLS', checked)}
                                />
                                <Form.HelpText><FormattedMessage id="page.admin.settings.ldap.start-tls.help" /></Form.HelpText>
                            </Form.Group>
                            <Form.Group>
                                <Form.ControlLabel><FormattedMessage id="page.admin.settings.ldap.tls-reject-unauthorized" /></Form.ControlLabel>
                                <Toggle
                                    checked={config.tlsRejectUnauthorized !== false}
                                    onChange={(checked) => setConfigField('tlsRejectUnauthorized', checked)}
                                />
                                <Form.HelpText><FormattedMessage id="page.admin.settings.ldap.tls-reject-unauthorized.help" /></Form.HelpText>
                            </Form.Group>
                        </>
                    )}

                    <Divider />

                    <h6 className="page-section-title"><FormattedMessage id="page.admin.settings.role-mappings.title" /></h6>
                    <p className="page-help-text"><FormattedMessage id="page.admin.settings.role-mappings.help" /></p>

                    {form.roleMappings.length === 0 && (
                        <p className="page-help-text"><FormattedMessage id="page.admin.settings.role-mappings.empty" /></p>
                    )}

                    {form.roleMappings.map((mapping, index) => (
                        // Mappings have no stable identifier of their own and are only
                        // ever reordered by add/remove, so the index is the key.
                        // eslint-disable-next-line react/no-array-index-key
                        <div className="role-mapping-row" key={index}>
                            <InputGroup className="role-mapping-value">
                                <Input
                                    value={mapping.value}
                                    placeholder={intl.formatMessage({ id: 'page.admin.settings.role-mappings.value-placeholder' })}
                                    onChange={(value) => updateMapping(index, 'value', value)}
                                />
                            </InputGroup>
                            <SelectPicker
                                className="role-mapping-role"
                                data={roles}
                                value={mapping.role}
                                onChange={(value) => updateMapping(index, 'role', value)}
                                cleanable={false}
                                searchable={false}
                            />
                            <IconButton
                                icon={<TrashIcon />}
                                appearance="subtle"
                                onClick={() => removeMapping(index)}
                                aria-label={intl.formatMessage({ id: 'page.admin.settings.role-mappings.remove' })}
                            />
                        </div>
                    ))}

                    <Button className="btn-ghost role-mapping-add" onClick={addMapping}>
                        <FormattedMessage id="page.admin.settings.role-mappings.add" />
                    </Button>

                    <Form.Group className="provider-default-role">
                        <Form.ControlLabel><FormattedMessage id="page.admin.settings.provider.default-role" /></Form.ControlLabel>
                        <SelectPicker
                            data={defaultRoles}
                            value={form.defaultRole}
                            onChange={(value) => setField('defaultRole', value || '')}
                            cleanable={false}
                            searchable={false}
                            block
                        />
                        <Form.HelpText><FormattedMessage id="page.admin.settings.provider.default-role.help" /></Form.HelpText>
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button className="btn-primary" onClick={handleSave}>
                    <FormattedMessage id="page.admin.settings.button.save-provider" />
                </Button>
                <Button className="btn-secondary" onClick={onCancel}>
                    <FormattedMessage id="page.admin.users.button.cancel" />
                </Button>
            </Modal.Footer>
        </Modal>
    );
}
