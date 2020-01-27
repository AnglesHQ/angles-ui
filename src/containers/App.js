import React, { Component } from 'react'
import axios from 'axios';
import Teams from '../components/Teams';
import Builds from '../components/Builds';
import './App.css';

axios.defaults.baseURL = 'http://127.0.0.1:3000/rest/api/v1.0';
// axios.defaults.headers.common['Authorization'] = AUTH_TOKEN;
// axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      teams: [],
      builds: [],
    };
  }

 getBuildsForTeam(teamId) {
    axios.get('/build?teamId=' + teamId)
    .then((res) =>
      this.setState({ builds: res.data })
    )
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
      <div>
        <h1>Teams</h1>
        <Teams teams={this.state.teams} click={this.getBuildsForTeam.bind(this)}/>
        <br/>
        <h1>Builds</h1>
        <Builds builds={this.state.builds} />
      </div>
    );
  }

}

export default App;
