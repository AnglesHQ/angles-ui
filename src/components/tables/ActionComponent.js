import React, { Component } from 'react';
import StepsTable from './StepsTable';

class ActionComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
    };
    this.toggleSteps = this.toggleSteps.bind(this);
  }

  toggleSteps = () => {
    const { open } = this.state;
    this.setState({ open: !open });
  }

  render() {
    const { open } = this.state;
    const {
      index,
      action,
      screenshots,
      openModal,
    } = this.props;
    return [
      <tr key={`action_${index}_${open}`} className="action-description" onClick={(e) => this.toggleSteps(e)}>
        <td className={`${action.status}`} colSpan="100%">
          <i title="Click to display/hide test steps" className={open ? ('fa fa-caret-down') : 'fas fa-caret-right'} />
          <span>{action.name}</span>
        </td>
      </tr>,
      <tr key={`steps_tables_${index}`}>
        { open ? (
          <td className="action-steps" key={Math.random().toString(36).substring(7)}>
            <StepsTable key={`step_tables_tr_${index}`} index={index} action={action} screenshots={screenshots} openModal={openModal} />
          </td>
        ) : null }
      </tr>,
    ];
  }
}

export default ActionComponent;
