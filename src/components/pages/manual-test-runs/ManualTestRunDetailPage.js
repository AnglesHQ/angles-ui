import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Link from 'next/link';
import {
    Loader, Message, useToaster, Panel, Button, Input, SelectPicker, Tag, Nav, ButtonGroup,
} from 'rsuite';
import { FormattedMessage, useIntl } from 'react-intl';
import {
    ManualTestRunRequests, ManualTestCaseRequests, ManualRunStates,
    ManualCaseResultStates, ManualStepResultStates,
} from 'angles-javascript-client';
import { getApiErrorMessage } from '../../../utility/ApiUtilities';
import VersionBadge from '../../features/version-badge/VersionBadge';
import AttachmentUpload from '../../features/attachment-upload/AttachmentUpload';

/*
 * Execution view: works through one test case at a time, recording a result per step.
 *
 * Everything a tester sees comes from the *bound version*, never the live case. A case
 * edited mid-run does not shift under them - that binding is fixed at run creation, and the
 * version badge shows when the bound version has fallen behind the latest, linking to the
 * diff so the tester can see what changed without the run changing.
 */
const STEP_STATES = Object.values(ManualStepResultStates);
const CASE_STATES = Object.values(ManualCaseResultStates)
    .filter((state) => state !== 'NOT_RUN' && state !== 'IN_PROGRESS');

const ManualTestRunDetailPage = function ({ runId }) {
    const intl = useIntl();
    const toaster = useToaster();

    const [run, setRun] = useState(undefined);
    const [loading, setLoading] = useState(true);
    const [activeCaseId, setActiveCaseId] = useState(undefined);
    const [frozen, setFrozen] = useState(undefined);
    const [frozenLoading, setFrozenLoading] = useState(false);
    const [latestVersion, setLatestVersion] = useState(undefined);
    const [stepResults, setStepResults] = useState([]);
    const [caseStatus, setCaseStatus] = useState(undefined);
    const [notes, setNotes] = useState('');
    const [saving, setSaving] = useState(false);

    const manualTestRunRequests = new ManualTestRunRequests(axios);
    const manualTestCaseRequests = new ManualTestCaseRequests(axios);

    const pushError = (error, fallbackId) => {
        toaster.push(
            <Message type="error">
                {getApiErrorMessage(error, intl.formatMessage({ id: fallbackId }))}
            </Message>,
            { placement: 'topEnd' },
        );
    };

    const loadRun = useCallback(async () => {
        setLoading(true);
        try {
            const response = await manualTestRunRequests.getTestRun(runId, true);
            setRun(response);
            if (!activeCaseId && response.testCases && response.testCases.length > 0) {
                setActiveCaseId(response.testCases[0].testCase._id
                    || response.testCases[0].testCase);
            }
        } catch (error) {
            pushError(error, 'page.manual-test-run-detail.toast.fetch-error');
        } finally {
            setLoading(false);
        }
    }, [runId]);

    useEffect(() => { loadRun(); }, [loadRun]);

    const activeEntry = run && run.testCases
        ? run.testCases.find((entry) => (entry.testCase._id || entry.testCase) === activeCaseId)
        : undefined;

    // Loads the frozen version this entry is bound to, plus the case's version list purely
    // to tell the tester whether they are behind.
    useEffect(() => {
        const loadFrozen = async () => {
            if (!activeEntry) return;
            setFrozenLoading(true);
            try {
                const caseId = activeEntry.testCase._id || activeEntry.testCase;
                const [version, versions] = await Promise.all([
                    manualTestCaseRequests.getVersion(caseId, activeEntry.versionNumber),
                    manualTestCaseRequests.getVersions(caseId),
                ]);
                setFrozen(version);
                setLatestVersion((versions.versions || [])
                    .reduce((max, entry) => Math.max(max, entry.version), 0));
                const existing = activeEntry.stepResults || [];
                setStepResults((version.steps || []).map((step, index) => {
                    const previous = existing.find((result) => result.stepId === step._id)
                        || existing[index];
                    return {
                        stepId: step._id,
                        status: previous ? previous.status : ManualStepResultStates.NOT_RUN,
                        actual: previous ? previous.actual : '',
                        attachments: previous ? previous.attachments || [] : [],
                    };
                }));
                setCaseStatus(activeEntry.status && activeEntry.status !== 'NOT_RUN'
                    ? activeEntry.status : undefined);
                setNotes(activeEntry.notes || '');
            } catch (error) {
                pushError(error, 'page.manual-test-run-detail.toast.version-error');
                setFrozen(undefined);
            } finally {
                setFrozenLoading(false);
            }
        };
        loadFrozen();
    }, [activeCaseId, run]);

    const updateStepResult = (index, changes) => {
        setStepResults((current) => current.map(
            (result, position) => (position === index ? { ...result, ...changes } : result),
        ));
    };

    // A case defaults to the worst step outcome, which is what a tester means by "this
    // failed" without having to set it twice. They can still override it explicitly.
    const derivedCaseStatus = () => {
        if (caseStatus) return caseStatus;
        if (stepResults.some((result) => result.status === 'FAIL')) return 'FAIL';
        if (stepResults.some((result) => result.status === 'BLOCKED')) return 'BLOCKED';
        if (stepResults.some((result) => result.status === 'SKIPPED')) return 'SKIPPED';
        if (stepResults.length > 0
            && stepResults.every((result) => result.status === 'PASS')) return 'PASS';
        return undefined;
    };

    const handleRecord = async () => {
        const status = derivedCaseStatus();
        if (!activeEntry || !status) return;
        setSaving(true);
        try {
            const caseId = activeEntry.testCase._id || activeEntry.testCase;
            await manualTestRunRequests.recordResult(runId, caseId, {
                status,
                notes,
                stepResults: stepResults.map((result) => ({
                    stepId: result.stepId,
                    status: result.status,
                    actual: result.actual,
                    attachments: (result.attachments || []).map(
                        (attachment) => attachment._id || attachment,
                    ),
                })),
            });
            toaster.push(
                <Message type="success">
                    <FormattedMessage id="page.manual-test-run-detail.toast.recorded" />
                </Message>,
                { placement: 'topEnd' },
            );
            loadRun();
        } catch (error) {
            pushError(error, 'page.manual-test-run-detail.toast.record-error');
        } finally {
            setSaving(false);
        }
    };

    const handleRebind = async () => {
        if (!activeEntry) return;
        try {
            const caseId = activeEntry.testCase._id || activeEntry.testCase;
            await manualTestRunRequests.rebindTestCase(runId, caseId);
            loadRun();
        } catch (error) {
            // 409 when the entry already has a result - re-pointing it would attach a
            // recorded execution to content it was never run against.
            pushError(error, 'page.manual-test-run-detail.toast.rebind-error');
        }
    };

    const handleRunStatus = async (status) => {
        try {
            await manualTestRunRequests.updateStatus(runId, status);
            loadRun();
        } catch (error) {
            pushError(error, 'page.manual-test-run-detail.toast.status-error');
        }
    };

    if (loading) {
        return (
            <div className="app-alert app-alert-info">
                <Loader content={intl.formatMessage({ id: 'app.manual.loading' })} />
            </div>
        );
    }

    if (!run) {
        return (
            <div className="app-alert app-alert-error">
                <FormattedMessage id="page.manual-test-run-detail.not-found" />
            </div>
        );
    }

    const stepStateOptions = STEP_STATES.map((value) => ({
        label: intl.formatMessage({ id: `app.manual.step-status.${value.toLowerCase()}` }),
        value,
    }));
    const caseStateOptions = CASE_STATES.map((value) => ({
        label: intl.formatMessage({ id: `app.manual.case-status.${value.toLowerCase()}` }),
        value,
    }));
    const activeCaseIdValue = activeEntry
        ? (activeEntry.testCase._id || activeEntry.testCase) : undefined;
    const isBehind = latestVersion && activeEntry && latestVersion > activeEntry.versionNumber;
    const canRebind = isBehind && activeEntry
        && (!activeEntry.status || activeEntry.status === 'NOT_RUN');

    return (
        <div className="page manual-test-run-detail-page">
            <div className="page-detail-header">
                <span className="page-detail-header-title">{run.name}</span>
                <Tag className={`status-bg-${(run.status || '').toLowerCase()}`}>
                    <FormattedMessage id={`app.manual.run-status.${(run.status || '').toLowerCase()}`} />
                </Tag>
                <ButtonGroup>
                    {run.status !== ManualRunStates.IN_PROGRESS
                        && run.status !== ManualRunStates.COMPLETED && (
                        <Button className="btn-secondary" onClick={() => handleRunStatus(ManualRunStates.IN_PROGRESS)}>
                            <FormattedMessage id="page.manual-test-run-detail.button.start" />
                        </Button>
                    )}
                    {run.status !== ManualRunStates.COMPLETED && (
                        <Button className="btn-secondary" onClick={() => handleRunStatus(ManualRunStates.COMPLETED)}>
                            <FormattedMessage id="page.manual-test-run-detail.button.complete" />
                        </Button>
                    )}
                </ButtonGroup>
                {run.build && (
                    <Link className="link-action" href={`/test-run?buildId=${run.build._id || run.build}`}>
                        <FormattedMessage id="page.manual-test-run-detail.view-build" />
                    </Link>
                )}
            </div>

            <div className="manual-test-run-detail-body">
                <Panel className="page-panel manual-test-run-case-list">
                    <Nav vertical activeKey={activeCaseIdValue} onSelect={setActiveCaseId}>
                        {(run.testCases || []).map((entry) => {
                            const caseId = entry.testCase._id || entry.testCase;
                            const status = (entry.status || 'NOT_RUN').toLowerCase();
                            return (
                                <Nav.Item eventKey={caseId} key={caseId}>
                                    <span className={`status-${status}`}>●</span>
                                    <span className="manual-test-run-case-title">
                                        {entry.testCase.title || caseId}
                                    </span>
                                </Nav.Item>
                            );
                        })}
                    </Nav>
                </Panel>

                <div className="manual-test-run-execution">
                    {frozenLoading && <Loader content={intl.formatMessage({ id: 'app.manual.loading' })} />}
                    {!frozenLoading && frozen && activeEntry && (
                        <Panel className="page-panel">
                            <div className="page-panel-header">
                                <span className="page-section-title">{frozen.title}</span>
                                <VersionBadge
                                    version={activeEntry.versionNumber}
                                    latestVersion={latestVersion}
                                />
                                {isBehind && (
                                    <Link
                                        className="link-action"
                                        href={`/manual-test-cases/${activeCaseIdValue}/version/${activeEntry.versionNumber}`}
                                    >
                                        <FormattedMessage id="page.manual-test-run-detail.view-version" />
                                    </Link>
                                )}
                                {canRebind && (
                                    <button type="button" className="link-action" onClick={handleRebind}>
                                        <FormattedMessage id="page.manual-test-run-detail.button.rebind" />
                                    </button>
                                )}
                            </div>

                            {frozen.preconditions && (
                                <div className="page-section">
                                    <div className="page-section-title">
                                        <FormattedMessage id="app.manual.field.preconditions" />
                                    </div>
                                    <div>{frozen.preconditions}</div>
                                </div>
                            )}

                            {(frozen.steps || []).map((step, index) => (
                                <div className="manual-test-run-step" key={step._id || index}>
                                    <div className="manual-test-run-step-header">
                                        <span className="manual-test-run-step-number">{index + 1}</span>
                                        <SelectPicker
                                            data={stepStateOptions}
                                            value={stepResults[index] ? stepResults[index].status : undefined}
                                            cleanable={false}
                                            searchable={false}
                                            size="sm"
                                            style={{ width: 140 }}
                                            onChange={(value) => updateStepResult(index, { status: value })}
                                        />
                                    </div>
                                    <div className="manual-test-run-step-action">{step.action}</div>
                                    {step.expected && (
                                        <div className="manual-test-run-step-expected">
                                            <FormattedMessage id="app.manual.field.expected" />
                                            {': '}
                                            {step.expected}
                                        </div>
                                    )}
                                    <Input
                                        as="textarea"
                                        rows={2}
                                        placeholder={intl.formatMessage({ id: 'page.manual-test-run-detail.actual-placeholder' })}
                                        value={stepResults[index] ? stepResults[index].actual : ''}
                                        onChange={(value) => updateStepResult(index, { actual: value })}
                                    />
                                    <AttachmentUpload
                                        owner={{ executionId: activeEntry.execution }}
                                        attachments={stepResults[index]
                                            ? stepResults[index].attachments : []}
                                        onChange={(attachments) => updateStepResult(index, { attachments })}
                                        readOnly={!activeEntry.execution}
                                    />
                                </div>
                            ))}

                            <div className="page-section manual-test-run-outcome">
                                <SelectPicker
                                    label={<FormattedMessage id="page.manual-test-run-detail.case-result" />}
                                    data={caseStateOptions}
                                    value={derivedCaseStatus()}
                                    searchable={false}
                                    style={{ width: 220 }}
                                    onChange={setCaseStatus}
                                />
                                <Input
                                    as="textarea"
                                    rows={2}
                                    placeholder={intl.formatMessage({ id: 'page.manual-test-run-detail.notes-placeholder' })}
                                    value={notes}
                                    onChange={setNotes}
                                />
                                <Button
                                    className="btn-primary"
                                    loading={saving}
                                    disabled={!derivedCaseStatus()}
                                    onClick={handleRecord}
                                >
                                    <FormattedMessage id="page.manual-test-run-detail.button.record" />
                                </Button>
                            </div>
                        </Panel>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ManualTestRunDetailPage;
