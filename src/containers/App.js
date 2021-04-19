import React, { Component } from 'react';
import { Route, Switch, withRouter } from 'react-router-dom';
import axios from 'axios';
import queryString from 'query-string';
import Cookies from 'js-cookie';
import { EnvironmentRequests, TeamRequests } from 'angles-javascript-client';
import AnglesMenu from '../components/menu/AnglesMenu';
import SummaryPage from '../components/pages/SummaryPage';
import BuildPage from '../components/pages/BuildPage';
import MatrixPage from '../components/pages/MatrixPage';
import ScreenshotFinderPage from '../components/pages/ScreenshotFinderPage';
import ExecutionHistoryPage from '../components/pages/ExecutionHistoryPage';
import AboutPage from '../components/pages/AboutPage';
import NotFoundPage from '../components/pages/NotFoundPage';
import './App.css';
import '../components/charts/Charts.css';

axios.defaults.baseURL = `${process.env.REACT_APP_ANGLES_API_URL}/rest/api/v1.0`;

class App extends Component {
  cookies;

  constructor(props) {
    super(props);
    this.state = {
      teams: [],
      environments: [],
      currentTeam: { name: 'No team selected' },
    };
    this.teamRequests = new TeamRequests(axios);
    this.environmentRequests = new EnvironmentRequests(axios);
  }

  componentDidMount = () => {
    this.retrieveTeamDetails();
    this.retrieveEnvironmentDetails();
  }

  componentDidUpdate(prevProps, prevState) {
    const { teams, currentTeam } = this.state;
    if (prevState.teams !== teams || prevState.currenTeam !== currentTeam) {
      const { location } = this.props;
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
      }
    }
  }

  getTeam = (teamId) => {
    const { teams } = this.state;
    return teams.find((team) => team._id === teamId);
  }

  changeCurrentTeam = (teamId) => {
    if (teamId !== undefined) {
      this.setState({ currentTeam: this.getTeam(teamId) });
      Cookies.set('teamId', teamId, { expires: 365 });
    }
  }

  retrieveTeamDetails = () => {
    this.teamRequests.getTeams()
      .then((teams) => {
        teams.sort((a, b) => {
          if (a.name < b.name) { return -1; }
          if (a.name > b.name) { return 1; }
          return 0;
        });
        this.setState({ teams });
      });
    // TODO: handle catch
  }

  retrieveEnvironmentDetails = () => {
    this.environmentRequests.getEnvironments()
      .then((environments) => {
        environments.sort((a, b) => {
          if (a.name < b.name) { return -1; }
          if (a.name > b.name) { return 1; }
          return 0;
        });
        this.setState({ environments });
      });
    // TODO: hanlde catch.
  }

  render() {
    const { teams, currentTeam, environments } = this.state;
    const { history } = this.props;
    return (
      <div id="outer-container">
        <AnglesMenu teams={teams} changeCurrentTeam={this.changeCurrentTeam} />
        <main id="page-wrap">
          <Switch>
            <Route
              exact
              path="/"
              render={() => {
                if (currentTeam === undefined || !currentTeam._id) {
                  return <div>Please select a team</div>;
                }
                return (
                  <SummaryPage
                    currentTeam={currentTeam}
                    environments={environments}
                    history={history}
                  />
                );
              }}
            />
            <Route exact path="/build/" render={() => <BuildPage />} />
            <Route
              exact
              path="/matrix/"
              render={() => {
                if (!currentTeam._id) {
                  return null;
                }
                return <MatrixPage currentTeam={currentTeam} />;
              }}
            />
            <Route exact path="/screenshot-finder/" render={() => <ScreenshotFinderPage />} />
            <Route exact path="/history/" render={() => <ExecutionHistoryPage />} />
            <Route exact path="/about/" render={() => <AboutPage />} />
            <Route render={() => <NotFoundPage />} />
          </Switch>
        </main>
      </div>
    );
  }
}

export default withRouter(App);
