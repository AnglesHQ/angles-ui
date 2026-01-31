'use client';

import React, { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import queryString from 'query-string';
import Cookies from 'js-cookie';
import { connect } from 'react-redux';
import { EnvironmentRequests, TeamRequests } from 'angles-javascript-client';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

import {
    Container,
    Sidebar,
    Sidenav,
    Content,
    Navbar,
    Nav, Affix,
} from 'rsuite';
import AngleLeftIcon from '@rsuite/icons/legacy/AngleLeft';
import AngleRightIcon from '@rsuite/icons/legacy/AngleRight';
import Image from '@rsuite/icons/Image';
import BarChart from '@rsuite/icons/BarChart';
import DocPass from '@rsuite/icons/DocPass';
import InfoOutline from '@rsuite/icons/InfoOutline';
import GlobalIcon from '@rsuite/icons/Global';
import { CgDarkMode } from 'react-icons/cg';

import translations from '../translations/translations.json';
import { storeCurrentTeam, storeTeams, storeTeamsError } from '../redux/teamActions';
import { storeEnvironments } from '../redux/environmentActions';
import { clearCurrentErrorMessage, clearCurrentInfoMessage, clearCurrentLoaderMessage } from '../redux/notificationActions';

axios.defaults.baseURL = process.env.NEXT_PUBLIC_ANGLES_API_URL || 'http://localhost:3000/rest/api/v1.0';

const Shell = function (props) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const router = useRouter();

    const teamRequests = new TeamRequests(axios);
    const environmentRequests = new EnvironmentRequests(axios);
    const [expand, setExpand] = useState(true);

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
        retrieveEnvironmentDetails();
        retrieveTeamDetails();
    }, []);

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
            <Sidebar
                className="main-sidebar"
                width={expand ? 240 : 56}
                collapsible
            >
                <Affix
                    top={25}
                >
                    <Sidenav expanded={expand} defaultOpenKeys={['3']} appearance="subtle">
                        <Sidenav.Header>
                            <a href="/">
                                <div className="sidebar-header">
                                    <img src="/assets/angles-icon.png" alt="Angles" className="sidebar-angles-icon" />
                                    <img src="/assets/angles-text-logo.png" alt="Angles" className="sidebar-angles-text-icon" />
                                </div>
                            </a>
                        </Sidenav.Header>
                        <Sidenav.Body>
                            <Nav activeKey={pathname}>
                                <Nav.Item eventKey="1" icon={<DocPass style={{ fontSize: '20px', height: '20px' }} />} href="/">
                                    <span>
                                        <FormattedMessage
                                            id="nav.dashboard"
                                        />
                                    </span>
                                </Nav.Item>
                                <Nav.Item eventKey="2" icon={<BarChart style={{ fontSize: '20px', height: '20px' }} />} href="/metrics">
                                    <span>
                                        <FormattedMessage
                                            id="nav.execution-metrics"
                                        />
                                    </span>
                                </Nav.Item>
                                <Nav.Item eventKey="3" icon={<Image style={{ fontSize: '20px', height: '20px' }} />} href="/screenshot-library">
                                    <span>
                                        <FormattedMessage
                                            id="nav.screenshot-library"
                                        />
                                    </span>
                                </Nav.Item>
                                <Nav.Menu eventKey="4" icon={<GlobalIcon style={{ fontSize: '20px', height: '20px' }} />} title={<FormattedMessage id="nav.language" />}>
                                    {translations.map((translation, index) => (<Nav.Item key={index} eventKey={`4-${index}`} onClick={() => setLanguage(translation.code)}>{translation.text}</Nav.Item>))}
                                </Nav.Menu>
                                <Nav.Menu eventKey="5" icon={<CgDarkMode />} title={<FormattedMessage id="nav.theme" />}>
                                    <Nav.Item eventKey="5-1" onClick={() => setTheme('light')}><FormattedMessage id="nav.theme.light" /></Nav.Item>
                                    <Nav.Item eventKey="5-2" onClick={() => setTheme('dark')}><FormattedMessage id="nav.theme.dark" /></Nav.Item>
                                </Nav.Menu>
                                <Nav.Item eventKey="6" icon={<InfoOutline style={{ fontSize: '20px', height: '20px' }} />} href="/about">
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
                                <Nav.Item style={{ width: 56, textAlign: 'center' }} onClick={() => toggleMenu()}>
                                    {expand ? <AngleLeftIcon /> : <AngleRightIcon />}
                                </Nav.Item>
                            </Nav>
                        </Navbar>
                    </Sidenav>
                </Affix>
            </Sidebar>
            <Container className="main-container">
                <Content className="main-content">
                    <main>
                        {
                            (currentErrorMessage ? (
                                <Modal
                                    show={(currentErrorMessage !== undefined)}
                                    onHide={closeErrorModal}
                                    dialogClassName="error-modal"
                                    centered
                                >
                                    <Modal.Header closeButton>
                                        <Modal.Title>
                                            <i className="fa fa-exclamation" aria-hidden="true" />
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
                                                    <Button key={idx} className="error-button" onClick={action.method}>
                                                        {action.text}
                                                    </Button>
                                                ))
                                            ) : null)
                                        }
                                        <Button className="error-button" onClick={closeErrorModal}>OK</Button>
                                    </Modal.Footer>
                                </Modal>
                            ) : null)
                        }
                        {
                            (currentInfoMessage ? (
                                <Modal
                                    show={(currentInfoMessage !== undefined)}
                                    onHide={closeInfoModal}
                                    dialogClassName="info-modal"
                                    centered
                                >
                                    <Modal.Header closeButton>
                                        <Modal.Title>
                                            <i className="fa fa-info" aria-hidden="true" />
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
                                                    <Button key={idx} onClick={action.method}>
                                                        {action.text}
                                                    </Button>
                                                ))
                                            ) : null)
                                        }
                                        <Button onClick={closeInfoModal}>OK</Button>
                                    </Modal.Footer>
                                </Modal>
                            ) : null)
                        }
                        {
                            (currentLoaderMessage ? (
                                <Modal
                                    show={(currentLoaderMessage !== undefined)}
                                    dialogClassName="info-modal"
                                    onHide={closeLoaderModal}
                                    centered
                                >
                                    <Modal.Header closeButton>
                                        <Modal.Title>
                                            <i className="fas fa-spinner fa-pulse fa-2x" />
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
