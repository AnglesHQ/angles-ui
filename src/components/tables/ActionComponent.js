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
      <tr key={`action_${this.props.index}_${this.state.open}`} className="action-description" onClick={(e)=>this.toggleSteps(e)}>
        <td className={`${this.props.action.status}`} colSpan="100%"><i title="Click to display/hide test steps" className={ this.state.open ? ('fa fa-caret-down'): 'fas fa-caret-right' }></i><span>{this.props.action.name}</span></td>
      </tr>,
      <tr key={"steps_tables_" + this.props.index}>
      { this.state.open ? (
        <td className="action-steps" key={Math.random().toString(36).substring(7)}>
            <StepsTable key={"step_tables_tr_" + this.props.index} index={this.props.index} action={this.props.action} screenshots={this.props.screenshots} openModal={this.props.openModal} />
        </td>
      ): null }
      </tr>
    ]
  }
};

export default ActionComponent
