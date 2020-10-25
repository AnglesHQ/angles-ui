import React, { Component } from 'react'

import { push as Menu } from 'react-burger-menu'
import './AnglesMenu.css';

class AnglesMenu extends Component {

  constructor(props) {
    super(props);
    this.state = {
      menuOpen: false,
      teamsMenuOpen: false
    };
  }

  toggleTeams () {
    this.setState({teamsMenuOpen: !this.state.teamsMenuOpen})
  }

  closeMenu () {
      this.setState({menuOpen: false, teamsMenuOpen: false})
  }

  handleStateChange (state) {
      this.setState({menuOpen: state.isOpen})
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
              <li className="bm-list-item" key={team._id} onClick={ () => {this.props.click(team._id); this.closeMenu() }}>
                {team.name}
              </li>
          ))}
        </ol>
        <a id="about" className="bm-item" href="/about">
          <i className="fa fa-fw fa-info"></i>
          <span>About</span>
        </a>
        <a id="contact" className="bm-item" href="/contact">
          <i className="fa fa-fw fa-phone"></i>
          <span>Contact</span>
        </a>
      </Menu>
    );
  }
}

export default AnglesMenu;
