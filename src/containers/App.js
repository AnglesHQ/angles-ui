import React, { Component } from 'react';
import { Route, Switch, withRouter } from 'react-router-dom';
import axios from 'axios';
import queryString from 'query-string';
import Cookies from 'js-cookie';
import { connect } from 'react-redux';
import { EnvironmentRequests, TeamRequests } from 'angles-javascript-client';
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

axios.defaults.baseURL = `${process.env.REACT_APP_ANGLES_API_URL}/rest/api/v1.0`;

class App extends Component {
  cookies;

  constructor(props) {
    super(props);
    this.state = {
      // moved to redux.
    };
    this.teamRequests = new TeamRequests(axios);
    this.environmentRequests = new EnvironmentRequests(axios);
  }

  componentDidMount = () => {
    this.retrieveTeamDetails();
    this.retrieveEnvironmentDetails();
  }

  componentDidUpdate(prevProps) {
    const { teams, currentTeam, location } = this.props;
    if (prevProps.teams !== teams || prevProps.currentTeam !== currentTeam) {
      const query = queryString.parse(location.search);
      // check if there is a query
      if (query.teamId) {
        if (!currentTeam || query.teamId !== currentTeam._id) {
          this.changeCurrentTeam(query.teamId);
        }
      } else if (Cookies.get('teamId')) {
        // if cookie is provided
        if (!currentTeam || Cookies.get('teamId') !== currentTeam._id) {
          this.changeCurrentTeam(Cookies.get('teamId'));
        }
      } else if (teams.length > 0) {
        // set team to be the first team
        this.changeCurrentTeam(teams[0]._id);
      }
    }
  }

  getTeam = (teamId) => {
    const { teams } = this.props;
    return teams.find((team) => team._id === teamId);
  }

  changeCurrentTeam = (teamId) => {
    const { saveCurrentTeam } = this.props;
    if (teamId !== undefined) {
      saveCurrentTeam(this.getTeam(teamId));
      Cookies.set('teamId', teamId, { expires: 365 });
    }
  }

  retrieveTeamDetails = () => {
    const { saveTeams, saveTeamsError } = this.props;
    this.teamRequests.getTeams()
      .then((teams) => {
        // TODO: should probably do this in the back-end.
        teams.sort((a, b) => {
          if (a.name < b.name) { return -1; }
          if (a.name > b.name) { return 1; }
          return 0;
        });
        saveTeams(teams);
      })
      .catch((teamsError) => {
        saveTeamsError(teamsError);
      });
  }

  retrieveEnvironmentDetails = () => {
    const { saveEnvironments } = this.props;
    this.environmentRequests.getEnvironments()
      .then((environments) => {
        environments.sort((a, b) => {
          if (a.name < b.name) { return -1; }
          if (a.name > b.name) { return 1; }
          return 0;
        });
        saveEnvironments(environments);
      });
    // TODO: handle catch.
  }

  render() {
    const {
      history,
      teams,
      currentTeam,
      teamsError,
      environments,
    } = this.props;
    return (
      <div id="outer-container">
        <AnglesMenu />
        <main id="page-wrap">
          <Switch>
            <Route
              exact
              path="/"
              render={() => {
                if (teamsError) {
                  return (
                    <div key="retrieving-teams-error" className="alert alert-danger" role="alert">
                      <span>
                        <i className="fas fa-exclamation" />
                        <span className="teams-error-message">
                          {`Something went wrong [${teamsError}]`}
                        </span>
                      </span>
                    </div>
                  );
                }
                if (!teamsError && teams === undefined) {
                  return (
                    <div key="retrieving-teams" className="alert alert-primary" role="alert">
                      <span>
                        <i className="fas fa-spinner fa-pulse fa-2x" />
                        <span>Retrieving teams</span>
                      </span>
                    </div>
                  );
                }
                if (!environments) {
                  return (
                    <div key="retrieving-environments" className="alert alert-primary" role="alert">
                      <span>
                        <i className="fas fa-spinner fa-pulse fa-2x" />
                        <span>Retrieving environments</span>
                      </span>
                    </div>
                  );
                }
                return (
                  <SummaryPage
                    history={history}
                    changeCurrentTeam={this.changeCurrentTeam}
                  />
                );
              }}
            />
            <Route exact path="/build/" render={() => <BuildPage />} />
            <Route
              exact
              path="/matrix/"
              render={() => {
                if (!currentTeam || !currentTeam._id) {
                  return null;
                }
                return <MatrixPage currentTeam={currentTeam} />;
              }}
            />
            <Route exact path="/screenshot-finder/" render={() => <ScreenshotLibraryPage />} />
            <Route exact path="/screenshot-library/" render={() => <ScreenshotLibraryPage />} />
            <Route exact path="/history/" render={() => <ExecutionHistoryPage />} />
            <Route exact path="/about/" render={() => <AboutPage />} />
            <Route
              exact
              path="/metrics/"
              render={() => {
                if (currentTeam === undefined || !currentTeam._id) {
                  return <div>Please select a team</div>;
                }
                return (
                  <MetricsPage
                    currentTeam={currentTeam}
                    teams={teams}
                    changeCurrentTeam={this.changeCurrentTeam}
                  />
                );
              }}
            />
            <Route render={() => <NotFoundPage />} />
          </Switch>
        </main>
      </div>
    );
  }
}

const mapDispatchToProps = (dispatch) => ({
  saveCurrentTeam: (selectedTeam) => dispatch(storeCurrentTeam(selectedTeam)),
  saveTeams: (teams) => dispatch(storeTeams(teams)),
  saveTeamsError: (teamsError) => dispatch(storeTeamsError(teamsError)),
  saveEnvironments: (environments) => dispatch(storeEnvironments(environments)),
});

const mapStateToProps = (state) => ({
  currentTeam: state.teamsReducer.currentTeam,
  teams: state.teamsReducer.teams,
  teamsError: state.teamsReducer.teamsError,
  environments: state.environmentsReducer.environments,
});
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(App));
