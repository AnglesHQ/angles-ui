import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { connect } from 'react-redux';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    Table, Button, IconButton, Whisper, Tooltip, Loader, Message, useToaster, Modal, Form,
    Input, SelectPicker, CheckPicker, Tag, Pagination, Panel,
} from 'rsuite';
import PlayOutlineIcon from '@rsuite/icons/PlayOutline';
import { FormattedMessage, useIntl } from 'react-intl';
import {
    ManualTestRunRequests, ManualTestCaseRequests, ManualRunStates,
} from 'angles-javascript-client';
import { getApiErrorMessage } from '../../../utility/ApiUtilities';
import ConfirmModal from '../../common/ConfirmModal';

const { Column, HeaderCell, Cell } = Table;

const PAGE_LIMIT = 25;
const RUN_STATES = Object.values(ManualRunStates);

const ManualTestRunsPage = function (props) {
    const { currentTeam, environments } = props;
    const intl = useIntl();
    const toaster = useToaster();
    const router = useRouter();

    const [runs, setRuns] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [statusFilter, setStatusFilter] = useState([]);
    const [creating, setCreating] = useState(undefined);
    const [saving, setSaving] = useState(false);
    const [availableCases, setAvailableCases] = useState([]);
    const [deleteState, setDeleteState] = useState({ open: false, run: undefined });

    const manualTestRunRequests = new ManualTestRunRequests(axios);
    const manualTestCaseRequests = new ManualTestCaseRequests(axios);

    const pushError = (error, fallbackId) => {
        toaster.push(
            <Message type="error" showIcon closable>
                {getApiErrorMessage(error, intl.formatMessage({ id: fallbackId }))}
            </Message>,
            { placement: 'topEnd' },
        );
    };

    const loadRuns = useCallback(async () => {
        if (!currentTeam || !currentTeam._id) return;
        setLoading(true);
        try {
            const response = await manualTestRunRequests.getTestRuns(
                currentTeam._id,
                statusFilter.length > 0 ? statusFilter : undefined,
                undefined,
                PAGE_LIMIT,
                (page - 1) * PAGE_LIMIT,
            );
            setRuns(response.testRuns || []);
            setTotal(response.metrics ? response.metrics.totalTestRuns : 0);
        } catch (error) {
            pushError(error, 'page.manual-test-runs.toast.fetch-error');
        } finally {
            setLoading(false);
        }
    }, [currentTeam, statusFilter, page]);

    useEffect(() => { loadRuns(); }, [loadRuns]);
    useEffect(() => { setPage(1); }, [statusFilter, currentTeam]);

    // Only ACTIVE cases can go into a run - the API rejects DEPRECATED ones, so offering
    // them would produce an error the QA could not act on.
    const openWizard = async () => {
        setCreating({ name: '', environment: undefined, component: undefined, testCaseIds: [] });
        try {
            const response = await manualTestCaseRequests.getTestCases(currentTeam._id, {
                status: ['ACTIVE'], limit: 200,
            });
            setAvailableCases(response.testCases || []);
        } catch (error) {
            pushError(error, 'page.manual-test-runs.toast.cases-error');
            setAvailableCases([]);
        }
    };

    const handleCreate = async () => {
        if (!creating) return;
        setSaving(true);
        try {
            const created = await manualTestRunRequests.createTestRun({
                name: creating.name,
                team: currentTeam._id,
                environment: creating.environment,
                component: creating.component,
                testCaseIds: creating.testCaseIds,
            });
            setCreating(undefined);
            router.push(`/manual-test-runs/${created._id}`);
        } catch (error) {
            pushError(error, 'page.manual-test-runs.toast.create-error');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        const { run } = deleteState;
        setDeleteState({ open: false, run: undefined });
        if (!run) return;
        try {
            await manualTestRunRequests.deleteTestRun(run._id);
            loadRuns();
        } catch (error) {
            pushError(error, 'page.manual-test-runs.toast.delete-error');
        }
    };

    if (!currentTeam || !currentTeam._id) {
        return (
            <div className="app-alert app-alert-info">
                <FormattedMessage id="app.manual.no-team" />
            </div>
        );
    }

    const statusOptions = RUN_STATES.map((value) => ({
        label: intl.formatMessage({ id: `app.manual.run-status.${value.toLowerCase()}` }),
        value,
    }));
    const environmentOptions = (environments || [])
        .map((environment) => ({ label: environment.name, value: environment.name }));
    const componentOptions = (currentTeam.components || [])
        .map((component) => ({ label: component.name, value: component._id }));
    const caseOptions = availableCases
        .map((testCase) => ({ label: testCase.title, value: testCase._id }));

    const progressOf = (run) => {
        const cases = run.testCases || [];
        const done = cases.filter((entry) => entry.status && entry.status !== 'NOT_RUN'
            && entry.status !== 'IN_PROGRESS').length;
        return `${done}/${cases.length}`;
    };

    return (
        <div className="page manual-test-runs-page">
            <Panel className="page-panel">
                <div className="page-panel-header">
                    <span className="page-section-title">
                        <FormattedMessage id="page.manual-test-runs.title" />
                    </span>
                    <Whisper
                        placement="left"
                        speaker={(
                            <Tooltip>
                                <FormattedMessage id="page.manual-test-runs.button.add" />
                            </Tooltip>
                        )}
                    >
                        <IconButton
                            appearance="subtle"
                            icon={<PlayOutlineIcon />}
                            onClick={openWizard}
                            aria-label={intl.formatMessage({ id: 'page.manual-test-runs.button.add' })}
                        />
                    </Whisper>
                </div>

                <div className="page-toolbar">
                    <CheckPicker
                        label={<FormattedMessage id="page.manual-test-runs.filter.status" />}
                        data={statusOptions}
                        value={statusFilter}
                        searchable={false}
                        className="manual-test-runs-status-filter"
                        onChange={setStatusFilter}
                    />
                </div>

                {loading ? <Loader content={intl.formatMessage({ id: 'app.manual.loading' })} /> : (
                    <>
                        <Table data={runs} autoHeight rowKey="_id">
                            <Column flexGrow={2}>
                                <HeaderCell><FormattedMessage id="page.manual-test-runs.header.name" /></HeaderCell>
                                <Cell>
                                    {(row) => (
                                        <Link href={`/manual-test-runs/${row._id}`}>{row.name}</Link>
                                    )}
                                </Cell>
                            </Column>
                            <Column width={150}>
                                <HeaderCell><FormattedMessage id="page.manual-test-runs.header.status" /></HeaderCell>
                                <Cell>
                                    {(row) => (
                                        <Tag className={`status-bg-${(row.status || '').toLowerCase()}`}>
                                            <FormattedMessage id={`app.manual.run-status.${(row.status || '').toLowerCase()}`} />
                                        </Tag>
                                    )}
                                </Cell>
                            </Column>
                            <Column width={130}>
                                <HeaderCell><FormattedMessage id="page.manual-test-runs.header.progress" /></HeaderCell>
                                <Cell>{(row) => progressOf(row)}</Cell>
                            </Column>
                            <Column flexGrow={1}>
                                <HeaderCell><FormattedMessage id="page.manual-test-runs.header.environment" /></HeaderCell>
                                <Cell>
                                    {(row) => (row.environment ? row.environment.name : '-')}
                                </Cell>
                            </Column>
                            <Column width={120}>
                                <HeaderCell><FormattedMessage id="app.manual.actions" /></HeaderCell>
                                <Cell>
                                    {(row) => (
                                        <button
                                            type="button"
                                            className="link-danger"
                                            onClick={() => setDeleteState({ open: true, run: row })}
                                        >
                                            <FormattedMessage id="app.manual.delete" />
                                        </button>
                                    )}
                                </Cell>
                            </Column>
                        </Table>
                        {total > PAGE_LIMIT && (
                            <Pagination
                                total={total}
                                limit={PAGE_LIMIT}
                                activePage={page}
                                onChangePage={setPage}
                                maxButtons={5}
                                prev
                                next
                            />
                        )}
                    </>
                )}
            </Panel>

            <Modal open={!!creating} size="md" onClose={() => setCreating(undefined)}>
                <Modal.Header>
                    <Modal.Title><FormattedMessage id="page.manual-test-runs.modal.title" /></Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {creating && (
                        <Form fluid>
                            <Form.Group>
                                <Form.ControlLabel><FormattedMessage id="page.manual-test-runs.form.name" /></Form.ControlLabel>
                                <Input
                                    value={creating.name}
                                    onChange={(value) => setCreating({ ...creating, name: value })}
                                />
                            </Form.Group>
                            <Form.Group>
                                <Form.ControlLabel><FormattedMessage id="page.manual-test-runs.form.environment" /></Form.ControlLabel>
                                <SelectPicker
                                    data={environmentOptions}
                                    value={creating.environment}
                                    block
                                    onChange={(value) => setCreating({ ...creating, environment: value })}
                                />
                            </Form.Group>
                            <Form.Group>
                                <Form.ControlLabel><FormattedMessage id="page.manual-test-runs.form.component" /></Form.ControlLabel>
                                <SelectPicker
                                    data={componentOptions}
                                    value={creating.component}
                                    block
                                    onChange={(value) => setCreating({ ...creating, component: value })}
                                />
                                <Form.HelpText>
                                    <FormattedMessage id="page.manual-test-runs.form.component-help" />
                                </Form.HelpText>
                            </Form.Group>
                            <Form.Group>
                                <Form.ControlLabel><FormattedMessage id="page.manual-test-runs.form.test-cases" /></Form.ControlLabel>
                                <CheckPicker
                                    data={caseOptions}
                                    value={creating.testCaseIds}
                                    block
                                    onChange={(value) => setCreating({ ...creating, testCaseIds: value })}
                                />
                                <Form.HelpText>
                                    <FormattedMessage id="page.manual-test-runs.form.test-cases-help" />
                                </Form.HelpText>
                            </Form.Group>
                        </Form>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button className="btn-secondary" onClick={() => setCreating(undefined)}>
                        <FormattedMessage id="app.manual.cancel" />
                    </Button>
                    <Button
                        className="btn-primary"
                        loading={saving}
                        disabled={!creating || !creating.name || !creating.environment
                            || (creating.testCaseIds || []).length === 0}
                        onClick={handleCreate}
                    >
                        <FormattedMessage id="page.manual-test-runs.button.create" />
                    </Button>
                </Modal.Footer>
            </Modal>

            <ConfirmModal
                open={deleteState.open}
                title={intl.formatMessage({ id: 'page.manual-test-runs.delete-confirm-title' })}
                message={intl.formatMessage({ id: 'page.manual-test-runs.delete-confirm-message' })}
                confirmLabel={intl.formatMessage({ id: 'app.manual.delete' })}
                cancelLabel={intl.formatMessage({ id: 'app.manual.cancel' })}
                onConfirm={handleDelete}
                onCancel={() => setDeleteState({ open: false, run: undefined })}
            />
        </div>
    );
};

const mapStateToProps = (state) => ({
    currentTeam: state.teamsReducer.currentTeam,
    environments: state.environmentsReducer.environments,
});

export default connect(mapStateToProps)(ManualTestRunsPage);
