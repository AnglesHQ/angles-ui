import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Content, Panel, Table, Button, Modal, Form, ButtonToolbar, Message, useToaster, SelectPicker, InputNumber, InputGroup, Input } from 'rsuite';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import moment from 'moment';
import { FormattedMessage, useIntl } from 'react-intl';
import ConfirmModal from '../../common/ConfirmModal';
import PasswordRequirements from '../../common/PasswordRequirements';
import { isPasswordValid } from '../../../utility/PasswordUtilities';
import { getApiErrorMessage } from '../../../utility/ApiUtilities';

const { Column, HeaderCell, Cell } = Table;

export default function UserSettingsPage() {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const intl = useIntl();
    const toaster = useToaster();

    const [tokens, setTokens] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // Modal states
    const [modalOpen, setModalOpen] = useState(false);
    const [formData, setFormData] = useState({ name: '', expiryOption: '30', customDays: 30 });
    const [generatedToken, setGeneratedToken] = useState(null);

    // Confirm Modal states
    const [confirmState, setConfirmState] = useState({ open: false, tokenId: null });

    // Change password modal states
    const [passwordModalOpen, setPasswordModalOpen] = useState(false);
    const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [passwordError, setPasswordError] = useState(null);
    const [passwordSuccess, setPasswordSuccess] = useState(false);

    // SSO users authenticate through the identity provider and have no local password to change.
    const canChangePassword = user && user.authProvider !== 'okta';

    const expiryOptions = [
        { label: intl.formatMessage({ id: 'page.user-settings.expiry.1-day' }), value: '1' },
        { label: intl.formatMessage({ id: 'page.user-settings.expiry.1-week' }), value: '7' },
        { label: intl.formatMessage({ id: 'page.user-settings.expiry.1-month' }), value: '30' },
        { label: intl.formatMessage({ id: 'page.user-settings.expiry.1-year' }), value: '365' },
        { label: intl.formatMessage({ id: 'page.user-settings.expiry.custom' }), value: 'custom' }
    ];

    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/login');
        } else if (user) {
            fetchTokens();
        }
    }, [user, isLoading, router]);

    const fetchTokens = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`/users/${user._id}/tokens`);
            setTokens(response.data);
        } catch (error) {
            toaster.push(<Message type="error">{intl.formatMessage({ id: 'page.user-settings.toast.fetch-tokens-error' })}</Message>, { placement: 'topEnd' });
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = () => {
        setFormData({ name: '', expiryOption: '30', customDays: 30 });
        setGeneratedToken(null);
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setGeneratedToken(null);
    };

    const handleGenerateToken = async () => {
        if (!formData.name || !formData.name.trim()) {
            toaster.push(<Message type="warning">{intl.formatMessage({ id: 'page.user-settings.toast.token-name-required' })}</Message>, { placement: 'topEnd' });
            return;
        }

        let expiresInDays = formData.expiryOption === 'custom' ? formData.customDays : parseInt(formData.expiryOption, 10);
        
        if (!expiresInDays || expiresInDays <= 0) {
            toaster.push(<Message type="warning">{intl.formatMessage({ id: 'page.user-settings.toast.expiry-required' })}</Message>, { placement: 'topEnd' });
            return;
        }

        try {
            const response = await axios.post(`/users/${user._id}/tokens`, {
                name: formData.name,
                expiresInDays: expiresInDays
            });
            
            // Show the generated token
            setGeneratedToken(response.data.token);
            fetchTokens();
        } catch (error) {
            toaster.push(<Message type="error">{error.response?.data?.error || intl.formatMessage({ id: 'page.user-settings.toast.generate-token-error' })}</Message>, { placement: 'topEnd' });
        }
    };

    const handleDeleteToken = (tokenId) => {
        setConfirmState({ open: true, tokenId });
    };

    const handleConfirmDelete = async () => {
        const { tokenId } = confirmState;
        setConfirmState({ open: false, tokenId: null });
        try {
            await axios.delete(`/users/${user._id}/tokens/${tokenId}`);
            toaster.push(<Message type="success">{intl.formatMessage({ id: 'page.user-settings.toast.revoke-success' })}</Message>, { placement: 'topEnd' });
            fetchTokens();
        } catch (error) {
            toaster.push(<Message type="error">{intl.formatMessage({ id: 'page.user-settings.toast.revoke-error' })}</Message>, { placement: 'topEnd' });
        }
    };

    const handleCancelDelete = () => {
        setConfirmState({ open: false, tokenId: null });
    };

    const handleOpenPasswordModal = () => {
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setPasswordError(null);
        setPasswordSuccess(false);
        setPasswordModalOpen(true);
    };

    const handleClosePasswordModal = () => {
        setPasswordModalOpen(false);
        setPasswordError(null);
        setPasswordSuccess(false);
    };

    // Update a single password field and clear any previously shown error as the user edits.
    const updatePasswordField = (field, value) => {
        setPasswordForm((prev) => ({ ...prev, [field]: value }));
        setPasswordError(null);
    };

    const newPasswordValid = isPasswordValid(passwordForm.newPassword);
    const confirmMatches = passwordForm.newPassword === passwordForm.confirmPassword;
    const canSubmitPassword = Boolean(passwordForm.currentPassword)
        && newPasswordValid
        && confirmMatches;

    const handleChangePassword = async () => {
        if (!passwordForm.currentPassword) {
            setPasswordError(intl.formatMessage({ id: 'page.user-settings.password.toast.current-required' }));
            return;
        }
        if (!newPasswordValid) {
            setPasswordError(intl.formatMessage({ id: 'password.policy.invalid' }));
            return;
        }
        if (!confirmMatches) {
            setPasswordError(intl.formatMessage({ id: 'page.user-settings.password.toast.mismatch' }));
            return;
        }
        setPasswordError(null);
        try {
            await axios.put(`/users/${user._id}/password`, {
                currentPassword: passwordForm.currentPassword,
                newPassword: passwordForm.newPassword,
            });
            // Confirm success inline in the modal (persistent, like the token-generated flow)
            // and also raise a toast so it is visible after the modal is dismissed.
            setPasswordSuccess(true);
            toaster.push(<Message type="success">{intl.formatMessage({ id: 'page.user-settings.password.toast.success' })}</Message>, { placement: 'topEnd' });
        } catch (error) {
            // Show the API's reason inline in the modal (persistent, not a transient toast)
            // so it can't be missed, resolving every error shape the API may return.
            setPasswordError(getApiErrorMessage(error, intl.formatMessage({ id: 'page.user-settings.password.toast.error' })));
        }
    };

    const copyToClipboard = () => {
        if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(generatedToken);
            toaster.push(<Message type="success">{intl.formatMessage({ id: 'page.user-settings.toast.copy-success' })}</Message>, { placement: 'topEnd' });
        }
    };

    if (isLoading || !user) {
        return null;
    }

    return (
        <Container>
            <Content className="page">
                {canChangePassword && (
                    <Panel
                        header={<span className="page-panel-header"><FormattedMessage id="page.user-settings.password.title" /></span>}
                        bordered
                        className="page-panel"
                    >
                        <p className="page-help-text">
                            <FormattedMessage id="page.user-settings.password.description" />
                        </p>
                        <ButtonToolbar className="page-toolbar">
                            <Button className="btn-primary" onClick={handleOpenPasswordModal}>
                                <FormattedMessage id="page.user-settings.password.button.change" />
                            </Button>
                        </ButtonToolbar>
                    </Panel>
                )}
                <Panel
                    header={<span className="page-panel-header"><FormattedMessage id="page.user-settings.header" /></span>}
                    bordered
                    className="page-panel"
                >
                    <h5 className="page-section-title"><FormattedMessage id="page.user-settings.api-tokens.title" /></h5>
                    <p className="page-help-text">
                        <FormattedMessage id="page.user-settings.api-tokens.description" />
                    </p>
                    <ButtonToolbar className="page-toolbar">
                        <Button className="btn-primary" onClick={() => handleOpenModal()}>
                            <FormattedMessage id="page.user-settings.button.generate-new-token" />
                        </Button>
                    </ButtonToolbar>

                    <Table
                        height={400}
                        data={tokens}
                        loading={loading}
                        hover={false}
                    >
                        <Column width={250} fixed>
                            <HeaderCell><FormattedMessage id="page.user-settings.table.name" /></HeaderCell>
                            <Cell dataKey="name" />
                        </Column>

                        <Column width={200}>
                            <HeaderCell><FormattedMessage id="page.user-settings.table.created" /></HeaderCell>
                            <Cell>
                                {rowData => rowData.createdAt ? moment(rowData.createdAt).format('YYYY-MM-DD HH:mm:ss') : '-'}
                            </Cell>
                        </Column>

                        <Column width={200}>
                            <HeaderCell><FormattedMessage id="page.user-settings.table.expires" /></HeaderCell>
                            <Cell>
                                {rowData => rowData.expiresAt ? moment(rowData.expiresAt).format('YYYY-MM-DD HH:mm:ss') : intl.formatMessage({ id: 'page.user-settings.table.expires-never' })}
                            </Cell>
                        </Column>

                        <Column width={150} fixed="right">
                            <HeaderCell><FormattedMessage id="page.user-settings.table.action" /></HeaderCell>
                            <Cell>
                                {rowData => (
                                    <Button
                                        appearance="link"
                                        className="link-danger"
                                        onClick={() => handleDeleteToken(rowData._id)}
                                    >
                                        <FormattedMessage id="page.user-settings.table.revoke" />
                                    </Button>
                                )}
                            </Cell>
                        </Column>
                    </Table>
                </Panel>
            </Content>

            <Modal open={modalOpen} onClose={handleCloseModal} size="md">
                <Modal.Header>
                    <Modal.Title>{generatedToken ? <FormattedMessage id="page.user-settings.modal.token-generated" /> : <FormattedMessage id="page.user-settings.modal.generate-token" />}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {generatedToken ? (
                        <div className="token-generated-container">
                            <Message type="success" showIcon className="token-success-message">
                                <strong><FormattedMessage id="page.user-settings.modal.success-label" /></strong> <FormattedMessage id="page.user-settings.modal.success" />
                            </Message>
                            <p className="form-warning-text">
                                <FormattedMessage id="page.user-settings.modal.warning" />
                            </p>
                            <InputGroup>
                                <InputGroup.Addon><FormattedMessage id="page.user-settings.modal.token-label" /></InputGroup.Addon>
                                <Input readOnly value={generatedToken} className="token-input" />
                                <InputGroup.Button onClick={copyToClipboard}>
                                    <FormattedMessage id="page.user-settings.modal.button.copy" />
                                </InputGroup.Button>
                            </InputGroup>
                        </div>
                    ) : (
                        <Form fluid>
                            <Form.Group>
                                <Form.ControlLabel><FormattedMessage id="page.user-settings.modal.token-name" /></Form.ControlLabel>
                                <Form.Control
                                    name="name"
                                    placeholder={intl.formatMessage({ id: 'page.user-settings.modal.token-placeholder' })}
                                    value={formData.name}
                                    onChange={(value) => setFormData({ ...formData, name: value })}
                                />
                            </Form.Group>
                            <Form.Group>
                                <Form.ControlLabel><FormattedMessage id="page.user-settings.modal.expiration" /></Form.ControlLabel>
                                <SelectPicker
                                    data={expiryOptions}
                                    value={formData.expiryOption}
                                    onChange={(value) => setFormData({ ...formData, expiryOption: value })}
                                    block
                                    cleanable={false}
                                />
                            </Form.Group>
                            {formData.expiryOption === 'custom' && (
                                <Form.Group>
                                    <Form.ControlLabel><FormattedMessage id="page.user-settings.modal.custom-expiration" /></Form.ControlLabel>
                                    <InputNumber
                                        min={1}
                                        value={formData.customDays}
                                        onChange={(value) => setFormData({ ...formData, customDays: parseInt(value, 10) || 1 })}
                                    />
                                </Form.Group>
                            )}
                        </Form>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    {generatedToken ? (
                        <Button className="btn-primary" onClick={handleCloseModal}>
                            <FormattedMessage id="page.user-settings.button.done" />
                        </Button>
                    ) : (
                        <>
                            <Button className="btn-primary" onClick={handleGenerateToken}>
                                <FormattedMessage id="page.user-settings.button.generate" />
                            </Button>
                            <Button className="btn-secondary" onClick={handleCloseModal}>
                                <FormattedMessage id="page.user-settings.button.cancel" />
                            </Button>
                        </>
                    )}
                </Modal.Footer>
            </Modal>

            <Modal open={passwordModalOpen} onClose={handleClosePasswordModal} size="sm">
                <Modal.Header>
                    <Modal.Title><FormattedMessage id="page.user-settings.password.modal.title" /></Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {passwordSuccess ? (
                        <Message type="success" showIcon className="token-success-message">
                            <strong><FormattedMessage id="page.user-settings.modal.success-label" /></strong> <FormattedMessage id="page.user-settings.password.modal.success" />
                        </Message>
                    ) : (
                    <>
                    {passwordError && (
                        <Message type="error" showIcon closable onClose={() => setPasswordError(null)} style={{ marginBottom: '15px' }}>
                            {passwordError}
                        </Message>
                    )}
                    <Form fluid>
                        <Form.Group>
                            <Form.ControlLabel><FormattedMessage id="page.user-settings.password.modal.current" /></Form.ControlLabel>
                            <Form.Control
                                name="currentPassword"
                                type="password"
                                autoComplete="current-password"
                                value={passwordForm.currentPassword}
                                onChange={(value) => updatePasswordField('currentPassword', value)}
                            />
                        </Form.Group>
                        <Form.Group>
                            <Form.ControlLabel><FormattedMessage id="page.user-settings.password.modal.new" /></Form.ControlLabel>
                            <Form.Control
                                name="newPassword"
                                type="password"
                                autoComplete="new-password"
                                value={passwordForm.newPassword}
                                onChange={(value) => updatePasswordField('newPassword', value)}
                            />
                            {passwordForm.newPassword.length > 0 && (
                                <PasswordRequirements password={passwordForm.newPassword} />
                            )}
                        </Form.Group>
                        <Form.Group>
                            <Form.ControlLabel><FormattedMessage id="page.user-settings.password.modal.confirm" /></Form.ControlLabel>
                            <Form.Control
                                name="confirmPassword"
                                type="password"
                                autoComplete="new-password"
                                value={passwordForm.confirmPassword}
                                onChange={(value) => updatePasswordField('confirmPassword', value)}
                            />
                            {passwordForm.confirmPassword.length > 0 && !confirmMatches && (
                                <Form.HelpText className="form-error-text">
                                    <FormattedMessage id="page.user-settings.password.modal.mismatch" />
                                </Form.HelpText>
                            )}
                        </Form.Group>
                    </Form>
                    </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    {passwordSuccess ? (
                        <Button className="btn-primary" onClick={handleClosePasswordModal}>
                            <FormattedMessage id="page.user-settings.button.done" />
                        </Button>
                    ) : (
                        <>
                            <Button className="btn-primary" onClick={handleChangePassword} disabled={!canSubmitPassword}>
                                <FormattedMessage id="page.user-settings.password.modal.submit" />
                            </Button>
                            <Button className="btn-secondary" onClick={handleClosePasswordModal}>
                                <FormattedMessage id="page.user-settings.button.cancel" />
                            </Button>
                        </>
                    )}
                </Modal.Footer>
            </Modal>

            <ConfirmModal
                open={confirmState.open}
                title={<FormattedMessage id="page.user-settings.confirm.revoke.title" />}
                message={<FormattedMessage id="page.user-settings.confirm.revoke.message" />}
                confirmLabel={<FormattedMessage id="page.user-settings.table.revoke" />}
                cancelLabel={<FormattedMessage id="page.user-settings.button.cancel" />}
                onConfirm={handleConfirmDelete}
                onCancel={handleCancelDelete}
            />
        </Container>
    );
}
