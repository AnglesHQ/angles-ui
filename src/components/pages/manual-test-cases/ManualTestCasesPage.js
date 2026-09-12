import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { connect } from 'react-redux';
import { useRouter } from 'next/navigation';
import {
    Input, InputGroup, TagPicker, IconButton, Whisper, Tooltip, Loader, Pagination, Message,
    useToaster, Panel,
} from 'rsuite';
import SearchIcon from '@rsuite/icons/Search';
import TaskIcon from '@rsuite/icons/Task';
import { FormattedMessage, useIntl } from 'react-intl';
import { ManualTestCaseRequests, ManualFolderRequests } from 'angles-javascript-client';
import { getApiErrorMessage } from '../../../utility/ApiUtilities';
import FolderTree, { ALL_FOLDERS, UNFILED } from '../../features/folder-tree/FolderTree';
import TestCaseSuites from '../../features/test-case-suites/TestCaseSuites';
import ConfirmModal from '../../common/ConfirmModal';

const STATUS_VALUES = ['DRAFT', 'ACTIVE', 'DEPRECATED'];
const PRIORITY_VALUES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const PAGE_LIMIT = 25;

function ManualTestCasesPage(props) {
    const { currentTeam } = props;
    const router = useRouter();
    const toaster = useToaster();
    const intl = useIntl();

    const [testCases, setTestCases] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState([]);
    const [priorityFilter, setPriorityFilter] = useState([]);
    const [creating, setCreating] = useState(false);
    const [folders, setFolders] = useState([]);
    const [unfiledCount, setUnfiledCount] = useState(0);
    const [foldersLoading, setFoldersLoading] = useState(false);
    // ALL_FOLDERS shows everything; a real id narrows to that branch.
    const [selectedFolder, setSelectedFolder] = useState(ALL_FOLDERS);
    const [deleteFolderState, setDeleteFolderState] = useState({ open: false, folder: undefined });
    // Folder sections the user has collapsed. Kept by id so collapsing survives a reload
    // of the list, which happens on every filter change and after every move.
    const [collapsedIds, setCollapsedIds] = useState([]);

    const manualTestCaseRequests = new ManualTestCaseRequests(axios);
    const manualFolderRequests = new ManualFolderRequests(axios);

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
            <Message type="error" showIcon closable>
                {getApiErrorMessage(error, intl.formatMessage({ id: fallbackId }))}
            </Message>,
            { placement: 'topEnd' },
        );
    };

    const loadTestCases = useCallback(async () => {
        if (!currentTeam || !currentTeam._id) return;
        setLoading(true);
        try {
            const response = await manualTestCaseRequests.getTestCases(currentTeam._id, {
                search: search || undefined,
                // A branch shows everything beneath it - otherwise a parent folder looks
                // empty while its sub-folders hold all the cases.
                folder: selectedFolder === ALL_FOLDERS ? undefined : selectedFolder,
                includeSubFolders: selectedFolder !== ALL_FOLDERS && selectedFolder !== UNFILED,
                status: statusFilter,
                priority: priorityFilter,
                limit: PAGE_LIMIT,
                skip: (page - 1) * PAGE_LIMIT,
            });
            setTestCases(response.testCases || []);
            setTotal(response.metrics ? response.metrics.totalTestCases : 0);
        } catch (error) {
            toaster.push(
                <Message type="error" showIcon closable>
                    {getApiErrorMessage(error, intl.formatMessage({ id: 'page.manual-test-cases.toast.fetch-error' }))}
                </Message>,
                { placement: 'topEnd' },
            );
        } finally {
            setLoading(false);
        }
    }, [currentTeam, search, statusFilter, priorityFilter, page, selectedFolder]);

    useEffect(() => {
        loadTestCases();
    }, [loadTestCases]);

    // Any filter change invalidates the current page - staying on page 4 of a narrower
    // result set would show an empty table rather than the matches.
    useEffect(() => {
        setPage(1);
    }, [search, statusFilter, priorityFilter, currentTeam, selectedFolder]);

    const handleCreate = async () => {
        if (!currentTeam || !currentTeam._id) return;
        setCreating(true);
        try {
            // Created as an empty draft and opened for editing, rather than asking for a
            // title up front - authoring is incremental and a draft need not be complete.
            const created = await manualTestCaseRequests.createTestCase({
                team: currentTeam._id,
                title: intl.formatMessage({ id: 'page.manual-test-cases.new-case-title' }),
            });
            router.push(`/manual-test-cases/${created._id}`);
        } catch (error) {
            toaster.push(
                <Message type="error" showIcon closable>
                    {getApiErrorMessage(error, intl.formatMessage({ id: 'page.manual-test-cases.toast.create-error' }))}
                </Message>,
                { placement: 'topEnd' },
            );
            setCreating(false);
        }
    };

    const loadFolders = useCallback(async () => {
        if (!currentTeam || !currentTeam._id) return;
        setFoldersLoading(true);
        try {
            const response = await manualFolderRequests.getFolders(currentTeam._id);
            setFolders(response.folders || []);
            setUnfiledCount(response.unfiledCount || 0);
        } catch (error) {
            pushError(error, 'page.manual-test-cases.toast.folders-error');
        } finally {
            setFoldersLoading(false);
        }
    }, [currentTeam]);

    useEffect(() => { loadFolders(); }, [loadFolders]);

    const handleCreateFolder = async (parent, name) => {
        try {
            await manualFolderRequests.createFolder({
                team: currentTeam._id, name, parent,
            });
            loadFolders();
        } catch (error) {
            // A duplicate sibling name comes back as a 409 with a message naming it.
            pushError(error, 'page.manual-test-cases.toast.folder-create-error');
        }
    };

    const handleRenameFolder = async (folder, name) => {
        try {
            await manualFolderRequests.updateFolder(folder._id, { name });
            loadFolders();
        } catch (error) {
            pushError(error, 'page.manual-test-cases.toast.folder-rename-error');
        }
    };

    const handleDeleteFolder = async () => {
        const { folder } = deleteFolderState;
        setDeleteFolderState({ open: false, folder: undefined });
        if (!folder) return;
        try {
            await manualFolderRequests.deleteFolder(folder._id);
            if (selectedFolder === folder._id) setSelectedFolder(ALL_FOLDERS);
            loadFolders();
        } catch (error) {
            // 409 while the folder still holds anything - the API names the counts, which
            // is more useful than a generic refusal.
            pushError(error, 'page.manual-test-cases.toast.folder-delete-error');
        }
    };

    /*
    Files a test case into a folder by drag and drop.

    Filing is organisation rather than content, so the API records it in the change
    history without burning a new test case version - dragging a case between folders
    must not make every bound execution point at a stale version.

    The list and the tree are both reloaded afterwards: the case moves between sections,
    and the per-folder counts in the tree change with it.
     */
    const handleMoveCase = async (caseId, folder) => {
        try {
            await manualFolderRequests.moveTestCases({ testCaseIds: [caseId], folder });
            await Promise.all([loadTestCases(), loadFolders()]);
            toaster.push(
                <Message type="success" showIcon closable>
                    <FormattedMessage id="page.manual-test-cases.toast.move-success" />
                </Message>,
                { placement: 'topEnd' },
            );
        } catch (error) {
            pushError(error, 'page.manual-test-cases.toast.move-error');
        }
    };

    const toggleCollapse = (key) => {
        setCollapsedIds((current) => (current.includes(key)
            ? current.filter((id) => id !== key)
            : [...current, key]));
    };

    if (!currentTeam || !currentTeam._id) {
        return (
            <div className="page">
                <div className="app-alert app-alert-info">
                    <FormattedMessage id="page.manual-test-cases.no-team" />
                </div>
            </div>
        );
    }

    return (
        <div className="page manual-test-cases-page">
          <div className="manual-test-cases-layout">
            <Panel className="page-panel manual-test-cases-tree">
                <FolderTree
                    folders={folders}
                    unfiledCount={unfiledCount}
                    totalCount={total}
                    value={selectedFolder}
                    loading={foldersLoading}
                    onSelect={setSelectedFolder}
                    onCreate={handleCreateFolder}
                    onRename={handleRenameFolder}
                    onDelete={(folder) => setDeleteFolderState({ open: true, folder })}
                    onDropCase={handleMoveCase}
                />
            </Panel>
            <Panel className="page-panel manual-test-cases-main">
                <div className="page-panel-header">
                    <span className="page-section-title">
                        <FormattedMessage id="page.manual-test-cases" />
                    </span>
                    <Whisper
                        placement="left"
                        speaker={(
                            <Tooltip>
                                <FormattedMessage id="page.manual-test-cases.create" />
                            </Tooltip>
                        )}
                    >
                        <IconButton
                            appearance="subtle"
                            icon={<TaskIcon />}
                            onClick={handleCreate}
                            loading={creating}
                            aria-label={intl.formatMessage({ id: 'page.manual-test-cases.create' })}
                        />
                    </Whisper>
                </div>

                <div className="page-toolbar manual-test-cases-filters">
                    <InputGroup inside className="manual-test-cases-search">
                        <Input
                            value={search}
                            onChange={setSearch}
                            placeholder={intl.formatMessage({ id: 'page.manual-test-cases.filters.search' })}
                        />
                        <InputGroup.Addon><SearchIcon /></InputGroup.Addon>
                    </InputGroup>
                    <TagPicker
                        data={statusOptions}
                        value={statusFilter}
                        onChange={setStatusFilter}
                        placeholder={intl.formatMessage({ id: 'page.manual-test-cases.filters.status' })}
                        cleanable
                    />
                    <TagPicker
                        data={priorityOptions}
                        value={priorityFilter}
                        onChange={setPriorityFilter}
                        placeholder={intl.formatMessage({ id: 'page.manual-test-cases.filters.priority' })}
                        cleanable
                    />
                </div>

                {loading ? (
                    <div className="app-alert app-alert-info">
                        <Loader content={<FormattedMessage id="page.manual-test-cases.loading" />} />
                    </div>
                ) : (
                    <>
                        <TestCaseSuites
                            testCases={testCases}
                            folders={folders}
                            onOpen={(id) => router.push(`/manual-test-cases/${id}`)}
                            onMoveCase={handleMoveCase}
                            collapsedIds={collapsedIds}
                            onToggleCollapse={toggleCollapse}
                        />

                        {testCases.length === 0 && (
                            <div className="app-alert app-alert-info">
                                <FormattedMessage id="page.manual-test-cases.empty" />
                            </div>
                        )}

                        {total > PAGE_LIMIT && (
                            <div className="manual-test-cases-pagination">
                                <Pagination
                                    prev
                                    next
                                    size="sm"
                                    total={total}
                                    limit={PAGE_LIMIT}
                                    activePage={page}
                                    onChangePage={setPage}
                                />
                            </div>
                        )}
                    </>
                )}
            </Panel>
          </div>

            <ConfirmModal
                open={deleteFolderState.open}
                title={intl.formatMessage({ id: 'app.manual.folders.delete-confirm-title' })}
                message={intl.formatMessage({ id: 'app.manual.folders.delete-confirm-message' })}
                confirmLabel={intl.formatMessage({ id: 'app.manual.delete' })}
                cancelLabel={intl.formatMessage({ id: 'app.manual.cancel' })}
                onConfirm={handleDeleteFolder}
                onCancel={() => setDeleteFolderState({ open: false, folder: undefined })}
            />
        </div>
    );
}

const mapStateToProps = (state) => ({
    currentTeam: state.teamsReducer.currentTeam,
});

export default connect(mapStateToProps)(ManualTestCasesPage);
