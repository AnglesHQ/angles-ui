import React, { Component } from 'react'
import { Route, Switch } from 'react-router-dom'
import axios from 'axios';
import AnglesMenu from '../components/menu/AnglesMenu';
import SummaryPage from '../components/pages/SummaryPage'
import BuildPage from '../components/pages/BuildPage'
import MatrixPage from '../components/pages/MatrixPage'
import ScreenshotFinderPage from '../components/pages/ScreenshotFinderPage'
import { withRouter} from 'react-router-dom';
import queryString from 'query-string';
import './App.css';
import '../components/charts/Charts.css'
import Cookies from 'js-cookie';

axios.defaults.baseURL = process.env.REACT_APP_ANGLES_API_URL + '/rest/api/v1.0';

class App extends Component {

  cookies;

  constructor(props) {
    super(props);
    this.state = {
      teams: [],
      currentTeam: {name: 'No team selected'}
    };
  }

  getTeam = (teamId) => {
    return this.state.teams.find(team => team._id === teamId);
  }

  changeCurrentTeam = (teamId) => {
    if (teamId !== undefined) {
      this.setState({currentTeam: this.getTeam(teamId)});
      Cookies.set('teamId', teamId, { expires: 365 });
    }
  }

  componentDidUpdate() {
    let query = queryString.parse(this.props.location.search)
    if (this.state.teams !== [] && this.state.currentTeam) {
      // check if there is a query
      if (query.teamId) {
        // if query is provided and it's not the current team change team.
        if (query.teamId !== this.state.currentTeam._id){
          this.changeCurrentTeam(query.teamId);
        }
      } else if (Cookies.get('teamId')) {
        // if cookie is provided
        if (Cookies.get('teamId') !== this.state.currentTeam._id) {
          this.changeCurrentTeam(Cookies.get('teamId'));
        }
      }
    }
  }

  componentDidMount() {
    axios.get('/team')
    .then(res => res.data)
    .then((data) => {
      // set retrieve teams in state
      this.setState({ teams: data });
    })
    .catch(console.log);
  }

  render() {
    return (
      <div id="outer-container">
        <AnglesMenu teams={this.state.teams} changeCurrentTeam={this.changeCurrentTeam.bind(this)}/>
        <main id="page-wrap">
          <Switch>
            <Route exact path="/" render={props => {
              if (this.state.currentTeam === undefined || !this.state.currentTeam._id) {
                return <div>Please select a team</div>;
              }
              return <SummaryPage {...props} currentTeam={this.state.currentTeam} changeCurrentTeam={this.changeCurrentTeam.bind(this)} />
            }} />
            <Route exact path="/build/" render={props => { return <BuildPage {...props} /> }} />
            <Route exact path="/matrix/" render={props => {
              if (!this.state.currentTeam._id) {
                return null;
              }
              return <MatrixPage {...props} currentTeam={this.state.currentTeam} />
            }} />
            <Route exact path="/screenshot-finder/" render={props => { return <ScreenshotFinderPage {...props} /> }} />
          </Switch>
        </main>
      </div>
    );
  }
}

export default withRouter(App);
