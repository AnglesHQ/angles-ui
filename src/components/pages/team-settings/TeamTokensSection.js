import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import moment from 'moment';
import {
    Button, ButtonToolbar, Divider, Form, Input, InputGroup, InputNumber, Message, Modal, SelectPicker, Table, useToaster,
} from 'rsuite';
import { FormattedMessage, useIntl } from 'react-intl';
import ConfirmModal from '../../common/ConfirmModal';
import { getApiErrorMessage } from '../../../utility/ApiUtilities';

const { Column, HeaderCell, Cell } = Table;

// The API's limit for a team token's lifetime.
const MAX_EXPIRY_DAYS = 365;
const DATE_FORMAT = 'YYYY-MM-DD HH:mm';

const NEW_TOKEN_FORM = { name: '', expiryOption: '365', customDays: 90 };

/*
 * Team tokens: API tokens that belong to the team rather than to a person, for the
 * team's automation pipelines. A team token reports results to this team and reads its
 * data, nothing else, and keeps working whoever joins or leaves. Shown to the team's leads
 * and admins, the only people the API lets manage them.
 *
 * Creating one mirrors a personal token (User Settings): the token is shown once, in the
 * modal, and never again.
 */
function TeamTokensSection(props) {
    const { teamId, teamName } = props;
    const intl = useIntl();
    const toaster = useToaster();

    const [tokens, setTokens] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [formData, setFormData] = useState(NEW_TOKEN_FORM);
    const [creating, setCreating] = useState(false);
    const [createError, setCreateError] = useState('');
    const [createdToken, setCreatedToken] = useState(null);
    const [revokeConfirm, setRevokeConfirm] = useState({ open: false, token: null });
    // The team whose tokens are on screen, so a slow response for a team that has since
    // been switched away from cannot overwrite the list for the current one.
    const tokensTeamRef = useRef(undefined);

    const expiryOptions = [
        { label: intl.formatMessage({ id: 'page.user-settings.expiry.1-week' }), value: '7' },
        { label: intl.formatMessage({ id: 'page.user-settings.expiry.1-month' }), value: '30' },
        { label: intl.formatMessage({ id: 'page.user-settings.expiry.1-year' }), value: '365' },
        { label: intl.formatMessage({ id: 'page.user-settings.expiry.custom' }), value: 'custom' },
    ];

    const fetchTokens = async (forTeamId) => {
        tokensTeamRef.current = forTeamId;
        setLoading(true);
        try {
            const response = await axios.get(`/team/${forTeamId}/tokens`);
            if (tokensTeamRef.current === forTeamId) {
                setTokens(response.data);
            }
        } catch (error) {
            if (tokensTeamRef.current === forTeamId) {
                setTokens([]);
                toaster.push(<Message type="error">{getApiErrorMessage(error, intl.formatMessage({ id: 'page.team-settings.tokens.toast.fetch-error' }))}</Message>, { placement: 'topEnd' });
            }
        } finally {
            if (tokensTeamRef.current === forTeamId) {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        if (teamId) {
            fetchTokens(teamId);
        }
    }, [teamId]);

    const expiresInDays = formData.expiryOption === 'custom'
        ? formData.customDays
        : parseInt(formData.expiryOption, 10);
    const canCreate = formData.name.trim().length > 0
        && expiresInDays >= 1 && expiresInDays <= MAX_EXPIRY_DAYS;

    const handleOpenModal = () => {
        setFormData(NEW_TOKEN_FORM);
        setCreateError('');
        setCreatedToken(null);
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        if (creating) return;
        setModalOpen(false);
        setCreatedToken(null);
    };

    const handleCreate = async () => {
        if (!canCreate) return;
        setCreating(true);
        setCreateError('');
        try {
            const response = await axios.post(`/team/${teamId}/tokens`, {
                name: formData.name.trim(),
                expiresInDays,
            });
            setCreatedToken(response.data.token);
            fetchTokens(teamId);
        } catch (error) {
            setCreateError(getApiErrorMessage(error, intl.formatMessage({ id: 'page.team-settings.tokens.toast.create-error' })));
        } finally {
            setCreating(false);
        }
    };

    const copyToClipboard = () => {
        if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(createdToken);
            toaster.push(<Message type="success">{intl.formatMessage({ id: 'page.user-settings.toast.copy-success' })}</Message>, { placement: 'topEnd' });
        }
    };

    const handleConfirmRevoke = async () => {
        const { token } = revokeConfirm;
        setRevokeConfirm({ open: false, token: null });
        try {
            await axios.delete(`/team/${teamId}/tokens/${token._id}`);
            toaster.push(<Message type="success">{intl.formatMessage({ id: 'page.team-settings.tokens.toast.revoke-success' }, { name: token.name })}</Message>, { placement: 'topEnd' });
        } catch (error) {
            toaster.push(<Message type="error">{getApiErrorMessage(error, intl.formatMessage({ id: 'page.team-settings.tokens.toast.revoke-error' }))}</Message>, { placement: 'topEnd' });
        }
        fetchTokens(teamId);
    };

    const isExpired = (token) => new Date(token.expiresAt) <= new Date();

    return (
        <div className="page-section team-settings-tokens">
            <Divider />
            <h5 className="page-section-title"><FormattedMessage id="page.team-settings.section.tokens" /></h5>
            <p className="page-help-text"><FormattedMessage id="page.team-settings.tokens.help" /></p>
            <ButtonToolbar className="page-toolbar">
                <Button className="btn-primary" onClick={handleOpenModal} disabled={!teamId}>
                    <FormattedMessage id="page.team-settings.tokens.button.new" />
                </Button>
            </ButtonToolbar>
            {!loading && tokens.length === 0 ? (
                <p className="page-help-text"><FormattedMessage id="page.team-settings.tokens.empty" /></p>
            ) : (
                <Table data={tokens} loading={loading} autoHeight rowKey="_id" hover={false}>
                    <Column flexGrow={2} minWidth={160}>
                        <HeaderCell><FormattedMessage id="page.user-settings.table.name" /></HeaderCell>
                        <Cell dataKey="name" />
                    </Column>
                    <Column flexGrow={1} minWidth={140}>
                        <HeaderCell><FormattedMessage id="page.team-settings.tokens.table.created-by" /></HeaderCell>
                        <Cell>{(rowData) => (rowData.createdBy && rowData.createdBy.username) || '-'}</Cell>
                    </Column>
                    <Column width={150}>
                        <HeaderCell><FormattedMessage id="page.team-settings.tokens.table.last-used" /></HeaderCell>
                        <Cell>
                            {(rowData) => (rowData.lastUsedAt
                                ? moment(rowData.lastUsedAt).format(DATE_FORMAT)
                                : intl.formatMessage({ id: 'page.team-settings.tokens.never-used' }))}
                        </Cell>
                    </Column>
                    <Column width={150}>
                        <HeaderCell><FormattedMessage id="page.user-settings.table.expires" /></HeaderCell>
                        <Cell>
                            {(rowData) => (isExpired(rowData) ? (
                                <span className="status-fail"><FormattedMessage id="page.team-settings.tokens.expired" /></span>
                            ) : moment(rowData.expiresAt).format(DATE_FORMAT))}
                        </Cell>
                    </Column>
                    <Column width={110}>
                        <HeaderCell><FormattedMessage id="page.user-settings.table.action" /></HeaderCell>
                        <Cell>
                            {(rowData) => (
                                <button
                                    type="button"
                                    className="link-danger"
                                    onClick={() => setRevokeConfirm({ open: true, token: rowData })}
                                >
                                    <FormattedMessage id="page.user-settings.table.revoke" />
                                </button>
                            )}
                        </Cell>
                    </Column>
                </Table>
            )}

            <Modal open={modalOpen} onClose={handleCloseModal} size="md">
                <Modal.Header>
                    <Modal.Title>
                        {createdToken
                            ? <FormattedMessage id="page.user-settings.modal.token-generated" />
                            : <FormattedMessage id="page.team-settings.tokens.modal.title" values={{ team: teamName }} />}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {createdToken ? (
                        <div className="token-generated-container">
                            <Message type="success" showIcon className="token-success-message">
                                <strong><FormattedMessage id="page.user-settings.modal.success-label" /></strong> <FormattedMessage id="page.user-settings.modal.success" />
                            </Message>
                            <p className="form-warning-text">
                                <FormattedMessage id="page.user-settings.modal.warning" />
                            </p>
                            <InputGroup>
                                <InputGroup.Addon><FormattedMessage id="page.user-settings.modal.token-label" /></InputGroup.Addon>
                                <Input readOnly value={createdToken} className="token-input" />
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
                                    name="teamTokenName"
                                    placeholder={intl.formatMessage({ id: 'page.team-settings.tokens.modal.name-placeholder' })}
                                    value={formData.name}
                                    onChange={(value) => setFormData({ ...formData, name: value })}
                                    disabled={creating}
                                />
                            </Form.Group>
                            <Form.Group>
                                <Form.ControlLabel><FormattedMessage id="page.user-settings.modal.expiration" /></Form.ControlLabel>
                                <SelectPicker
                                    data={expiryOptions}
                                    value={formData.expiryOption}
                                    onChange={(value) => setFormData({ ...formData, expiryOption: value })}
                                    searchable={false}
                                    cleanable={false}
                                    disabled={creating}
                                    block
                                />
                            </Form.Group>
                            {formData.expiryOption === 'custom' && (
                                <Form.Group>
                                    <Form.ControlLabel><FormattedMessage id="page.user-settings.modal.custom-expiration" /></Form.ControlLabel>
                                    <InputNumber
                                        min={1}
                                        max={MAX_EXPIRY_DAYS}
                                        value={formData.customDays}
                                        onChange={(value) => setFormData({ ...formData, customDays: parseInt(value, 10) || 0 })}
                                        disabled={creating}
                                    />
                                    <Form.HelpText>
                                        <FormattedMessage id="page.team-settings.tokens.modal.max-expiry" values={{ days: MAX_EXPIRY_DAYS }} />
                                    </Form.HelpText>
                                </Form.Group>
                            )}
                        </Form>
                    )}
                    {createError && !createdToken && (
                        <div className="app-alert app-alert-error">{createError}</div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    {createdToken ? (
                        <Button className="btn-primary" onClick={handleCloseModal}>
                            <FormattedMessage id="page.user-settings.button.done" />
                        </Button>
                    ) : (
                        <>
                            <Button className="btn-primary" onClick={handleCreate} loading={creating} disabled={!canCreate}>
                                <FormattedMessage id="page.user-settings.button.generate" />
                            </Button>
                            <Button className="btn-secondary" onClick={handleCloseModal} disabled={creating}>
                                <FormattedMessage id="page.team-settings.button.cancel" />
                            </Button>
                        </>
                    )}
                </Modal.Footer>
            </Modal>

            <ConfirmModal
                open={revokeConfirm.open}
                title={<FormattedMessage id="page.team-settings.tokens.confirm.title" />}
                message={revokeConfirm.token ? (
                    <FormattedMessage
                        id="page.team-settings.tokens.confirm.message"
                        values={{ name: revokeConfirm.token.name, team: teamName }}
                    />
                ) : null}
                confirmLabel={<FormattedMessage id="page.user-settings.table.revoke" />}
                cancelLabel={<FormattedMessage id="page.team-settings.button.cancel" />}
                onConfirm={handleConfirmRevoke}
                onCancel={() => setRevokeConfirm({ open: false, token: null })}
            />
        </div>
    );
}

export default TeamTokensSection;
