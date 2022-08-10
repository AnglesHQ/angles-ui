import React, { Component } from 'react';

class BuildArtifacts extends Component {
  constructor(props) {
    super(props);
    this.state = {
      expanded: false,
    };
  }

  changeExpandedState = () => {
    const { expanded } = this.state;
    this.setState({ expanded: !expanded });
  };

  render() {
    const { expanded } = this.state;
    const { build } = this.props;
    if (!build.artifacts || build.artifacts.length === 0) {
      return null;
    }
    return (
      <table className="table">
        <thead className="thead-dark">
          <tr>
            <th scope="col" colSpan="90%" onClick={this.changeExpandedState}>
              <span>{`Build Artifacts [${build.artifacts.length}]`}</span>
              <span key={expanded} className="expand-artfifacts-span">
                <i title="Click to display/hide artifacts" className={expanded ? ('fas fa-caret-down') : 'fas fa-caret-left'} />
              </span>
            </th>
          </tr>
        </thead>
        { expanded
          ? (
            <tbody>
              {build.artifacts.map((artifact) => (
                <tr colSpan="100%" key={`${artifact.artifactId}_${artifact.version}`}>
                  <th scope="row">
                    { artifact.groupId ? (`${artifact.groupId}.`) : null}
                    {artifact.artifactId}
                  </th>
                  <td>{artifact.version}</td>
                </tr>
              ))}
            </tbody>
          )
          : null }
      </table>
    );
  }
}

export default BuildArtifacts;
