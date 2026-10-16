import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { connect } from 'react-redux';
import { Container, Content, Panel, Form, ButtonToolbar, Button, IconButton, Whisper, Tooltip, Message, useToaster, SelectPicker, InputPicker, TagInput, Tag, Divider, Table } from 'rsuite';
import PeoplesPlusIcon from '@rsuite/icons/PeoplesPlus';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { FormattedMessage, useIntl } from 'react-intl';

import { storeCurrentTeam, storeTeams } from '../../../redux/teamActions';
import CreateTeamModal from './CreateTeamModal';
import ConfirmModal from '../../common/ConfirmModal';
import { getApiErrorMessage } from '../../../utility/ApiUtilities';

const { Column, HeaderCell, Cell } = Table;

// The API refuses shorter searches (it would otherwise list most of the user directory).
const MEMBER_SEARCH_MIN_LENGTH = 3;
const MEMBER_SEARCH_DEBOUNCE_MS = 250;

function TeamSettingsPage(props) {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const toaster = useToaster();
    const intl = useIntl();

    const { teams, currentTeam, saveCurrentTeam, saveTeams } = props;

    const [selectedTeamId, setSelectedTeamId] = useState(undefined);
    const [teamDetails, setTeamDetails] = useState(null);
    const [nameInput, setNameInput] = useState('');
    const [newComponents, setNewComponents] = useState([]);
    const [pendingComponentText, setPendingComponentText] = useState('');
    const [componentInputKey, setComponentInputKey] = useState(0);
    const [loading, setLoading] = useState(false);
    const [savingName, setSavingName] = useState(false);
    const [savingComponents, setSavingComponents] = useState(false);
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [members, setMembers] = useState([]);
    const [membersLoading, setMembersLoading] = useState(false);
    // Type-ahead for the add-member box: what has been typed, the matches the API returned
    // for it, and the one the user picked.
    const [memberSearchText, setMemberSearchText] = useState('');
    const [memberCandidates, setMemberCandidates] = useState([]);
    const [memberCandidatesLoading, setMemberCandidatesLoading] = useState(false);
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    // Remounting the picker is how its internal search text is cleared after an add.
    const [memberPickerKey, setMemberPickerKey] = useState(0);
    const candidateRequestRef = useRef(0);
    const [addingMember, setAddingMember] = useState(false);
    const [removeConfirm, setRemoveConfirm] = useState({ open: false, member: null });
    // The team whose members the page is showing, so a slow response for a team that has
    // since been switched away from cannot overwrite the list for the current one.
    const membersTeamRef = useRef(undefined);

    const canManageTeams = user && (user.userType === 'admin' || user.userType === 'team_lead');
    // Only admins can create teams; the API refuses anyone else.
    const canCreateTeams = user && user.userType === 'admin';
    const isAdmin = user && user.userType === 'admin';

    useEffect(() => {
        if (!isLoading && (!user || !canManageTeams)) {
            router.push('/');
        }
    }, [user, isLoading, router]);

    // Seeds the edit target ONCE, then leaves it alone. The guard is
    // `selectedTeamId === undefined` — "nothing chosen yet" — not a comparison
    // against `currentTeam`.
    //
    // Deliberately not kept in sync with the header afterwards, in either
    // direction: which team you are configuring is a separate question from
    // which team the app is scoped to. Wanting to rename Team B or add a
    // component to it says nothing about wanting to leave Team A's dashboards
    // and test runs. An earlier version followed `currentTeam` here, which
    // meant a header switch silently swapped the form out from under whatever
    // was being edited.
    //
    // The header is still the sensible starting point, so it is what the page
    // opens on.
    useEffect(() => {
        if (selectedTeamId !== undefined) return;
        if (currentTeam && currentTeam._id) {
            setSelectedTeamId(currentTeam._id);
        } else if (teams && teams.length > 0) {
            setSelectedTeamId(teams[0]._id);
        }
    }, [teams, currentTeam, selectedTeamId]);

    useEffect(() => {
        if (selectedTeamId) {
            fetchTeamDetails(selectedTeamId);
            fetchMembers(selectedTeamId);
        }
    }, [selectedTeamId]);

    const fetchTeamDetails = async (teamId) => {
        setLoading(true);
        try {
            const response = await axios.get(`/team/${teamId}`);
            setTeamDetails(response.data);
            setNameInput(response.data.name);
            setNewComponents([]);
            setPendingComponentText('');
            setComponentInputKey((key) => key + 1);
        } catch (error) {
            toaster.push(<Message type="error">{intl.formatMessage({ id: 'page.team-settings.toast.fetch-error' })}</Message>, { placement: 'topEnd' });
        } finally {
            setLoading(false);
        }
    };

    const fetchMembers = async (teamId) => {
        membersTeamRef.current = teamId;
        setMembersLoading(true);
        try {
            const response = await axios.get(`/team/${teamId}/members`);
            if (membersTeamRef.current === teamId) {
                setMembers(response.data);
            }
        } catch (error) {
            if (membersTeamRef.current === teamId) {
                setMembers([]);
                toaster.push(<Message type="error">{getApiErrorMessage(error, intl.formatMessage({ id: 'page.team-settings.toast.members-fetch-error' }))}</Message>, { placement: 'topEnd' });
            }
        } finally {
            if (membersTeamRef.current === teamId) {
                setMembersLoading(false);
            }
        }
    };

    // Wait for a pause in typing before asking the API, and ignore a response that has been
    // overtaken by a newer keystroke or a team switch.
    useEffect(() => {
        const term = memberSearchText.trim();
        candidateRequestRef.current += 1;
        const requestId = candidateRequestRef.current;
        if (!selectedTeamId || term.length < MEMBER_SEARCH_MIN_LENGTH) {
            setMemberCandidates([]);
            setMemberCandidatesLoading(false);
            return undefined;
        }
        setMemberCandidatesLoading(true);
        const timer = setTimeout(async () => {
            try {
                const response = await axios.get(`/team/${selectedTeamId}/members/candidates`, { params: { q: term } });
                if (candidateRequestRef.current === requestId) {
                    setMemberCandidates(response.data);
                }
            } catch (error) {
                // A failed lookup just shows no suggestions; it is not worth a toast per keystroke.
                if (candidateRequestRef.current === requestId) {
                    setMemberCandidates([]);
                }
            } finally {
                if (candidateRequestRef.current === requestId) {
                    setMemberCandidatesLoading(false);
                }
            }
        }, MEMBER_SEARCH_DEBOUNCE_MS);
        return () => clearTimeout(timer);
    }, [memberSearchText, selectedTeamId]);

    // The team being edited changed: drop the previous team's search and selection.
    useEffect(() => {
        setMemberSearchText('');
        setMemberCandidates([]);
        setSelectedCandidate(null);
        setMemberPickerKey((key) => key + 1);
    }, [selectedTeamId]);

    const refreshTeams = async () => {
        try {
            const response = await axios.get('/team');
            // Same order as the header's team list (see Shell.js).
            saveTeams([...response.data].sort((a, b) => a.name.localeCompare(b.name)));
        } catch (error) {
            // ignore, sidebar list will just be stale until next reload
        }
    };

    // Kept as an in-page control, unlike the filters on Dashboard and Metrics.
    // Here the team is the object being edited — renamed, its components
    // changed — not a filter over the page's content, so it belongs in the form
    // next to the fields it governs.
    //
    // Purely local: it does NOT write `currentTeam` or the `teamId` cookie.
    // Editing another team's configuration is not a statement that you want to
    // work in that team, and it used to be treated as one — opening this page
    // and picking Team B to rename it would move the whole app, for a year,
    // onto Team B. Switching context stays the header picker's job.
    const handleTeamChange = (teamId) => {
        if (!teamId) return;
        setSelectedTeamId(teamId);
    };

    const handleSaveName = async () => {
        setSavingName(true);
        try {
            await axios.put(`/team/${selectedTeamId}`, { name: nameInput });
            toaster.push(<Message type="success">{intl.formatMessage({ id: 'page.team-settings.toast.name-update-success' })}</Message>, { placement: 'topEnd' });
            await refreshTeams();
            // The one case that legitimately touches global state — and it
            // updates the selected team's NAME, never the selection. The header
            // renders `currentTeam.name` from its own copy in the store, which
            // `refreshTeams` does not touch, so renaming the team you are
            // currently scoped to would otherwise leave the old name in the
            // header until a reload.
            if (currentTeam && currentTeam._id === selectedTeamId) {
                saveCurrentTeam({ ...currentTeam, name: nameInput });
            }
            await fetchTeamDetails(selectedTeamId);
        } catch (error) {
            toaster.push(<Message type="error">{error.response?.data?.errors?.[0]?.msg || intl.formatMessage({ id: 'page.team-settings.toast.name-update-error' })}</Message>, { placement: 'topEnd' });
        } finally {
            setSavingName(false);
        }
    };

    const handleAddComponents = async () => {
        const trimmedPending = pendingComponentText.trim();
        const componentsToAdd = trimmedPending && !newComponents.includes(trimmedPending)
            ? [...newComponents, trimmedPending]
            : newComponents;
        if (componentsToAdd.length === 0) return;
        setSavingComponents(true);
        try {
            await axios.put(`/team/${selectedTeamId}/components`, { components: componentsToAdd });
            toaster.push(<Message type="success">{intl.formatMessage({ id: 'page.team-settings.toast.components-update-success' })}</Message>, { placement: 'topEnd' });
            await fetchTeamDetails(selectedTeamId);
        } catch (error) {
            toaster.push(<Message type="error">{error.response?.data?.errors?.[0]?.msg || intl.formatMessage({ id: 'page.team-settings.toast.components-update-error' })}</Message>, { placement: 'topEnd' });
        } finally {
            setSavingComponents(false);
        }
    };

    const handleAddMember = async () => {
        if (!selectedCandidate) return;
        setAddingMember(true);
        try {
            const response = await axios.post(`/team/${selectedTeamId}/members`, { username: selectedCandidate.username });
            toaster.push(<Message type="success">{intl.formatMessage({ id: 'page.team-settings.toast.members-add-success' }, { username: response.data.username })}</Message>, { placement: 'topEnd' });
            setSelectedCandidate(null);
            setMemberSearchText('');
            setMemberCandidates([]);
            setMemberPickerKey((key) => key + 1);
            await fetchMembers(selectedTeamId);
        } catch (error) {
            toaster.push(<Message type="error">{getApiErrorMessage(error, intl.formatMessage({ id: 'page.team-settings.toast.members-add-error' }))}</Message>, { placement: 'topEnd' });
        } finally {
            setAddingMember(false);
        }
    };

    const handleConfirmRemoveMember = async () => {
        const { member } = removeConfirm;
        setRemoveConfirm({ open: false, member: null });
        try {
            await axios.delete(`/team/${selectedTeamId}/members/${member._id}`);
            toaster.push(<Message type="success">{intl.formatMessage({ id: 'page.team-settings.toast.members-remove-success' }, { username: member.username })}</Message>, { placement: 'topEnd' });
        } catch (error) {
            toaster.push(<Message type="error">{getApiErrorMessage(error, intl.formatMessage({ id: 'page.team-settings.toast.members-remove-error' }))}</Message>, { placement: 'topEnd' });
        }
        await fetchMembers(selectedTeamId);
    };

    // The picker needs the picked user in its data to keep showing them once the search
    // text (and so the suggestion list) has changed.
    const memberPickerData = memberCandidates.map((candidate) => ({
        ...candidate, label: candidate.username, value: candidate.username,
    }));
    if (selectedCandidate && !memberPickerData.some((item) => item._id === selectedCandidate._id)) {
        memberPickerData.unshift(selectedCandidate);
    }

    // Why a member cannot be removed by the current user, or null when they can. Mirrors
    // the API's rule (the API is what enforces it): a team lead can remove anyone except
    // themselves and the core admin account; admins can remove anyone.
    const getLockedReason = (member) => {
        if (isAdmin) return null;
        if (member._id === user._id) return 'self';
        if (member.isCoreAdmin) return 'core-admin';
        return null;
    };

    // A new team opens in the form so its details and components can be filled in. Like
    // the in-page picker, this does not switch the team the rest of the app is scoped to.
    const handleTeamCreated = async (team) => {
        setCreateModalOpen(false);
        toaster.push(<Message type="success">{intl.formatMessage({ id: 'page.team-settings.toast.create-success' }, { name: team.name })}</Message>, { placement: 'topEnd' });
        await refreshTeams();
        setSelectedTeamId(team._id);
    };

    if (isLoading || !user || !canManageTeams) {
        return null;
    }

    const noTeams = !teams || teams.length === 0;

    return (
        <Container>
            <Content className="page">
                <Panel
                    header={(
                        <span className="page-panel-header">
                            <FormattedMessage id="page.team-settings.header" />
                            {canCreateTeams && (
                                <Whisper
                                    placement="left"
                                    speaker={(
                                        <Tooltip>
                                            <FormattedMessage id="page.team-settings.button.new-team" />
                                        </Tooltip>
                                    )}
                                >
                                    <IconButton
                                        appearance="subtle"
                                        icon={<PeoplesPlusIcon />}
                                        onClick={() => setCreateModalOpen(true)}
                                        aria-label={intl.formatMessage({ id: 'page.team-settings.button.new-team' })}
                                    />
                                </Whisper>
                            )}
                        </span>
                    )}
                    bordered
                    className="page-panel"
                >
                    {noTeams && canCreateTeams && (
                        <div className="page-section">
                            <p className="page-help-text"><FormattedMessage id="page.team-settings.no-teams-admin" /></p>
                            <Button className="btn-primary" onClick={() => setCreateModalOpen(true)}>
                                <FormattedMessage id="page.team-settings.button.create-team" />
                            </Button>
                        </div>
                    )}
                    {noTeams && !canCreateTeams && (
                        <p><FormattedMessage id="page.team-settings.no-team-access" /></p>
                    )}
                    {!noTeams && (
                        <Form fluid>
                            <Form.Group>
                                {/* "Team to configure", not "Team": this control no longer
                                    mirrors the header picker, so a bare label would read as
                                    the current team and make an edit to a different one look
                                    like it had switched the whole app. */}
                                <Form.ControlLabel><FormattedMessage id="page.team-settings.label.team" /></Form.ControlLabel>
                                <SelectPicker
                                    data={teams.map((team) => ({ label: team.name, value: team._id }))}
                                    value={selectedTeamId}
                                    onChange={handleTeamChange}
                                    cleanable={false}
                                    searchable={false}
                                    block
                                />
                                <p className="page-help-text"><FormattedMessage id="page.team-settings.label.team.help" /></p>
                            </Form.Group>

                            <Divider />

                            <h5 className="page-section-title"><FormattedMessage id="page.team-settings.section.details" /></h5>
                            <Form.Group>
                                <Form.ControlLabel><FormattedMessage id="page.team-settings.label.name" /></Form.ControlLabel>
                                <Form.Control
                                    name="teamName"
                                    value={nameInput}
                                    disabled={loading}
                                    onChange={(value) => setNameInput(value)}
                                />
                            </Form.Group>
                            <Form.Group>
                                <ButtonToolbar>
                                    <Button
                                        className="btn-primary"
                                        onClick={handleSaveName}
                                        loading={savingName}
                                        disabled={loading || !nameInput || nameInput === teamDetails?.name}
                                    >
                                        <FormattedMessage id="page.team-settings.button.save-name" />
                                    </Button>
                                </ButtonToolbar>
                            </Form.Group>

                            <Divider />

                            <h5 className="page-section-title"><FormattedMessage id="page.team-settings.section.components" /></h5>
                            <Form.HelpText className="team-settings-components-help"><FormattedMessage id="page.team-settings.components.help" /></Form.HelpText>
                            <Form.Group>
                                <Form.ControlLabel><FormattedMessage id="page.team-settings.label.existing-components" /></Form.ControlLabel>
                                <div className="team-settings-existing-components">
                                    {(teamDetails?.components || []).map((component) => (
                                        <Tag key={component._id}>{component.name}</Tag>
                                    ))}
                                </div>
                            </Form.Group>
                            <Form.Group>
                                <Form.ControlLabel><FormattedMessage id="page.team-settings.label.add-components" /></Form.ControlLabel>
                                <TagInput
                                    key={componentInputKey}
                                    value={newComponents}
                                    onChange={setNewComponents}
                                    onSearch={setPendingComponentText}
                                    placeholder={intl.formatMessage({ id: 'page.team-settings.components.add-placeholder' })}
                                    block
                                />
                            </Form.Group>
                            <Form.Group>
                                <ButtonToolbar>
                                    <Button
                                        className="btn-primary"
                                        onClick={handleAddComponents}
                                        loading={savingComponents}
                                        disabled={loading || (newComponents.length === 0 && !pendingComponentText.trim())}
                                    >
                                        <FormattedMessage id="page.team-settings.button.add-components" />
                                    </Button>
                                </ButtonToolbar>
                            </Form.Group>
                        </Form>
                    )}
                    {!noTeams && (
                        <div className="page-section team-settings-members">
                            <Divider />
                            <h5 className="page-section-title"><FormattedMessage id="page.team-settings.section.members" /></h5>
                            <p className="page-help-text"><FormattedMessage id="page.team-settings.members.help" /></p>
                            <div className="team-settings-members-add">
                                <label htmlFor="team-settings-member-username" className="team-settings-members-add-label">
                                    <FormattedMessage id="page.team-settings.members.label.add" />
                                </label>
                                <div className="team-settings-members-add-row">
                                    <InputPicker
                                        key={memberPickerKey}
                                        id="team-settings-member-username"
                                        className="team-settings-members-picker"
                                        data={memberPickerData}
                                        value={selectedCandidate ? selectedCandidate.username : null}
                                        onSearch={setMemberSearchText}
                                        onSelect={(value, item) => setSelectedCandidate(item)}
                                        onClean={() => setSelectedCandidate(null)}
                                        // The API has already filtered by what was typed, so the picker
                                        // must not filter the suggestions again by label.
                                        searchBy={() => true}
                                        renderMenuItem={(label, item) => (
                                            <span className="team-settings-members-option">
                                                <span>{label}</span>
                                                {item.role !== 'user' && (
                                                    <span className="team-settings-members-option-role">
                                                        <FormattedMessage id={`page.admin.users.user-type.${item.role}`} />
                                                    </span>
                                                )}
                                            </span>
                                        )}
                                        loading={memberCandidatesLoading}
                                        placeholder={intl.formatMessage({ id: 'page.team-settings.members.add-placeholder' })}
                                        locale={{
                                            searchPlaceholder: intl.formatMessage({ id: 'page.team-settings.members.search.hint' }, { count: MEMBER_SEARCH_MIN_LENGTH }),
                                            noResultsText: intl.formatMessage({
                                                id: memberSearchText.trim().length < MEMBER_SEARCH_MIN_LENGTH
                                                    ? 'page.team-settings.members.search.hint'
                                                    : 'page.team-settings.members.search.no-results',
                                            }, { count: MEMBER_SEARCH_MIN_LENGTH }),
                                        }}
                                        disabled={loading}
                                        block
                                    />
                                    <Button
                                        className="btn-primary"
                                        onClick={handleAddMember}
                                        loading={addingMember}
                                        disabled={loading || !selectedCandidate}
                                    >
                                        <FormattedMessage id="page.team-settings.members.button.add" />
                                    </Button>
                                </div>
                            </div>
                            {!membersLoading && members.length === 0 ? (
                                <p className="page-help-text"><FormattedMessage id="page.team-settings.members.empty" /></p>
                            ) : (
                                <Table
                                    data={members}
                                    loading={membersLoading}
                                    autoHeight
                                    rowKey="_id"
                                >
                                    <Column flexGrow={2}>
                                        <HeaderCell><FormattedMessage id="page.admin.users.table.username" /></HeaderCell>
                                        <Cell dataKey="username" />
                                    </Column>
                                    <Column flexGrow={1}>
                                        <HeaderCell><FormattedMessage id="page.admin.users.table.role" /></HeaderCell>
                                        <Cell>
                                            {(rowData) => intl.formatMessage({ id: `page.admin.users.user-type.${rowData.role}` })}
                                        </Cell>
                                    </Column>
                                    <Column width={140}>
                                        <HeaderCell><FormattedMessage id="page.user-settings.table.action" /></HeaderCell>
                                        <Cell>
                                            {(rowData) => {
                                                const lockedReason = getLockedReason(rowData);
                                                if (lockedReason) {
                                                    return (
                                                        <Whisper
                                                            placement="left"
                                                            speaker={(
                                                                <Tooltip>
                                                                    <FormattedMessage id={`page.team-settings.members.locked.${lockedReason}`} />
                                                                </Tooltip>
                                                            )}
                                                        >
                                                            <span className="team-settings-member-locked" aria-disabled="true">
                                                                <FormattedMessage id="page.team-settings.members.table.remove" />
                                                            </span>
                                                        </Whisper>
                                                    );
                                                }
                                                return (
                                                    <button
                                                        type="button"
                                                        className="link-danger"
                                                        onClick={() => setRemoveConfirm({ open: true, member: rowData })}
                                                    >
                                                        <FormattedMessage id="page.team-settings.members.table.remove" />
                                                    </button>
                                                );
                                            }}
                                        </Cell>
                                    </Column>
                                </Table>
                            )}
                        </div>
                    )}
                </Panel>
            </Content>
            <ConfirmModal
                open={removeConfirm.open}
                title={<FormattedMessage id="page.team-settings.members.confirm.remove.title" />}
                message={removeConfirm.member ? (
                    <FormattedMessage
                        id="page.team-settings.members.confirm.remove.message"
                        values={{ username: removeConfirm.member.username, team: teamDetails?.name }}
                    />
                ) : null}
                confirmLabel={<FormattedMessage id="page.team-settings.members.table.remove" />}
                cancelLabel={<FormattedMessage id="page.team-settings.button.cancel" />}
                onConfirm={handleConfirmRemoveMember}
                onCancel={() => setRemoveConfirm({ open: false, member: null })}
            />
            {canCreateTeams && (
                <CreateTeamModal
                    open={createModalOpen}
                    onClose={() => setCreateModalOpen(false)}
                    onCreated={handleTeamCreated}
                />
            )}
        </Container>
    );
}

const mapDispatchToProps = (dispatch) => ({
    saveCurrentTeam: (selectedTeam) => dispatch(storeCurrentTeam(selectedTeam)),
    saveTeams: (teams) => dispatch(storeTeams(teams)),
});

const mapStateToProps = (state) => ({
    currentTeam: state.teamsReducer.currentTeam,
    teams: state.teamsReducer.teams,
});

export default connect(mapStateToProps, mapDispatchToProps)(TeamSettingsPage);
