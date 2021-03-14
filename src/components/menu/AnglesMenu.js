import React, { Component } from 'react';

import { push as Menu } from 'react-burger-menu';
import './AnglesMenu.css';
import { withRouter } from 'react-router-dom';

class AnglesMenu extends Component {
  constructor(props) {
    super(props);
    this.state = {
      menuOpen: false,
      teamsMenuOpen: false,
    };
  }

  toggleTeams = () => {
    const { teamsMenuOpen } = this.state;
    this.setState({ teamsMenuOpen: !teamsMenuOpen });
  }

  closeMenu = () => {
    this.setState({ menuOpen: false, teamsMenuOpen: false });
  }

  handleStateChange = (state) => {
    this.setState({ menuOpen: state.isOpen });
  }

  navigateToTeam = (teamId) => {
    const { history } = this.props;
    history.push(`/?teamId=${teamId}`);
    this.closeMenu();
  }

  render() {
    const { menuOpen, teamsMenuOpen } = this.state;
    const { teams } = this.props;
    return (
      <Menu isOpen={menuOpen} onStateChange={this.handleStateChange} pageWrapId="page-wrap" outerContainerId="outer-container" className="bm-menu">
        <li role="button" id="teams" onClick={() => this.toggleTeams()} className="bm-item">
          <i className="fa fa-fw fa-users" />
          <span>Teams</span>
        </li>
        <ol className="bm-list" style={{ display: (teamsMenuOpen ? 'block' : 'none') }}>
          { teams.map((team) => (
            <li role="button" className="bm-list-item" key={team._id} onClick={() => { this.navigateToTeam(team._id); }}>
              {team.name}
            </li>
          ))}
        </ol>
        <a id="screenshot-finder" className="bm-item" href="/screenshot-finder">
          <i className="fa fa-fw fa-images" />
          <span>Screenshot Finder</span>
        </a>
        <a id="about" className="bm-item" href="/about">
          <i className="fa fa-fw fa-info" />
          <span>About Angles</span>
        </a>

        <img src="./assets/angles-logo.png" className="angles-logo-menu" alt="Angles" />
      </Menu>
    );
  }
}

export default withRouter(AnglesMenu);
