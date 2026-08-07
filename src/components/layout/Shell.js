'use client';

import React, { useEffect, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import queryString from 'query-string';
import Cookies from 'js-cookie';
import { connect } from 'react-redux';
import { EnvironmentRequests, TeamRequests } from 'angles-javascript-client';
import { useAuth } from '../../context/AuthContext';
import { getAnglesApiUrl } from '../../utils/runtime-config';

import {
    Container,
    Header,
    Sidebar,
    Sidenav,
    Content,
    Navbar,
    Nav, Affix,
    Modal,
    Button,
    Loader,
} from 'rsuite';
import AngleLeftIcon from '@rsuite/icons/legacy/AngleLeft';
import AngleRightIcon from '@rsuite/icons/legacy/AngleRight';
import Image from '@rsuite/icons/Image';
import BarChart from '@rsuite/icons/BarChart';
import DocPass from '@rsuite/icons/DocPass';
import InfoOutline from '@rsuite/icons/InfoOutline';
import GlobalIcon from '@rsuite/icons/Global';
import AdminIcon from '@rsuite/icons/Admin';
import PeoplesIcon from '@rsuite/icons/Peoples';
import UserBadgeIcon from '@rsuite/icons/UserBadge';
import ExitIcon from '@rsuite/icons/Exit';
import { CgDarkMode } from 'react-icons/cg';

import translations from '../../translations/translations.json';
import { storeCurrentTeam, storeTeams, storeTeamsError } from '../../redux/teamActions';
import { storeEnvironments } from '../../redux/environmentActions';
import { clearCurrentErrorMessage, clearCurrentInfoMessage, clearCurrentLoaderMessage } from '../../redux/notificationActions';

// Resolved from the runtime config injected by the server layout, so the API
// URL can be changed per-deployment without rebuilding the image.
axios.defaults.baseURL = getAnglesApiUrl();
axios.defaults.withCredentials = true;

const Shell = function (props) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const router = useRouter();

    // Re-resolve on the client: the module-scope assignment above also runs
    // during SSR, where `window.__ANGLES_CONFIG__` does not exist yet.
    axios.defaults.baseURL = getAnglesApiUrl();

    const teamRequests = new TeamRequests(axios);
    const environmentRequests = new EnvironmentRequests(axios);
    const [expand, setExpand] = useState(true);
    const { user, logout, isLoading } = useAuth();
    const intl = useIntl();

    const {
        teams,
        currentTeam,
        saveTeams,
        saveCurrentTeam,
        saveTeamsError,
        saveEnvironments,
        currentErrorMessage,
        clearErrorMessage,
        currentInfoMessage,
        clearInfoMessage,
        currentLoaderMessage,
        clearLoaderMessage,
        children
    } = props;

    useEffect(() => {
        // Determine expand state on mount to avoid hydration mismatch
        const cookieExpand = Cookies.get('expand');
        setExpand(cookieExpand === undefined || cookieExpand === 'true');
    }, []);

    const getTeam = (teamId) => {
        if (teams && Array.isArray(teams)) {
            return teams.find((team) => team._id === teamId);
        }
        return undefined;
    };

    const changeCurrentTeam = (teamId) => {
        if (teamId !== undefined) {
            saveCurrentTeam(getTeam(teamId));
            Cookies.set('teamId', teamId, { expires: 365 });
        }
    };

    const retrieveTeamDetails = () => {
        teamRequests.getTeams()
            .then((retrievedTeams) => {
                retrievedTeams.sort((a, b) => {
                    if (a.name < b.name) { return -1; }
                    if (a.name > b.name) { return 1; }
                    return 0;
                });
                saveTeams(retrievedTeams);
            })
            .catch((teamsErrorMessage) => {
                saveTeamsError(teamsErrorMessage);
            });
    };

    const retrieveEnvironmentDetails = () => {
        environmentRequests.getEnvironments()
            .then((retrievedEnvironments) => {
                retrievedEnvironments.sort((a, b) => {
                    if (a.name < b.name) { return -1; }
                    if (a.name > b.name) { return 1; }
                    return 0;
                });
                saveEnvironments(retrievedEnvironments);
            });
    };

    const closeErrorModal = () => {
        clearErrorMessage();
    };

    const closeInfoModal = () => {
        clearInfoMessage();
    };

    const closeLoaderModal = () => {
        clearLoaderMessage();
    };

    useEffect(() => {
        if (!isLoading && !user && pathname !== '/login') {
            router.push('/login');
        }
    }, [user, isLoading, pathname, router]);

    useEffect(() => {
        if (user) {
            retrieveEnvironmentDetails();
            retrieveTeamDetails();
        }
    }, [user]);

    useEffect(() => {
        // Handle query params manually since we don't have location.search directly in typical way
        const teamId = searchParams.get('teamId');
        if (teamId) {
            if (!currentTeam || teamId !== currentTeam._id) {
                changeCurrentTeam(teamId);
            }
        } else if (Cookies.get('teamId')) {
            if (!currentTeam || Cookies.get('teamId') !== currentTeam._id) {
                changeCurrentTeam(Cookies.get('teamId'));
            }
        } else if (teams && teams.length > 0) {
            changeCurrentTeam(teams[0]._id);
        }
    }, [teams, currentTeam, searchParams]);

    const setLanguage = (languageCode) => {
        Cookies.set('language', languageCode);
        window.location.reload(); // Force reload to apply language change
    };

    const setTheme = (theme) => {
        const rootElement = document.documentElement;
        rootElement.setAttribute('data-theme', theme);
        Cookies.set('theme', theme);
    };

    const toggleMenu = () => {
        Cookies.set('expand', !expand, { expires: 365 });
        setExpand(!expand);
    };

    return (
        <Container>
            {user && (
                <Sidebar
                    className="main-sidebar"
                    width={expand ? 240 : 56}
                    collapsible
                >
                    <div className="main-sidebar-inner">
                    <Affix
                        top={25}
                    >
                        <Sidenav expanded={expand} defaultOpenKeys={['3']} appearance="subtle">
                            <Sidenav.Header>
                                <Link href="/">
                                    <div className="sidebar-header">
                                        <img src="/assets/angles-icon.png" alt="Angles" className="brand-logo-icon" />
                                        <img src="/assets/angles-text-logo.png" alt="Angles" className="brand-logo-text" />
                                    </div>
                                </Link>
                            </Sidenav.Header>
                            <Sidenav.Body>
                                <Nav activeKey={pathname}>
                                    <Nav.Item as={Link} eventKey="1" icon={<DocPass className="nav-item-icon" />} href="/">
                                        <span>
                                            <FormattedMessage
                                                id="nav.dashboard"
                                            />
                                        </span>
                                    </Nav.Item>
                                    <Nav.Item as={Link} eventKey="2" icon={<BarChart className="nav-item-icon" />} href="/metrics">
                                        <span>
                                            <FormattedMessage
                                                id="nav.execution-metrics"
                                            />
                                        </span>
                                    </Nav.Item>
                                    <Nav.Item as={Link} eventKey="3" icon={<Image className="nav-item-icon" />} href="/screenshot-library">
                                        <span>
                                            <FormattedMessage
                                                id="nav.screenshot-library"
                                            />
                                        </span>
                                    </Nav.Item>
                                    {user && (user.userType === 'admin' || user.userType === 'team_lead') && (
                                        <Nav.Item as={Link} eventKey="8" icon={<PeoplesIcon className="nav-item-icon" />} href="/team-settings">
                                            <span>
                                                <FormattedMessage
                                                    id="nav.team-settings"
                                                />
                                            </span>
                                        </Nav.Item>
                                    )}
                                    {user && user.userType === 'admin' && (
                                        <Nav.Menu eventKey="7" icon={<AdminIcon className="nav-item-icon" />} title={<FormattedMessage id="nav.admin" />}>
                                            <Nav.Item as={Link} eventKey="7-1" href="/admin/users"><FormattedMessage id="nav.admin.users" /></Nav.Item>
                                            <Nav.Item as={Link} eventKey="7-2" href="/admin/settings"><FormattedMessage id="nav.admin.settings" /></Nav.Item>
                                        </Nav.Menu>
                                    )}
                                    <Nav.Item as={Link} eventKey="6" icon={<InfoOutline className="nav-item-icon" />} href="/about">
                                        <span>
                                            <FormattedMessage
                                                id="nav.about"
                                            />
                                        </span>
                                    </Nav.Item>
                                </Nav>
                            </Sidenav.Body>
                            <Navbar appearance="subtle" className="nav-toggle">
                                <Nav pullRight>
                                    <Nav.Item className="nav-toggle-item" onClick={() => toggleMenu()}>
                                        {expand ? <AngleLeftIcon /> : <AngleRightIcon />}
                                    </Nav.Item>
                                </Nav>
                            </Navbar>
                        </Sidenav>
                    </Affix>
                    </div>
                </Sidebar>
            )}
            <Container className="main-container">
                <Header>
                    <Navbar appearance="subtle" className="header-navbar">
                        <Nav pullRight>
                            <Nav.Menu eventKey="4" icon={<GlobalIcon className="nav-item-icon" />} title={<FormattedMessage id="nav.language" />}>
                                {translations.map((translation, index) => (<Nav.Item key={index} eventKey={`4-${index}`} onClick={() => setLanguage(translation.code)}>{translation.text}</Nav.Item>))}
                            </Nav.Menu>
                            <Nav.Menu eventKey="5" icon={<CgDarkMode />} title={<FormattedMessage id="nav.theme" />}>
                                <Nav.Item eventKey="5-1" onClick={() => setTheme('light')}><FormattedMessage id="nav.theme.light" /></Nav.Item>
                                <Nav.Item eventKey="5-2" onClick={() => setTheme('dark')}><FormattedMessage id="nav.theme.dark" /></Nav.Item>
                            </Nav.Menu>
                            {user && (
                                <Nav.Menu eventKey="0" icon={<UserBadgeIcon className="nav-item-icon" />} title={user.username || intl.formatMessage({ id: 'nav.profile' })}>
                                    <Nav.Item as={Link} eventKey="0-1" href="/user-settings">
                                        <FormattedMessage id="nav.user-settings" />
                                    </Nav.Item>
                                    <Nav.Item eventKey="0-2" onClick={logout} icon={<ExitIcon className="nav-item-icon" />}>
                                        <FormattedMessage id="nav.logout" />
                                    </Nav.Item>
                                </Nav.Menu>
                            )}
                        </Nav>
                    </Navbar>
                </Header>
                <Content className="main-content">
                    <main>
                        {
                            (currentErrorMessage ? (
                                <Modal
                                    open={(currentErrorMessage !== undefined)}
                                    onClose={closeErrorModal}
                                    className="error-modal"
                                >
                                    <Modal.Header>
                                        <Modal.Title>
                                            <span>{currentErrorMessage.title}</span>
                                        </Modal.Title>
                                    </Modal.Header>
                                    <Modal.Body>
                                        {currentErrorMessage.body}
                                    </Modal.Body>
                                    <Modal.Footer>
                                        {
                                            (currentErrorMessage.actions !== undefined ? (
                                                currentErrorMessage.actions.map((action, idx) => (
                                                    <Button key={idx} className="btn-primary" onClick={action.method}>
                                                        {action.text}
                                                    </Button>
                                                ))
                                            ) : null)
                                        }
                                        <Button className="btn-primary" onClick={closeErrorModal}><FormattedMessage id="common.button.ok" /></Button>
                                    </Modal.Footer>
                                </Modal>
                            ) : null)
                        }
                        {
                            (currentInfoMessage ? (
                                <Modal
                                    open={(currentInfoMessage !== undefined)}
                                    onClose={closeInfoModal}
                                    className="info-modal"
                                >
                                    <Modal.Header>
                                        <Modal.Title>
                                            <span>{currentInfoMessage.title}</span>
                                        </Modal.Title>
                                    </Modal.Header>
                                    <Modal.Body>
                                        {currentInfoMessage.body}
                                    </Modal.Body>
                                    <Modal.Footer>
                                        {
                                            (currentInfoMessage.actions !== undefined ? (
                                                currentInfoMessage.actions.map((action, idx) => (
                                                    <Button key={idx} className="btn-primary" onClick={action.method}>
                                                        {action.text}
                                                    </Button>
                                                ))
                                            ) : null)
                                        }
                                        <Button className="btn-primary" onClick={closeInfoModal}><FormattedMessage id="common.button.ok" /></Button>
                                    </Modal.Footer>
                                </Modal>
                            ) : null)
                        }
                        {
                            (currentLoaderMessage ? (
                                <Modal
                                    open={(currentLoaderMessage !== undefined)}
                                    className="info-modal"
                                    onClose={closeLoaderModal}
                                >
                                    <Modal.Header>
                                        <Modal.Title>
                                            <Loader />
                                            <span>{currentLoaderMessage.title}</span>
                                        </Modal.Title>
                                    </Modal.Header>
                                    <Modal.Body>
                                        {currentLoaderMessage.body}
                                    </Modal.Body>
                                </Modal>
                            ) : null)
                        }
                        {children}
                    </main>
                </Content>
            </Container>
        </Container>
    );
};

const mapDispatchToProps = (dispatch) => ({
    saveCurrentTeam: (selectedTeam) => dispatch(storeCurrentTeam(selectedTeam)),
    saveTeams: (teams) => dispatch(storeTeams(teams)),
    saveTeamsError: (teamsError) => dispatch(storeTeamsError(teamsError)),
    saveEnvironments: (environments) => dispatch(storeEnvironments(environments)),
    clearErrorMessage: () => dispatch(clearCurrentErrorMessage()),
    clearInfoMessage: () => dispatch(clearCurrentInfoMessage()),
    clearLoaderMessage: () => dispatch(clearCurrentLoaderMessage()),
});

const mapStateToProps = (state) => ({
    currentTeam: state.teamsReducer.currentTeam,
    teams: state.teamsReducer.teams,
    teamsError: state.teamsReducer.teamsError,
    environments: state.environmentsReducer.environments,
    currentErrorMessage: state.notificationReducer.currentErrorMessage,
    currentInfoMessage: state.notificationReducer.currentInfoMessage,
    currentLoaderMessage: state.notificationReducer.currentLoaderMessage,
});

export default connect(mapStateToProps, mapDispatchToProps)(Shell);
