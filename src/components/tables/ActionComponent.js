import React, { Component } from 'react';
import StepsTable from './StepsTable';

class ActionComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  render() {
    const {
      isOpen,
      index,
      action,
      screenshots,
      openModal,
      actionIndex,
      toggleAction,
    } = this.props;
    return [
      <tr key={`action_${index}_${isOpen}`} className="action-description" onClick={() => toggleAction(index, actionIndex)}>
        <td className={`${action.status}`} colSpan="100%">
          <i title="Click to display/hide test steps" className={isOpen ? ('fa fa-caret-down') : 'fas fa-caret-right'} />
          <span>{action.name}</span>
        </td>
      </tr>,
      <tr key={`steps_tables_${index}`}>
        { isOpen ? (
          <td className="action-steps" key={Math.random().toString(36).substring(7)}>
            <StepsTable key={`step_tables_tr_${index}`} index={index} action={action} screenshots={screenshots} openModal={openModal} />
          </td>
        ) : null }
      </tr>,
    ];
  }
}

export default ActionComponent;
