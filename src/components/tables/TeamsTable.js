import React, { Component } from 'react'

class TeamsTable extends Component {

  constructor(props) {
    super(props);
    console.log(props);
    this.state = {
      //
    };
  }

  render() {
    return (
      <table className="table">
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">ID</th>
            <th scope="col">Name</th>
            <th scope="col">Created</th>
          </tr>
        </thead>
        <tbody>
          { this.props.teams.map((team, index) => (
            <tr key={team._id} onClick={ () => this.props.click(team._id) }>
              <th scope="row">{ index }</th>
              <td>{team._id}</td>
              <td>{team.name}</td>
              <td>{team.createdAt}</td>
            </tr>
          ))}
        </tbody>
      </table>
    )
  };

};

export default TeamsTable
