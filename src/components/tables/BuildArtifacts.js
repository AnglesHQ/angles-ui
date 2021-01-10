import React, { Component } from 'react'

class BuildArtifacts extends Component {

  constructor(props) {
    super(props);
    this.state = {
      expanded: false
    };
  }

  changeExpandedState = () => {
    this.setState({expanded: !this.state.expanded });
  }

  render() {
    if (!this.props.build.artifacts || this.props.build.artifacts.length === 0) {
      return null;
    }
    return (
      <table className="table">
        <thead className="thead-dark">
          <tr>
            <th scope="col" colSpan="90%" onClick={this.changeExpandedState}>
              <span>Build Artifacts [{this.props.build.artifacts.length}]</span>
              <span key={ this.state.expanded } className={`expand-artfifacts-span`}>
                <i title="Click to display/hide artifacts" className={ this.state.expanded ? ('fas fa-caret-down'): 'fas fa-caret-left' }></i>
              </span>
            </th>
          </tr>
        </thead>
        { this.state.expanded ?
          <tbody >
          {
            this.props.build.artifacts.map(artifact => {
                return <tr colSpan="100%">
                  <th scope="row">{ artifact.groupId ? (`${artifact.groupId}.`): null}{artifact.artifactId}</th>
                  <td>{artifact.version}</td>
                </tr>
            })
          }
          </tbody>
         : null }

      </table>
    )
  };

};

export default BuildArtifacts
