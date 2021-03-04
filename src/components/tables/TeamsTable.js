import React, { Component } from 'react';

class TeamsTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      //
    };
  }

  render() {
    const { teams, click } = this.props;
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
          { teams.map((team, index) => (
            <tr key={team._id} onClick={() => click(team._id)}>
              <th scope="row">{ index }</th>
              <td>{team._id}</td>
              <td>{team.name}</td>
              <td>{team.createdAt}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }
}

export default TeamsTable;
