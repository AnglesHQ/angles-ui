import React from 'react';
import StepsTimeline from '../common/execution-timeline';
import ExecutionStateContext from '../../context/ExecutionStateContext';

const ActionComponent = function (props) {
  const { isActionExpanded, toggleAction } = React.useContext(ExecutionStateContext);
  const {
    index,
    action,
    screenshots,
    openModal,
    actionIndex,
    execution,
  } = props;

  return (
    <>
      <tr key={`action_${actionIndex}_${isActionExpanded(execution._id, actionIndex)}`} className="action-description" onClick={() => toggleAction(execution._id, actionIndex)}>
        <td className={`${action.status}`} colSpan="100%">
          <i title="Click to display/hide test steps" className={isActionExpanded(execution._id, index) ? ('fa fa-caret-down') : 'fas fa-caret-right'} />
          <span>{action.name}</span>
        </td>
      </tr>
      <tr key={`steps_tables_${actionIndex}`}>
        { isActionExpanded(execution._id, actionIndex) ? (
          <td className="action-steps" key={Math.random().toString(36).substring(7)}>
            <StepsTimeline key={`step_tables_tr_${index}`} index={index} action={action} screenshots={screenshots} openModal={openModal} />
          </td>
        ) : null }
      </tr>
    </>
  );
};

export default ActionComponent;
