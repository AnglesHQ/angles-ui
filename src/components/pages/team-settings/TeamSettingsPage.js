import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { connect } from 'react-redux';
import { Container, Content, Panel, Form, ButtonToolbar, Button, Message, useToaster, SelectPicker, TagInput, Tag, Divider } from 'rsuite';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { FormattedMessage, useIntl } from 'react-intl';

import { storeCurrentTeam, storeTeams } from '../../../redux/teamActions';

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

    const canManageTeams = user && (user.userType === 'admin' || user.userType === 'team_lead');

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

    const refreshTeams = async () => {
        try {
            const response = await axios.get('/team');
            saveTeams(response.data);
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

    if (isLoading || !user || !canManageTeams) {
        return null;
    }

    return (
        <Container>
            <Content className="page">
                <Panel
                    header={<span className="page-panel-header"><FormattedMessage id="page.team-settings.header" /></span>}
                    bordered
                    className="page-panel"
                >
                    {(!teams || teams.length === 0) ? (
                        <p><FormattedMessage id="page.team-settings.no-team-access" /></p>
                    ) : (
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
                </Panel>
            </Content>
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
