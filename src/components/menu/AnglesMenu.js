import React, { Component } from 'react'

import { push as Menu } from 'react-burger-menu'
import './AnglesMenu.css';
import { withRouter} from 'react-router-dom';

class AnglesMenu extends Component {

  constructor(props) {
    super(props);
    this.state = {
      menuOpen: false,
      teamsMenuOpen: false
    };
  }

  toggleTeams = () => {
    this.setState({teamsMenuOpen: !this.state.teamsMenuOpen})
  }

  closeMenu = () => {
      this.setState({menuOpen: false, teamsMenuOpen: false})
  }

  handleStateChange = (state) => {
      this.setState({menuOpen: state.isOpen})
  }

  navigateToTeam = (teamId) => {
    this.props.history.push(`/?teamId=${teamId}`);
    this.closeMenu();
  }

  render () {
    return (
      <Menu isOpen={this.state.menuOpen} onStateChange={this.handleStateChange.bind(this)} pageWrapId={ "page-wrap" } outerContainerId={ "outer-container" } className="bm-menu">
        <li id="teams" onClick={() => this.toggleTeams()} className="bm-item">
          <i className="fa fa-fw fa-users"></i>
          <span>Teams</span>
        </li>
        <ol className="bm-list" style={{display:(this.state.teamsMenuOpen? 'block':'none')}}>
          { this.props.teams.map((team, index) => (
              <li className="bm-list-item" key={team._id} onClick={ () => { this.navigateToTeam(team._id) }}>
                {team.name}
              </li>
          ))}
        </ol>
        <a id="screenshot-finder" className="bm-item" href="/screenshot-finder">
          <i className="fa fa-fw fa-images"></i>
          <span>Screenshot Finder</span>
        </a>
        <a id="about" className="bm-item" href="/about">
          <i className="fa fa-fw fa-info"></i>
          <span>About Angles</span>
        </a>
      </Menu>
    );
  }
}

export default withRouter(AnglesMenu);
