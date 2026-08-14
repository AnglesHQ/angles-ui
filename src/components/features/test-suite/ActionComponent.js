import React from 'react';
import { BiSolidDownArrow, BiSolidRightArrow } from 'react-icons/bi';
import { FormattedMessage } from 'react-intl';
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
    showScreenshots,
  } = props;

  const expanded = isActionExpanded(execution._id, actionIndex);
  const status = action.status.toLowerCase();
  const stepCount = action.steps ? action.steps.length : 0;

  return (
    <div className={`action-block action-block-${status} ${expanded ? 'action-block-expanded' : ''}`}>
      <div
        className="action-description"
        onClick={() => toggleAction(execution._id, actionIndex)}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            toggleAction(execution._id, actionIndex);
          }
        }}
      >
        <span className="action-toggle">
          {
            expanded ? (
              <BiSolidDownArrow className="action-icon" />
            ) : (
              <BiSolidRightArrow className="action-icon" />
            )
          }
        </span>
        <span className="action-index">{actionIndex + 1}</span>
        <span className={`action-name status-${status}`}>{action.name}</span>
        { stepCount > 0 ? (
          <span className="action-step-count">
            <FormattedMessage
              id="common.component.suite-table.action.step-count"
              values={{ count: stepCount }}
            />
          </span>
        ) : null }
      </div>
      { expanded ? (
        <div className="action-steps">
          <StepsTimeline
            key={`step_tables_tr_${index}`}
            index={index}
            action={action}
            screenshots={screenshots}
            openModal={openModal}
            showScreenshots={showScreenshots}
          />
        </div>
      ) : null }
    </div>
  );
};

export default ActionComponent;
