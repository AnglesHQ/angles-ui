import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { connect } from 'react-redux';
import { useRouter } from 'next/navigation';
import {
    Input, SelectPicker, TagInput, IconButton, Whisper, Tooltip, Loader, Nav, Message,
    useToaster, Panel,
} from 'rsuite';
import CloneIcon from '@rsuite/icons/Copy';
import TrashIcon from '@rsuite/icons/Trash';
import SaveIcon from '@rsuite/icons/Save';
import { FormattedMessage, useIntl } from 'react-intl';
import {
    ManualTestCaseRequests,
    SharedStepRequests,
    CustomFieldRequests,
    ManualFolderRequests,
} from 'angles-javascript-client';
import ManualStepEditor from '../../features/manual-step-editor/ManualStepEditor';
import CustomFieldForm from '../../features/custom-field-form/CustomFieldForm';
import ChangeHistory from '../../features/change-history/ChangeHistory';
import VersionBadge from '../../features/version-badge/VersionBadge';
import ConfirmModal from '../../common/ConfirmModal';
import { getApiErrorMessage } from '../../../utility/ApiUtilities';

const STATUS_VALUES = ['DRAFT', 'ACTIVE', 'DEPRECATED'];
const PRIORITY_VALUES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

function ManualTestCaseDetailPage(props) {
    const { caseId, currentTeam } = props;
    const router = useRouter();
    const toaster = useToaster();
    const intl = useIntl();

    const [testCase, setTestCase] = useState(null);
    const [draft, setDraft] = useState(null);
    const [sharedSteps, setSharedSteps] = useState([]);
    const [fieldDefinitions, setFieldDefinitions] = useState([]);
    const [versions, setVersions] = useState([]);
    const [folderOptions, setFolderOptions] = useState([]);
    const [history, setHistory] = useState([]);
    const [selectedVersion, setSelectedVersion] = useState(null);
    const [activeTab, setActiveTab] = useState('details');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    // Inline save feedback. A toast alone is easy to miss - it is a small transient corner
    // popup - and it cannot say whether the save burned a version, which is the thing an
    // author most needs to know about a manual test case.
    const [saveResult, setSaveResult] = useState(undefined);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);

    const manualTestCaseRequests = new ManualTestCaseRequests(axios);
    const sharedStepRequests = new SharedStepRequests(axios);
    const customFieldRequests = new CustomFieldRequests(axios);

    const statusOptions = STATUS_VALUES.map((value) => ({
        label: intl.formatMessage({ id: `app.manual.status.${value.toLowerCase()}` }),
        value,
    }));
    const priorityOptions = PRIORITY_VALUES.map((value) => ({
        label: intl.formatMessage({ id: `app.manual.priority.${value.toLowerCase()}` }),
        value,
    }));

    const pushError = (error, fallbackId) => {
        toaster.push(
            <Message type="error">
                {getApiErrorMessage(error, intl.formatMessage({ id: fallbackId }))}
            </Message>,
            { placement: 'topEnd' },
        );
    };

    const loadTestCase = useCallback(async () => {
        setLoading(true);
        try {
            const found = await manualTestCaseRequests.getTestCase(caseId);
            setTestCase(found);
            setDraft({
                title: found.title,
                description: found.description || '',
                preconditions: found.preconditions || '',
                status: found.status,
                priority: found.priority,
                tags: found.tags || [],
                folder: found.folder || null,
                steps: found.steps || [],
                customFields: found.customFields || {},
            });
            const teamId = found.team && found.team._id ? found.team._id : found.team;
            const manualFolderRequests = new ManualFolderRequests(axios);
            const [sharedStepResponse, customFieldResponse, versionResponse, folderResponse] = await Promise.all([
                sharedStepRequests.getSharedSteps(teamId),
                customFieldRequests.getCustomFields(teamId),
                manualTestCaseRequests.getVersions(caseId),
                manualFolderRequests.getFolders(teamId),
            ]);
            setSharedSteps(sharedStepResponse.sharedSteps || []);
            setFieldDefinitions(customFieldResponse.customFields || []);
            setVersions(versionResponse.versions || []);
            setFolderOptions(flattenFolders(folderResponse.folders));
        } catch (error) {
            pushError(error, 'page.manual-test-case-detail.toast.fetch-error');
        } finally {
            setLoading(false);
        }
    }, [caseId]);

    useEffect(() => {
        loadTestCase();
    }, [loadTestCase]);

    // History is fetched only when its tab is opened - it is paginated and unbounded, and
    // most visits to this page are to read or edit the case, not to audit it.
    useEffect(() => {
        if (activeTab !== 'history' || history.length > 0) return;
        const loadHistory = async () => {
            setHistoryLoading(true);
            try {
                const response = await manualTestCaseRequests.getHistory(caseId, 50);
                setHistory(response.history || []);
            } catch (error) {
                pushError(error, 'page.manual-test-case-detail.toast.history-error');
            } finally {
                setHistoryLoading(false);
            }
        };
        loadHistory();
    }, [activeTab, caseId]);

    // The editor holds whole attachment documents so it can render thumbnails, but the API
    // stores references - sending the objects makes mongoose try to cast one to an ObjectId
    // and fail. Ids are what goes on the wire.
    const toAttachmentIds = (attachments) => (attachments || [])
        .map((attachment) => (attachment && attachment._id ? attachment._id : attachment))
        .filter(Boolean);

    // A shared step inclusion has no action of its own - the shared step's contents are
    // expanded in its place - so the empty string the editor holds for the disabled input
    // is stripped rather than sent as content.
    const toPayload = (current) => ({
        ...current,
        steps: (current.steps || []).map((step) => {
            const normalised = { ...step, attachments: toAttachmentIds(step.attachments) };
            if (!('sharedStep' in normalised)) return normalised;
            const { action, expected, ...rest } = normalised;
            return action ? { ...rest, action, expected } : rest;
        }),
    });

    // The picker is a flat list with indentation rather than a nested control: a case
    // belongs to exactly one folder, and a full tree widget for a single choice is more
    // interaction than the decision needs.
    const flattenFolders = (nodes, depth = 0) => (nodes || []).reduce((all, node) => [
        ...all,
        { label: `${'\u00a0\u00a0'.repeat(depth)}${node.name}`, value: node._id },
        ...flattenFolders(node.children, depth + 1),
    ], []);

    const handleSave = async () => {
        setSaving(true);
        setSaveResult(undefined);
        const previousVersion = testCase ? testCase.version : undefined;
        try {
            const saved = await manualTestCaseRequests.updateTestCase(caseId, toPayload(draft));
            setTestCase(saved);
            // The version may or may not have moved - only a content change burns one - so
            // the list is refetched rather than assumed.
            const versionResponse = await manualTestCaseRequests.getVersions(caseId);
            setVersions(versionResponse.versions || []);
            setHistory([]);

            // Saying which of the two happened matters: "saved as v4" and "saved, still v3"
            // are both successes, but they mean different things to whoever reads the
            // history or runs a test against this case later.
            const versionBurned = saved.version !== previousVersion;
            const message = versionBurned
                ? intl.formatMessage(
                    { id: 'page.manual-test-case-detail.toast.saved-new-version' },
                    { version: saved.version },
                )
                : intl.formatMessage({ id: 'page.manual-test-case-detail.toast.saved-no-change' });
            setSaveResult({ type: 'success', message });
            toaster.push(
                <Message type="success" showIcon closable duration={4000}>
                    {message}
                </Message>,
                { placement: 'topEnd' },
            );
        } catch (error) {
            // The API's own message is far more useful than a generic failure - it names
            // the offending custom field, the missing shared step, or the invalid value.
            const message = getApiErrorMessage(
                error,
                intl.formatMessage({ id: 'page.manual-test-case-detail.toast.save-error' }),
            );
            setSaveResult({ type: 'error', message });
            toaster.push(
                <Message type="error" showIcon closable>
                    {message}
                </Message>,
                { placement: 'topEnd' },
            );
        } finally {
            setSaving(false);
        }
    };

    // Any further edit makes the previous save result stale, so it is dismissed rather
    // than left sitting above a form that has since changed.
    const updateDraft = (changes) => {
        setSaveResult(undefined);
        setDraft((current) => ({ ...current, ...changes }));
    };

    const handleClone = async () => {
        try {
            const clone = await manualTestCaseRequests.cloneTestCase(caseId);
            router.push(`/manual-test-cases/${clone._id}`);
        } catch (error) {
            pushError(error, 'page.manual-test-case-detail.toast.clone-error');
        }
    };

    const handleDelete = async () => {
        setConfirmDelete(false);
        try {
            await manualTestCaseRequests.deleteTestCase(caseId);
            router.push('/manual-test-cases');
        } catch (error) {
            pushError(error, 'page.manual-test-case-detail.toast.delete-error');
        }
    };

    const handleViewVersion = async (version) => {
        if (!version) {
            setSelectedVersion(null);
            return;
        }
        try {
            const frozen = await manualTestCaseRequests.getVersion(caseId, version);
            setSelectedVersion(frozen);
        } catch (error) {
            pushError(error, 'page.manual-test-case-detail.toast.version-error');
        }
    };

    if (loading || !draft) {
        return (
            <div className="page">
                <div className="app-alert app-alert-info">
                    <Loader content={<FormattedMessage id="page.manual-test-case-detail.loading" />} />
                </div>
            </div>
        );
    }

    const versionOptions = versions.map((version) => ({
        label: intl.formatMessage(
            { id: 'page.manual-test-case-detail.version-option' },
            { version: version.version },
        ),
        value: version.version,
    }));

    return (
        <div className="page manual-test-case-detail-page">
            <Panel className="page-panel">
                <div className="page-detail-header">
                    <h3 className="page-detail-header-title">{testCase.title}</h3>
                    <div className="manual-test-case-header-actions">
                        <VersionBadge version={testCase.version} latestVersion={testCase.version} />
                        <Whisper
                            placement="top"
                            speaker={(
                                <Tooltip>
                                    <FormattedMessage id="page.manual-test-case-detail.clone" />
                                </Tooltip>
                            )}
                        >
                            <IconButton
                                appearance="subtle"
                                icon={<CloneIcon />}
                                onClick={handleClone}
                                aria-label={intl.formatMessage({ id: 'page.manual-test-case-detail.clone' })}
                            />
                        </Whisper>
                        <Whisper
                            placement="top"
                            speaker={(
                                <Tooltip>
                                    <FormattedMessage id="page.manual-test-case-detail.delete" />
                                </Tooltip>
                            )}
                        >
                            <IconButton
                                appearance="subtle"
                                icon={<TrashIcon />}
                                onClick={() => setConfirmDelete(true)}
                                aria-label={intl.formatMessage({ id: 'page.manual-test-case-detail.delete' })}
                            />
                        </Whisper>
                        <Whisper
                            placement="top"
                            speaker={(
                                <Tooltip>
                                    <FormattedMessage id="page.manual-test-case-detail.save" />
                                </Tooltip>
                            )}
                        >
                            <IconButton
                                appearance="subtle"
                                icon={<SaveIcon />}
                                onClick={handleSave}
                                loading={saving}
                                aria-label={intl.formatMessage({ id: 'page.manual-test-case-detail.save' })}
                            />
                        </Whisper>
                    </div>
                </div>

                {saveResult && (
                    <div
                        className={saveResult.type === 'error'
                            ? 'app-alert app-alert-error manual-test-case-save-result'
                            : 'app-alert app-alert-success manual-test-case-save-result'}
                        role="status"
                    >
                        {saveResult.message}
                    </div>
                )}

                <Nav appearance="subtle" activeKey={activeTab} onSelect={setActiveTab} className="tabs-container">
                    <Nav.Item eventKey="details">
                        <FormattedMessage id="page.manual-test-case-detail.tab.details" />
                    </Nav.Item>
                    <Nav.Item eventKey="steps">
                        <FormattedMessage id="page.manual-test-case-detail.tab.steps" />
                    </Nav.Item>
                    <Nav.Item eventKey="versions">
                        <FormattedMessage id="page.manual-test-case-detail.tab.versions" />
                    </Nav.Item>
                    <Nav.Item eventKey="history">
                        <FormattedMessage id="page.manual-test-case-detail.tab.history" />
                    </Nav.Item>
                </Nav>

                {activeTab === 'details' && (
                    <div className="page-section manual-test-case-details">
                        <div className="detail-row">
                            <label className="custom-field-label" htmlFor="case-title">
                                <FormattedMessage id="page.manual-test-case-detail.field.title" />
                            </label>
                            <Input
                                id="case-title"
                                value={draft.title}
                                onChange={(value) => updateDraft({ title: value })}
                            />
                        </div>
                        <div className="detail-row">
                            <label className="custom-field-label" htmlFor="case-description">
                                <FormattedMessage id="page.manual-test-case-detail.field.description" />
                            </label>
                            <Input
                                id="case-description"
                                as="textarea"
                                rows={3}
                                value={draft.description}
                                onChange={(value) => updateDraft({ description: value })}
                            />
                        </div>
                        <div className="detail-row">
                            <label className="custom-field-label" htmlFor="case-preconditions">
                                <FormattedMessage id="page.manual-test-case-detail.field.preconditions" />
                            </label>
                            <Input
                                id="case-preconditions"
                                as="textarea"
                                rows={2}
                                value={draft.preconditions}
                                onChange={(value) => updateDraft({ preconditions: value })}
                            />
                        </div>
                        <div className="manual-test-case-detail-grid">
                            <div className="detail-row">
                                <label className="custom-field-label" htmlFor="case-status">
                                    <FormattedMessage id="page.manual-test-case-detail.field.status" />
                                </label>
                                <SelectPicker
                                    id="case-status"
                                    data={statusOptions}
                                    value={draft.status}
                                    onChange={(value) => updateDraft({ status: value })}
                                    cleanable={false}
                                    block
                                />
                                {/* Required custom fields only bite once a case leaves DRAFT, so
                                    say so before an author hits a validation error on save. */}
                                <p className="page-help-text">
                                    <FormattedMessage id="page.manual-test-case-detail.status-help" />
                                </p>
                            </div>
                            <div className="detail-row">
                                <label className="custom-field-label" htmlFor="case-priority">
                                    <FormattedMessage id="page.manual-test-case-detail.field.priority" />
                                </label>
                                <SelectPicker
                                    id="case-priority"
                                    data={priorityOptions}
                                    value={draft.priority}
                                    onChange={(value) => updateDraft({ priority: value })}
                                    cleanable={false}
                                    block
                                />
                            </div>
                        </div>
                        <div className="detail-row">
                            <label className="custom-field-label" htmlFor="case-folder">
                                <FormattedMessage id="page.manual-test-case-detail.field.folder" />
                            </label>
                            <SelectPicker
                                id="case-folder"
                                data={folderOptions}
                                value={draft.folder || null}
                                // Clearing the picker files the case back at the team root,
                                // which is a real destination rather than an absence.
                                onChange={(value) => updateDraft({ folder: value || null })}
                                placeholder={intl.formatMessage({ id: 'page.manual-test-case-detail.folder-root' })}
                                block
                            />
                        </div>
                        <div className="detail-row">
                            <label className="custom-field-label" htmlFor="case-tags">
                                <FormattedMessage id="page.manual-test-case-detail.field.tags" />
                            </label>
                            <TagInput
                                id="case-tags"
                                value={draft.tags}
                                onChange={(value) => updateDraft({ tags: value })}
                                block
                            />
                        </div>

                        {fieldDefinitions.length > 0 && (
                            <Panel
                                header={<FormattedMessage id="page.manual-test-case-detail.custom-fields" />}
                                className="manual-test-case-custom-fields"
                            >
                                <CustomFieldForm
                                    definitions={fieldDefinitions}
                                    values={draft.customFields}
                                    onChange={(values) => updateDraft({ customFields: values })}
                                />
                            </Panel>
                        )}
                    </div>
                )}

                {activeTab === 'steps' && (
                    <div className="page-section">
                        <ManualStepEditor
                            steps={draft.steps}
                            onChange={(steps) => updateDraft({ steps })}
                            sharedSteps={sharedSteps}
                            attachmentOwner={{ testCaseId: caseId }}
                        />
                    </div>
                )}

                {activeTab === 'versions' && (
                    <div className="page-section manual-test-case-versions">
                        <div className="page-toolbar">
                            <SelectPicker
                                data={versionOptions}
                                value={selectedVersion ? selectedVersion.version : null}
                                onChange={handleViewVersion}
                                placeholder={intl.formatMessage({ id: 'page.manual-test-case-detail.select-version' })}
                                cleanable
                            />
                        </div>
                        {selectedVersion ? (
                            <>
                                {/* Reading a frozen version, not the live case: this is exactly
                                    what an execution bound to it renders. */}
                                <div className="manual-version-header">
                                    <VersionBadge
                                        version={selectedVersion.version}
                                        latestVersion={testCase.version}
                                    />
                                    <span className="manual-version-title">{selectedVersion.title}</span>
                                </div>
                                <ManualStepEditor steps={selectedVersion.steps} readOnly />
                            </>
                        ) : (
                            <div className="app-alert app-alert-info">
                                <FormattedMessage id="page.manual-test-case-detail.versions-help" />
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'history' && (
                    <div className="page-section">
                        <ChangeHistory entries={history} loading={historyLoading} />
                    </div>
                )}
            </Panel>

            <ConfirmModal
                open={confirmDelete}
                title={intl.formatMessage({ id: 'page.manual-test-case-detail.delete-confirm-title' })}
                message={intl.formatMessage({ id: 'page.manual-test-case-detail.delete-confirm-message' })}
                confirmLabel={intl.formatMessage({ id: 'page.manual-test-case-detail.delete' })}
                cancelLabel={intl.formatMessage({ id: 'app.manual.cancel' })}
                onConfirm={handleDelete}
                onCancel={() => setConfirmDelete(false)}
            />
        </div>
    );
}

const mapStateToProps = (state) => ({
    currentTeam: state.teamsReducer.currentTeam,
});

export default connect(mapStateToProps)(ManualTestCaseDetailPage);
