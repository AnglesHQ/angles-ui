import React, { useEffect } from 'react';
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
import AnglesMenu from '../components/menu/AnglesMenu';
import SummaryPage from '../components/pages/SummaryPage';
import BuildPage from '../components/pages/BuildPage';
import MatrixPage from '../components/pages/MatrixPage';
import ScreenshotLibraryPage from '../components/pages/ScreenshotLibraryPage';
import ExecutionHistoryPage from '../components/pages/ExecutionHistoryPage';
import AboutPage from '../components/pages/AboutPage';
import NotFoundPage from '../components/pages/NotFoundPage';
import './App.css';
import '../components/charts/Charts.css';
import MetricsPage from '../components/pages/MetricsPage';
import { storeCurrentTeam, storeTeams, storeTeamsError } from '../redux/teamActions';
import { storeEnvironments } from '../redux/environmentActions';
import { clearCurrentErrorMessage, clearCurrentInfoMessage, clearCurrentLoaderMessage } from '../redux/notificationActions';

axios.defaults.baseURL = `${process.env.REACT_APP_ANGLES_API_URL}/rest/api/v1.0`;

const App = function (props) {
  const location = useLocation();
  const teamRequests = new TeamRequests(axios);
  const environmentRequests = new EnvironmentRequests(axios);
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

  return (
    <div id="outer-container">
      <AnglesMenu />
      <main id="page-wrap">
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
                      {`Something went wrong [${teamsError}]`}
                    </span>
                  </span>
                </div>
              ) : (
                (!teamsError && teams === undefined) ? (
                  <div key="retrieving-teams" className="alert alert-primary" role="alert">
                    <span>
                      <i className="fas fa-spinner fa-pulse fa-2x" />
                      <span>Retrieving teams</span>
                    </span>
                  </div>
                ) : (
                  <SummaryPage changeCurrentTeam={changeCurrentTeam} />
                )
              )
             }
          />
          <Route path="/build/" element={<BuildPage />} exact />
          <Route
            exact
            path="/matrix/"
            element={
              (!currentTeam || !currentTeam._id) ? (
                null
              ) : (
                <MatrixPage currentTeam={currentTeam} />
              )
            }
          />
          <Route exact path="/screenshot-finder/" element={<ScreenshotLibraryPage />} />
          <Route exact path="/screenshot-library/" element={<ScreenshotLibraryPage />} />
          <Route exact path="/history/" element={<ExecutionHistoryPage />} />
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
          <Route render={() => <NotFoundPage />} />
        </Routes>
      </main>
    </div>
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
