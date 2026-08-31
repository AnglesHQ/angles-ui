import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { connect } from 'react-redux';
import {
    Table, Button, IconButton, Whisper, Tooltip, Loader, Message, useToaster, Modal, Form,
    Input, SelectPicker, TagInput, Toggle, InputNumber, Tag, Panel,
} from 'rsuite';
import TableColumnIcon from '@rsuite/icons/TableColumn';
import { FormattedMessage, useIntl } from 'react-intl';
import { CustomFieldRequests, CustomFieldTypes, CustomFieldScopes } from 'angles-javascript-client';
import { getApiErrorMessage } from '../../../utility/ApiUtilities';
import ConfirmModal from '../../common/ConfirmModal';

const { Column, HeaderCell, Cell } = Table;

// Only these two need an options list; the rest take free input.
const OPTION_BACKED_TYPES = [CustomFieldTypes.SELECT, CustomFieldTypes.MULTISELECT];

// Mirrors the API's key validation - lowercase letters, numbers and underscores,
// must start with a lowercase letter, max 40 characters.
const KEY_PATTERN = /^[a-z][a-z0-9_]{0,39}$/;

const emptyDefinition = {
    key: '', label: '', type: CustomFieldTypes.TEXT, options: [],
    required: false, appliesTo: CustomFieldScopes.TESTCASE, order: 0,
};

const AdminCustomFieldsPage = function (props) {
    const { currentTeam } = props;
    const intl = useIntl();
    const toaster = useToaster();

    const [definitions, setDefinitions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editing, setEditing] = useState(undefined);
    const [saving, setSaving] = useState(false);
    const [deleteState, setDeleteState] = useState({ open: false, definition: undefined });

    const customFieldRequests = new CustomFieldRequests(axios);

    const pushError = (error, fallbackId) => {
        toaster.push(
            <Message type="error" showIcon closable>
                {getApiErrorMessage(error, intl.formatMessage({ id: fallbackId }))}
            </Message>,
            { placement: 'topEnd' },
        );
    };

    const loadDefinitions = useCallback(async () => {
        if (!currentTeam || !currentTeam._id) return;
        setLoading(true);
        try {
            // Archived fields are included so an admin can see what is still rendering on
            // existing cases; they are visually separated in the table.
            const response = await customFieldRequests.getCustomFields(currentTeam._id, true);
            setDefinitions(response.customFields || []);
        } catch (error) {
            pushError(error, 'page.admin-custom-fields.toast.fetch-error');
        } finally {
            setLoading(false);
        }
    }, [currentTeam]);

    useEffect(() => { loadDefinitions(); }, [loadDefinitions]);

    const typeOptions = Object.values(CustomFieldTypes).map((value) => ({
        label: intl.formatMessage({ id: `app.manual.custom-field.type.${value}` }),
        value,
    }));
    const scopeOptions = Object.values(CustomFieldScopes).map((value) => ({
        label: intl.formatMessage({ id: `app.manual.custom-field.scope.${value}` }),
        value,
    }));

    const keyInvalid = !!editing && !editing._id && !KEY_PATTERN.test(editing.key || '');

    const handleSave = async () => {
        if (!editing || keyInvalid) return;
        setSaving(true);
        try {
            const payload = {
                key: editing.key,
                label: editing.label,
                type: editing.type,
                options: OPTION_BACKED_TYPES.includes(editing.type) ? editing.options : [],
                required: !!editing.required,
                appliesTo: editing.appliesTo,
                order: Number(editing.order) || 0,
            };
            if (editing._id) {
                // key is the stable storage key values are held against, so it is not
                // editable after creation - changing it would orphan every stored value.
                const { key, ...updatable } = payload;
                await customFieldRequests.updateCustomField(editing._id, updatable);
            } else {
                await customFieldRequests.createCustomField({
                    ...payload, team: currentTeam._id,
                });
            }
            toaster.push(
                <Message type="success" showIcon closable duration={4000}>
                    {intl.formatMessage({
                        id: editing._id
                            ? 'page.admin-custom-fields.toast.updated'
                            : 'page.admin-custom-fields.toast.created',
                    })}
                </Message>,
                { placement: 'topEnd' },
            );
            setEditing(undefined);
            loadDefinitions();
        } catch (error) {
            pushError(error, 'page.admin-custom-fields.toast.save-error');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        const { definition } = deleteState;
        setDeleteState({ open: false, definition: undefined });
        if (!definition) return;
        try {
            const response = await customFieldRequests.deleteCustomField(definition._id);
            toaster.push(
                <Message type="info" showIcon closable>
                    <FormattedMessage
                        id={response && response.archived
                            ? 'page.admin-custom-fields.toast.archived'
                            : 'page.admin-custom-fields.toast.deleted'}
                    />
                </Message>,
                { placement: 'topEnd' },
            );
            loadDefinitions();
        } catch (error) {
            pushError(error, 'page.admin-custom-fields.toast.delete-error');
        }
    };

    if (!currentTeam || !currentTeam._id) {
        return (
            <div className="app-alert app-alert-info">
                <FormattedMessage id="app.manual.no-team" />
            </div>
        );
    }

    return (
        <div className="page admin-custom-fields-page">
            <Panel className="page-panel">
                <div className="page-panel-header">
                    <span className="page-section-title">
                        <FormattedMessage id="page.admin-custom-fields.title" />
                    </span>
                    <Whisper
                        placement="left"
                        speaker={(
                            <Tooltip>
                                <FormattedMessage id="page.admin-custom-fields.button.add" />
                            </Tooltip>
                        )}
                    >
                        <IconButton
                            appearance="subtle"
                            icon={<TableColumnIcon />}
                            onClick={() => setEditing({ ...emptyDefinition })}
                            aria-label={intl.formatMessage({ id: 'page.admin-custom-fields.button.add' })}
                        />
                    </Whisper>
                </div>
                <div className="page-help-text">
                    <FormattedMessage id="page.admin-custom-fields.help" />
                </div>

                {loading ? <Loader content={intl.formatMessage({ id: 'app.manual.loading' })} /> : (
                    <Table data={definitions} autoHeight rowKey="_id">
                        <Column flexGrow={1}>
                            <HeaderCell><FormattedMessage id="page.admin-custom-fields.header.label" /></HeaderCell>
                            <Cell>
                                {(row) => (
                                    <span>
                                        {row.label}
                                        {row.archived && (
                                            <Tag className="admin-custom-fields-archived">
                                                <FormattedMessage id="page.admin-custom-fields.archived" />
                                            </Tag>
                                        )}
                                    </span>
                                )}
                            </Cell>
                        </Column>
                        <Column flexGrow={1}>
                            <HeaderCell><FormattedMessage id="page.admin-custom-fields.header.key" /></HeaderCell>
                            <Cell dataKey="key" />
                        </Column>
                        <Column width={140}>
                            <HeaderCell><FormattedMessage id="page.admin-custom-fields.header.type" /></HeaderCell>
                            <Cell>
                                {(row) => <FormattedMessage id={`app.manual.custom-field.type.${row.type}`} />}
                            </Cell>
                        </Column>
                        <Column width={120}>
                            <HeaderCell><FormattedMessage id="page.admin-custom-fields.header.required" /></HeaderCell>
                            <Cell>
                                {(row) => (
                                    <FormattedMessage id={row.required ? 'app.manual.yes' : 'app.manual.no'} />
                                )}
                            </Cell>
                        </Column>
                        <Column width={140}>
                            <HeaderCell><FormattedMessage id="page.admin-custom-fields.header.applies-to" /></HeaderCell>
                            <Cell>
                                {(row) => <FormattedMessage id={`app.manual.custom-field.scope.${row.appliesTo}`} />}
                            </Cell>
                        </Column>
                        <Column width={160}>
                            <HeaderCell><FormattedMessage id="app.manual.actions" /></HeaderCell>
                            <Cell>
                                {(row) => (
                                    <span>
                                        <button type="button" className="link-action" onClick={() => setEditing({ ...row })}>
                                            <FormattedMessage id="app.manual.edit" />
                                        </button>
                                        {!row.archived && (
                                            <>
                                                <span className="link-separator">|</span>
                                                <button
                                                    type="button"
                                                    className="link-danger"
                                                    onClick={() => setDeleteState({ open: true, definition: row })}
                                                >
                                                    <FormattedMessage id="app.manual.delete" />
                                                </button>
                                            </>
                                        )}
                                    </span>
                                )}
                            </Cell>
                        </Column>
                    </Table>
                )}
            </Panel>

            <Modal open={!!editing} onClose={() => setEditing(undefined)}>
                <Modal.Header>
                    <Modal.Title>
                        <FormattedMessage
                            id={editing && editing._id
                                ? 'page.admin-custom-fields.modal.edit-title'
                                : 'page.admin-custom-fields.modal.add-title'}
                        />
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {editing && (
                        <Form fluid>
                            <Form.Group>
                                <Form.ControlLabel><FormattedMessage id="page.admin-custom-fields.form.label" /></Form.ControlLabel>
                                <Input
                                    value={editing.label}
                                    onChange={(value) => setEditing({ ...editing, label: value })}
                                />
                            </Form.Group>
                            <Form.Group>
                                <Form.ControlLabel><FormattedMessage id="page.admin-custom-fields.form.key" /></Form.ControlLabel>
                                <Input
                                    value={editing.key}
                                    disabled={!!editing._id}
                                    onChange={(value) => setEditing({
                                        ...editing,
                                        key: value.toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 40),
                                    })}
                                />
                                {keyInvalid ? (
                                    <Form.HelpText className="form-error-text">
                                        <FormattedMessage id="page.admin-custom-fields.form.key-invalid" />
                                    </Form.HelpText>
                                ) : (
                                    <Form.HelpText>
                                        <FormattedMessage id="page.admin-custom-fields.form.key-help" />
                                    </Form.HelpText>
                                )}
                            </Form.Group>
                            <Form.Group>
                                <Form.ControlLabel><FormattedMessage id="page.admin-custom-fields.form.type" /></Form.ControlLabel>
                                <SelectPicker
                                    data={typeOptions}
                                    value={editing.type}
                                    cleanable={false}
                                    searchable={false}
                                    block
                                    onChange={(value) => setEditing({ ...editing, type: value })}
                                />
                            </Form.Group>
                            {OPTION_BACKED_TYPES.includes(editing.type) && (
                                <Form.Group>
                                    <Form.ControlLabel><FormattedMessage id="page.admin-custom-fields.form.options" /></Form.ControlLabel>
                                    <TagInput
                                        value={editing.options || []}
                                        block
                                        trigger={['Enter', 'Comma']}
                                        onChange={(value) => setEditing({ ...editing, options: value })}
                                    />
                                </Form.Group>
                            )}
                            <Form.Group>
                                <Form.ControlLabel><FormattedMessage id="page.admin-custom-fields.form.applies-to" /></Form.ControlLabel>
                                <SelectPicker
                                    data={scopeOptions}
                                    value={editing.appliesTo}
                                    cleanable={false}
                                    searchable={false}
                                    block
                                    onChange={(value) => setEditing({ ...editing, appliesTo: value })}
                                />
                            </Form.Group>
                            <Form.Group>
                                <Form.ControlLabel><FormattedMessage id="page.admin-custom-fields.form.order" /></Form.ControlLabel>
                                <InputNumber
                                    value={editing.order}
                                    onChange={(value) => setEditing({ ...editing, order: value })}
                                />
                            </Form.Group>
                            <Form.Group>
                                <Form.ControlLabel><FormattedMessage id="page.admin-custom-fields.form.required" /></Form.ControlLabel>
                                <Toggle
                                    checked={!!editing.required}
                                    onChange={(value) => setEditing({ ...editing, required: value })}
                                />
                                <Form.HelpText>
                                    <FormattedMessage id="page.admin-custom-fields.form.required-help" />
                                </Form.HelpText>
                            </Form.Group>
                        </Form>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button className="btn-secondary" onClick={() => setEditing(undefined)}>
                        <FormattedMessage id="app.manual.cancel" />
                    </Button>
                    <Button className="btn-primary" loading={saving} disabled={keyInvalid} onClick={handleSave}>
                        <FormattedMessage id="app.manual.save" />
                    </Button>
                </Modal.Footer>
            </Modal>

            <ConfirmModal
                open={deleteState.open}
                title={intl.formatMessage({ id: 'page.admin-custom-fields.delete-confirm-title' })}
                message={intl.formatMessage({ id: 'page.admin-custom-fields.delete-confirm-message' })}
                confirmLabel={intl.formatMessage({ id: 'app.manual.delete' })}
                cancelLabel={intl.formatMessage({ id: 'app.manual.cancel' })}
                onConfirm={handleDelete}
                onCancel={() => setDeleteState({ open: false, definition: undefined })}
            />
        </div>
    );
};

const mapStateToProps = (state) => ({ currentTeam: state.teamsReducer.currentTeam });

export default connect(mapStateToProps)(AdminCustomFieldsPage);
