import React, { Component } from 'react'
import StepsTable from './StepsTable';

class ActionComponent extends Component {

  constructor(props) {
    super(props);
    this.state = {
      open: false
    };
    this.toggleSteps = this.toggleSteps.bind(this);
  }

  toggleSteps = (e) => {
    this.setState({open: !this.state.open});
  }

  render () {
    return [
      <tr key={"action_" + this.props.index} className="action-description" onClick={(e)=>this.toggleSteps(e)}>
        <td className={`${this.props.action.status}`} colSpan="100%">{this.props.action.name}</td>
      </tr>,
      <tr key={"steps_tables_" + this.props.index}>
      { this.state.open ? (
        <td className="action-steps" key={Math.random().toString(36).substring(7)}>
            <StepsTable key={"step_tables_tr_" + this.props.index} index={this.props.index} action={this.props.action} index={this.props.index} screenshots={this.props.screenshots}/>
        </td>
      ): null }
      </tr>
    ]
  }
};

export default ActionComponent
