import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { connect } from 'react-redux';
import {
    Table, Input, InputGroup, Button, IconButton, Whisper, Tooltip, Loader, Message,
    useToaster, Modal, Form, Drawer, Tag, Panel,
} from 'rsuite';
import SearchIcon from '@rsuite/icons/Search';
import CombinationIcon from '@rsuite/icons/Combination';
import { FormattedMessage, useIntl } from 'react-intl';
import Link from 'next/link';
import { SharedStepRequests } from 'angles-javascript-client';
import { getApiErrorMessage } from '../../../utility/ApiUtilities';
import ManualStepEditor from '../../features/manual-step-editor/ManualStepEditor';
import ChangeHistory from '../../features/change-history/ChangeHistory';
import ConfirmModal from '../../common/ConfirmModal';

const { Column, HeaderCell, Cell } = Table;

const SharedStepsPage = function (props) {
    const { currentTeam } = props;
    const intl = useIntl();
    const toaster = useToaster();

    const [sharedSteps, setSharedSteps] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [editing, setEditing] = useState(undefined);
    const [saving, setSaving] = useState(false);
    const [usage, setUsage] = useState(undefined);
    const [usageLoading, setUsageLoading] = useState(false);
    const [history, setHistory] = useState(undefined);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [deleteState, setDeleteState] = useState({ open: false, sharedStep: undefined });
    const [cascadeWarning, setCascadeWarning] = useState(undefined);

    const sharedStepRequests = new SharedStepRequests(axios);

    const pushError = (error, fallbackId) => {
        toaster.push(
            <Message type="error" showIcon closable>
                {getApiErrorMessage(error, intl.formatMessage({ id: fallbackId }))}
            </Message>,
            { placement: 'topEnd' },
        );
    };

    const loadSharedSteps = useCallback(async () => {
        if (!currentTeam || !currentTeam._id) return;
        setLoading(true);
        try {
            const response = await sharedStepRequests
                .getSharedSteps(currentTeam._id, search || undefined);
            setSharedSteps(response.sharedSteps || []);
        } catch (error) {
            pushError(error, 'page.shared-steps.toast.fetch-error');
        } finally {
            setLoading(false);
        }
    }, [currentTeam, search]);

    useEffect(() => { loadSharedSteps(); }, [loadSharedSteps]);

    // Editing a shared step re-versions every case that includes it, so the author is told
    // how many that is before they commit rather than after.
    const openEditor = async (sharedStep) => {
        setEditing(sharedStep ? { ...sharedStep } : { name: '', description: '', steps: [] });
        setCascadeWarning(undefined);
        if (sharedStep && sharedStep._id) {
            try {
                const response = await sharedStepRequests.getUsage(sharedStep._id);
                const count = response.metrics ? response.metrics.totalTestCases : 0;
                if (count > 0) setCascadeWarning(count);
            } catch (error) {
                // A failed usage lookup must not block editing - the warning is advisory.
                setCascadeWarning(undefined);
            }
        }
    };

    const handleSave = async () => {
        if (!editing) return;
        setSaving(true);
        try {
            const payload = {
                name: editing.name,
                description: editing.description,
                steps: (editing.steps || []).map((step, index) => ({
                    order: index + 1,
                    action: step.action,
                    expected: step.expected,
                    data: step.data,
                    // The editor holds whole attachment documents so it can render
                    // thumbnails; the API stores references.
                    attachments: (step.attachments || [])
                        .map((attachment) => (attachment && attachment._id
                            ? attachment._id : attachment))
                        .filter(Boolean),
                })),
            };
            if (editing._id) {
                const response = await sharedStepRequests.updateSharedStep(editing._id, payload);
                const cascaded = response && response.cascade
                    ? response.cascade.testCasesVersioned : 0;
                // A cascade is the notable outcome - it re-versioned other people's test
                // cases - so it is reported instead of the plain confirmation, not as well.
                toaster.push(
                    <Message type="success" showIcon closable duration={4000}>
                        {cascaded > 0
                            ? intl.formatMessage(
                                { id: 'page.shared-steps.toast.cascaded' }, { count: cascaded },
                            )
                            : intl.formatMessage({ id: 'page.shared-steps.toast.saved' })}
                    </Message>,
                    { placement: 'topEnd' },
                );
            } else {
                await sharedStepRequests.createSharedStep({ ...payload, team: currentTeam._id });
                toaster.push(
                    <Message type="success" showIcon closable duration={4000}>
                        {intl.formatMessage({ id: 'page.shared-steps.toast.created' })}
                    </Message>,
                    { placement: 'topEnd' },
                );
            }
            setEditing(undefined);
            loadSharedSteps();
        } catch (error) {
            pushError(error, 'page.shared-steps.toast.save-error');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        const { sharedStep } = deleteState;
        setDeleteState({ open: false, sharedStep: undefined });
        if (!sharedStep) return;
        try {
            await sharedStepRequests.deleteSharedStep(sharedStep._id);
            loadSharedSteps();
        } catch (error) {
            // 409 when the step is still referenced - the message from the API names the count.
            pushError(error, 'page.shared-steps.toast.delete-error');
        }
    };

    const showUsage = async (sharedStep) => {
        setUsage({ sharedStep, testCases: [] });
        setUsageLoading(true);
        try {
            const response = await sharedStepRequests.getUsage(sharedStep._id);
            setUsage({ sharedStep, testCases: response.testCases || [] });
        } catch (error) {
            pushError(error, 'page.shared-steps.toast.usage-error');
            setUsage(undefined);
        } finally {
            setUsageLoading(false);
        }
    };

    const showHistory = async (sharedStep) => {
        setHistory({ sharedStep, entries: [] });
        setHistoryLoading(true);
        try {
            const response = await sharedStepRequests.getHistory(sharedStep._id);
            setHistory({ sharedStep, entries: response.history || [] });
        } catch (error) {
            pushError(error, 'page.shared-steps.toast.history-error');
            setHistory(undefined);
        } finally {
            setHistoryLoading(false);
        }
    };

    if (!currentTeam || !currentTeam._id) {
        return (
            <div className="page">
                <div className="app-alert app-alert-info">
                    <FormattedMessage id="app.manual.no-team" />
                </div>
            </div>
        );
    }

    return (
        <div className="page shared-steps-page">
            <Panel className="page-panel">
                <div className="page-panel-header">
                    <span className="page-section-title">
                        <FormattedMessage id="page.shared-steps.title" />
                    </span>
                    <Whisper
                        placement="left"
                        speaker={(
                            <Tooltip>
                                <FormattedMessage id="page.shared-steps.button.add" />
                            </Tooltip>
                        )}
                    >
                        <IconButton
                            appearance="subtle"
                            icon={<CombinationIcon />}
                            onClick={() => openEditor(undefined)}
                            aria-label={intl.formatMessage({ id: 'page.shared-steps.button.add' })}
                        />
                    </Whisper>
                </div>
                <div className="page-help-text">
                    <FormattedMessage id="page.shared-steps.help" />
                </div>

                <div className="page-toolbar">
                    <InputGroup inside className="shared-steps-search">
                        <Input
                            value={search}
                            placeholder={intl.formatMessage({ id: 'page.shared-steps.search-placeholder' })}
                            onChange={setSearch}
                        />
                        <InputGroup.Addon><SearchIcon /></InputGroup.Addon>
                    </InputGroup>
                </div>

                {loading ? <Loader content={intl.formatMessage({ id: 'app.manual.loading' })} /> : (
                    <Table data={sharedSteps} autoHeight rowKey="_id">
                        <Column flexGrow={2}>
                            <HeaderCell><FormattedMessage id="page.shared-steps.header.name" /></HeaderCell>
                            <Cell dataKey="name" />
                        </Column>
                        <Column flexGrow={2}>
                            <HeaderCell><FormattedMessage id="page.shared-steps.header.description" /></HeaderCell>
                            <Cell dataKey="description" />
                        </Column>
                        <Column width={90}>
                            <HeaderCell><FormattedMessage id="page.shared-steps.header.steps" /></HeaderCell>
                            <Cell>{(row) => ((row.steps || []).length)}</Cell>
                        </Column>
                        <Column width={90}>
                            <HeaderCell><FormattedMessage id="page.shared-steps.header.version" /></HeaderCell>
                            <Cell>{(row) => <Tag>{`v${row.version}`}</Tag>}</Cell>
                        </Column>
                        <Column width={260}>
                            <HeaderCell><FormattedMessage id="app.manual.actions" /></HeaderCell>
                            <Cell>
                                {(row) => (
                                    <span>
                                        <button type="button" className="link-action" onClick={() => openEditor(row)}>
                                            <FormattedMessage id="app.manual.edit" />
                                        </button>
                                        <span className="link-separator">|</span>
                                        <button type="button" className="link-action" onClick={() => showUsage(row)}>
                                            <FormattedMessage id="page.shared-steps.action.usage" />
                                        </button>
                                        <span className="link-separator">|</span>
                                        <button type="button" className="link-action" onClick={() => showHistory(row)}>
                                            <FormattedMessage id="page.shared-steps.action.history" />
                                        </button>
                                        <span className="link-separator">|</span>
                                        <button
                                            type="button"
                                            className="link-danger"
                                            onClick={() => setDeleteState({ open: true, sharedStep: row })}
                                        >
                                            <FormattedMessage id="app.manual.delete" />
                                        </button>
                                    </span>
                                )}
                            </Cell>
                        </Column>
                    </Table>
                )}
            </Panel>

            <Modal open={!!editing} size="lg" onClose={() => setEditing(undefined)}>
                <Modal.Header>
                    <Modal.Title>
                        <FormattedMessage
                            id={editing && editing._id
                                ? 'page.shared-steps.modal.edit-title'
                                : 'page.shared-steps.modal.add-title'}
                        />
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {editing && (
                        <>
                            {cascadeWarning > 0 && (
                                <div className="app-alert app-alert-info">
                                    <FormattedMessage
                                        id="page.shared-steps.cascade-warning"
                                        values={{ count: cascadeWarning }}
                                    />
                                </div>
                            )}
                            <Form fluid>
                                <Form.Group>
                                    <Form.ControlLabel><FormattedMessage id="page.shared-steps.form.name" /></Form.ControlLabel>
                                    <Input
                                        value={editing.name}
                                        onChange={(value) => setEditing({ ...editing, name: value })}
                                    />
                                </Form.Group>
                                <Form.Group>
                                    <Form.ControlLabel><FormattedMessage id="page.shared-steps.form.description" /></Form.ControlLabel>
                                    <Input
                                        as="textarea"
                                        rows={2}
                                        value={editing.description}
                                        onChange={(value) => setEditing({ ...editing, description: value })}
                                    />
                                </Form.Group>
                            </Form>
                            <ManualStepEditor
                                steps={editing.steps || []}
                                onChange={(steps) => setEditing({ ...editing, steps })}
                                attachmentOwner={editing._id
                                    ? { sharedStepId: editing._id } : undefined}
                            />
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button className="btn-secondary" onClick={() => setEditing(undefined)}>
                        <FormattedMessage id="app.manual.cancel" />
                    </Button>
                    <Button className="btn-primary" loading={saving} onClick={handleSave}>
                        <FormattedMessage id="app.manual.save" />
                    </Button>
                </Modal.Footer>
            </Modal>

            <Drawer open={!!usage} size="sm" onClose={() => setUsage(undefined)}>
                <Drawer.Header>
                    <Drawer.Title>
                        <FormattedMessage id="page.shared-steps.usage.title" />
                    </Drawer.Title>
                </Drawer.Header>
                <Drawer.Body>
                    {usageLoading && <Loader content={intl.formatMessage({ id: 'app.manual.loading' })} />}
                    {usage && !usageLoading && usage.testCases.length === 0 && (
                        <div className="app-alert app-alert-info">
                            <FormattedMessage id="page.shared-steps.usage.empty" />
                        </div>
                    )}
                    {usage && !usageLoading && usage.testCases.map((testCase) => (
                        <div className="shared-steps-usage-row" key={testCase._id}>
                            <Link href={`/manual-test-cases/${testCase._id}`}>{testCase.title}</Link>
                            <Tag>{`v${testCase.version}`}</Tag>
                        </div>
                    ))}
                </Drawer.Body>
            </Drawer>

            <Drawer open={!!history} size="sm" onClose={() => setHistory(undefined)}>
                <Drawer.Header>
                    <Drawer.Title>
                        <FormattedMessage id="page.shared-steps.history.title" />
                    </Drawer.Title>
                </Drawer.Header>
                <Drawer.Body>
                    <ChangeHistory
                        entries={history ? history.entries : []}
                        loading={historyLoading}
                    />
                </Drawer.Body>
            </Drawer>

            <ConfirmModal
                open={deleteState.open}
                title={intl.formatMessage({ id: 'page.shared-steps.delete-confirm-title' })}
                message={intl.formatMessage({ id: 'page.shared-steps.delete-confirm-message' })}
                confirmLabel={intl.formatMessage({ id: 'app.manual.delete' })}
                cancelLabel={intl.formatMessage({ id: 'app.manual.cancel' })}
                onConfirm={handleDelete}
                onCancel={() => setDeleteState({ open: false, sharedStep: undefined })}
            />
        </div>
    );
};

const mapStateToProps = (state) => ({ currentTeam: state.teamsReducer.currentTeam });

export default connect(mapStateToProps)(SharedStepsPage);
