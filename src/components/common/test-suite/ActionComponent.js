import React from 'react';
import { BiSolidDownArrow, BiSolidRightArrow } from 'react-icons/bi';
import StepsTimeline from '../execution-timeline';
import ExecutionStateContext from '../../../context/ExecutionStateContext';

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
      <div className="action-description" onClick={() => toggleAction(execution._id, actionIndex)}>
        <div className={`action-status-${action.status}`} key={`action_${actionIndex}_${isActionExpanded(execution._id, actionIndex)}`}>
          {
            isActionExpanded(execution._id, actionIndex) ? (
              <BiSolidDownArrow key="" className="action-icon" />
            ) : (
              <BiSolidRightArrow className="action-icon" />
            )
          }
          <span>{action.name}</span>
        </div>
      </div>
      <div key={`steps_tables_${actionIndex}`}>
        { isActionExpanded(execution._id, actionIndex) ? (
          <div className="action-steps" key={Math.random().toString(36).substring(7)}>
            <StepsTimeline key={`step_tables_tr_${index}`} index={index} action={action} screenshots={screenshots} openModal={openModal} />
          </div>
        ) : null }
      </div>
    </>
  );
};

export default ActionComponent;
