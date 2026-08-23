import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { connect } from 'react-redux';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Table, Input, InputGroup, SelectPicker, TagPicker, Button, Loader, Pagination, Tag, Message, useToaster } from 'rsuite';
import SearchIcon from '@rsuite/icons/Search';
import PlusIcon from '@rsuite/icons/Plus';
import { FormattedMessage, useIntl } from 'react-intl';
import { ManualTestCaseRequests } from 'angles-javascript-client';
import { getApiErrorMessage } from '../../../utility/ApiUtilities';

const { Column, HeaderCell, Cell } = Table;

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

    const manualTestCaseRequests = new ManualTestCaseRequests(axios);

    const statusOptions = STATUS_VALUES.map((value) => ({
        label: intl.formatMessage({ id: `app.manual.status.${value.toLowerCase()}` }),
        value,
    }));
    const priorityOptions = PRIORITY_VALUES.map((value) => ({
        label: intl.formatMessage({ id: `app.manual.priority.${value.toLowerCase()}` }),
        value,
    }));

    const loadTestCases = useCallback(async () => {
        if (!currentTeam || !currentTeam._id) return;
        setLoading(true);
        try {
            const response = await manualTestCaseRequests.getTestCases(currentTeam._id, {
                search: search || undefined,
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
    }, [currentTeam, search, statusFilter, priorityFilter, page]);

    useEffect(() => {
        loadTestCases();
    }, [loadTestCases]);

    // Any filter change invalidates the current page - staying on page 4 of a narrower
    // result set would show an empty table rather than the matches.
    useEffect(() => {
        setPage(1);
    }, [search, statusFilter, priorityFilter, currentTeam]);

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
            <div className="page-panel">
                <div className="page-panel-header">
                    <h3 className="page-section-title">
                        <FormattedMessage id="page.manual-test-cases" />
                    </h3>
                    <Button
                        className="btn-primary"
                        onClick={handleCreate}
                        loading={creating}
                        startIcon={<PlusIcon />}
                    >
                        <FormattedMessage id="page.manual-test-cases.create" />
                    </Button>
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
                        <Table
                            data={testCases}
                            autoHeight
                            rowHeight={48}
                            onRowClick={(row) => router.push(`/manual-test-cases/${row._id}`)}
                        >
                            <Column flexGrow={3} align="left">
                                <HeaderCell><FormattedMessage id="page.manual-test-cases.table.title" /></HeaderCell>
                                <Cell>
                                    {(row) => (
                                        <Link className="link-action" href={`/manual-test-cases/${row._id}`}>
                                            {row.title}
                                        </Link>
                                    )}
                                </Cell>
                            </Column>
                            <Column width={120} align="left">
                                <HeaderCell><FormattedMessage id="page.manual-test-cases.table.status" /></HeaderCell>
                                <Cell>
                                    {(row) => (
                                        <Tag className={`manual-status-tag manual-status-${row.status.toLowerCase()}`}>
                                            <FormattedMessage id={`app.manual.status.${row.status.toLowerCase()}`} />
                                        </Tag>
                                    )}
                                </Cell>
                            </Column>
                            <Column width={110} align="left">
                                <HeaderCell><FormattedMessage id="page.manual-test-cases.table.priority" /></HeaderCell>
                                <Cell>
                                    {(row) => (
                                        <FormattedMessage id={`app.manual.priority.${row.priority.toLowerCase()}`} />
                                    )}
                                </Cell>
                            </Column>
                            <Column width={80} align="center">
                                <HeaderCell><FormattedMessage id="page.manual-test-cases.table.version" /></HeaderCell>
                                <Cell>{(row) => `v${row.version}`}</Cell>
                            </Column>
                            <Column width={160} align="left">
                                <HeaderCell><FormattedMessage id="page.manual-test-cases.table.updated-by" /></HeaderCell>
                                <Cell>
                                    {(row) => (row.updatedBy ? row.updatedBy.username : '—')}
                                </Cell>
                            </Column>
                            <Column width={80} align="center">
                                <HeaderCell><FormattedMessage id="page.manual-test-cases.table.steps" /></HeaderCell>
                                <Cell>{(row) => (row.steps ? row.steps.length : 0)}</Cell>
                            </Column>
                        </Table>

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
            </div>
        </div>
    );
}

const mapStateToProps = (state) => ({
    currentTeam: state.teamsReducer.currentTeam,
});

export default connect(mapStateToProps)(ManualTestCasesPage);
