import React, { Component } from 'react'
import { Route, Switch } from 'react-router-dom'
import axios from 'axios';
import AnglesMenu from '../components/menu/AnglesMenu';
import SummaryPage from '../components/pages/SummaryPage'
import BuildPage from '../components/pages/BuildPage'
import ScreenshotPage from '../components/pages/ScreenshotPage'
import './App.css';
import '../components/charts/Charts.css'

axios.defaults.baseURL = 'http://127.0.0.1:3000/rest/api/v1.0';

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      teams: [],
      currentTeam: {name: 'No team selected'},
      builds: [],
    };
  }

  getBuildsForTeam(teamId) {
    return axios.get('/build?teamId=' + teamId)
    .then((res) =>
      this.setState({ builds: res.data, currentTeam: this.getTeam(teamId)})
    )
  }

  getTeam(teamId) {
    return this.state.teams.find(team => team._id === teamId);
  }

  componentDidMount() {
    axios.get('/team')
    .then(res => res.data)
    .then((data) => {
      this.setState({ teams: data });
      this.getBuildsForTeam(data[0]._id);
    })
    .catch(console.log);
  }

  render() {
    return (
      <div id="outer-container">
        <AnglesMenu teams={this.state.teams} click={this.getBuildsForTeam.bind(this)}/>
        <main id="page-wrap">
          <Switch>
            <Route exact path="/">
              <SummaryPage builds={this.state.builds} currentTeam={this.state.currentTeam} />
            </Route>
            <Route exact path="/build/" render={props => { return <BuildPage {...props} /> }} />
            <Route exact path="/screenshot/:id" render={props => { return <ScreenshotPage {...props} /> }} />
          </Switch>
        </main>
      </div>
    );
  }
}

export default App;
