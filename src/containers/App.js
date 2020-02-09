import React, { Component } from 'react'
import axios from 'axios';
import Builds from '../components/Builds';
import AnglesMenu from '../components/AnglesMenu';
import BuildBarChart from '../components/charts/BuildBarChart';
import BuildTimeLineChart from '../components/charts/BuildTimeLineChart';
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
    axios.get('/build?teamId=' + teamId)
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
      this.setState({ teams: data })
      this.getBuildsForTeam(data[0]._id);
    })
    .catch(console.log)
  }

  render() {
    return (
      <div id="outer-container">
        <AnglesMenu teams={this.state.teams} click={this.getBuildsForTeam.bind(this)}/>
        <main id="page-wrap">
            <h1>Team: {this.state.currentTeam.name}</h1>
            <div className="graphContainerParent">
              <BuildBarChart builds={this.state.builds} />
              <BuildTimeLineChart builds={this.state.builds} />
            </div>
            <h1>Builds</h1>
            <Builds builds={this.state.builds} />
        </main>
      </div>
    );
  }
}

export default App;
