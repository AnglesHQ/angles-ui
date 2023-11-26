import React from 'react';

const ExecutionStateContext = React.createContext();

export function ExecutionStateProvider({ children }) {
  const [executionStates, setExecutionStates] = React.useState({});
  const getStatesDefault = (expanded, expandActions, suite) => {
    const states = {};
    suite.executions.forEach((execution) => {
      states[execution._id] = {
        isOpen: expanded,
        actions: [],
      };
      execution.actions.forEach((action, index) => {
        states[execution._id].actions[index] = expandActions;
      });
    });
    return states;
  };
  const setDefaultStates = (suite) => {
    setExecutionStates(getStatesDefault(false, false, suite));
  };
  const isExecutionExpanded = (executionId) => {
    if (executionStates[executionId] && executionStates[executionId].isOpen) {
      return executionStates[executionId].isOpen;
    }
    return false;
  };
  const isSuiteExpanded = (suite) => {
    const expandedExecutions = suite.executions
      .find((execution) => isExecutionExpanded(execution._id));
    return expandedExecutions !== undefined;
  };
  const toggleExecution = (executionId) => {
    executionStates[executionId].isOpen = !executionStates[executionId].isOpen;
    setExecutionStates({ ...executionStates });
  };
  const isActionExpanded = (executionId, actionIndex) => {
    if (executionStates[executionId] && executionStates[executionId].actions) {
      return executionStates[executionId].actions[actionIndex];
    }
    return false;
  };
  const toggleAction = (executionId, actionIndex) => {
    executionStates[executionId]
      .actions[actionIndex] = !executionStates[executionId].actions[actionIndex];
    setExecutionStates({ ...executionStates });
  };
  const value = React.useMemo(
    () => (
      {
        executionStates,
        setExecutionStates,
        isExecutionExpanded,
        isSuiteExpanded,
        toggleExecution,
        isActionExpanded,
        toggleAction,
        getStatesDefault,
        setDefaultStates,
      }
    ),
    [executionStates],
  );
  return (
    <ExecutionStateContext.Provider value={value}>
      { children }
    </ExecutionStateContext.Provider>
  );
}

export default ExecutionStateContext;
