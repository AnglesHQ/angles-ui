import React, { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import {
  Routes,
  Route,
  useLocation,
} from 'react-router-dom';
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
import SummaryPage from '../components/pages/dashboard';
import TestRunDetailsPage from '../components/pages/test-run';
import TestRunsComparePage from '../components/pages/test-run-compare';
import ScreenshotLibraryPage from '../components/pages/screenshot-library';
import ExecutionHistoryPage from '../components/pages/test-execution-history';
import AboutPage from '../components/pages/about';
import NotFoundPage from '../components/pages/not-found';

import MetricsPage from '../components/pages/metrics';
import { storeCurrentTeam, storeTeams, storeTeamsError } from '../redux/teamActions';
import { storeEnvironments } from '../redux/environmentActions';
import { clearCurrentErrorMessage, clearCurrentInfoMessage, clearCurrentLoaderMessage } from '../redux/notificationActions';
import { CurrentScreenshotProvider } from '../context/CurrentScreenshotContext';

import '../styles/index.less';

axios.defaults.baseURL = `${process.env.REACT_APP_ANGLES_API_URL}/rest/api/v1.0`;

const App = function (props) {
  const location = useLocation();
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
    teamsError,
    currentErrorMessage,
    clearErrorMessage,
    currentInfoMessage,
    clearInfoMessage,
    currentLoaderMessage,
    clearLoaderMessage,
  } = props;

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
        // TODO: should probably do this in the back-end.
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
    // TODO: handle catch.
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
    const query = queryString.parse(location.search);
    // check if there is a query
    if (query.teamId) {
      if (!currentTeam || query.teamId !== currentTeam._id) {
        changeCurrentTeam(query.teamId);
      }
    } else if (Cookies.get('teamId')) {
      // if cookie is provided
      if (!currentTeam || Cookies.get('teamId') !== currentTeam._id) {
        changeCurrentTeam(Cookies.get('teamId'));
      }
    } else if (teams.length > 0) {
      // set team to be the first team
      changeCurrentTeam(teams[0]._id);
    }
  }, [teams, currentTeam]);

  const setLanguage = (languageCode) => {
    Cookies.set('language', languageCode);
  };

  const setTheme = (theme) => {
    const rootElement = document.documentElement;
    rootElement.setAttribute('data-theme', theme);
    Cookies.set('theme', theme);
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
              <div className="sidebar-header">
                <img src="../assets/angles-icon.png" alt="Angles" className="sidebar-angles-icon" />
                <img src="../assets/angles-text-logo.png" alt="Angles" className="sidebar-angles-text-icon" />
              </div>
            </Sidenav.Header>
            <Sidenav.Body>
              <Nav>
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
                  <Nav.Item eventKey="4-1" onClick={() => setLanguage('en')} href="/">English</Nav.Item>
                  <Nav.Item eventKey="4-2" onClick={() => setLanguage('nl')} href="/">Nederlands</Nav.Item>
                  <Nav.Item eventKey="4-2" onClick={() => setLanguage('test')} href="/">Test</Nav.Item>
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
                <Nav.Item style={{ width: 56, textAlign: 'center' }} onClick={() => setExpand(!expand)}>
                  {expand ? <AngleLeftIcon /> : <AngleRightIcon />}
                </Nav.Item>
              </Nav>
            </Navbar>
          </Sidenav>
        </Affix>
      </Sidebar>
      <Container>
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
                        currentErrorMessage.actions.map((action) => (
                          <Button className="error-button" onClick={action.method}>
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
                        currentInfoMessage.actions.map((action) => (
                          <Button onClick={action.method}>
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
            <Routes>
              <Route
                exact
                path="/"
                element={
                  // eslint-disable-next-line no-nested-ternary
                  (teamsError) ? (
                    <div key="retrieving-teams-error" className="alert alert-danger" role="alert">
                      <span>
                        <i className="fas fa-exclamation" />
                        <span className="teams-error-message">
                          <FormattedMessage
                            id="app.retrieving-teams-error"
                            values={{ teamsError }}
                          />
                        </span>
                      </span>
                    </div>
                  ) : (
                    (!teamsError && teams === undefined) ? (
                      <div key="retrieving-teams" className="alert alert-primary" role="alert">
                        <span>
                          <i className="fas fa-spinner fa-pulse fa-2x" />
                          <span>
                            <FormattedMessage
                              id="app.retrieving-teams"
                            />
                          </span>
                        </span>
                      </div>
                    ) : (
                      <SummaryPage changeCurrentTeam={changeCurrentTeam} />
                    )
                  )
                }
              />
              <Route
                exact
                path="/test-run/"
                element={(
                  <CurrentScreenshotProvider>
                    <TestRunDetailsPage />
                  </CurrentScreenshotProvider>
                )}
              />
              <Route
                exact
                path="/test-runs-compare/"
                element={
                  (!currentTeam || !currentTeam._id) ? (
                    null
                  ) : (
                    <TestRunsComparePage currentTeam={currentTeam} />
                  )
                }
              />
              <Route
                exact
                path="/screenshot-library/"
                element={(
                  <CurrentScreenshotProvider>
                    <ScreenshotLibraryPage />
                  </CurrentScreenshotProvider>
                )}
              />
              <Route
                exact
                path="/test-execution-history/"
                element={(
                  <CurrentScreenshotProvider>
                    <ExecutionHistoryPage />
                  </CurrentScreenshotProvider>
                )}
              />
              <Route exact path="/about/" element={<AboutPage />} />
              <Route
                exact
                path="/metrics/"
                element={
                  (currentTeam === undefined || !currentTeam._id) ? (
                    <div>Please select a team</div>
                  ) : (
                    <MetricsPage
                      currentTeam={currentTeam}
                      teams={teams}
                      changeCurrentTeam={changeCurrentTeam}
                    />
                  )
                }
              />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
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
export default connect(mapStateToProps, mapDispatchToProps)(App);
