import { useState } from 'react';
import { ExecutionTypes } from 'angles-javascript-client';

// The execution-type pickers need a concrete value for "no filter", but the API takes the
// absence of the parameter to mean both. This sentinel is mapped back to undefined before
// the request is made, so omitting the filter keeps the pre-3.0 behaviour.
export const ALL_EXECUTION_TYPES = 'all';

export const toExecutionTypeParam = (value) => (
  value === ALL_EXECUTION_TYPES ? undefined : value
);

// Options for an execution-type SelectPicker. Takes intl rather than importing it so the
// caller's provider is used.
export const getExecutionTypeOptions = (intl) => ([
  { label: intl.formatMessage({ id: 'app.execution-type.all' }), value: ALL_EXECUTION_TYPES },
  { label: intl.formatMessage({ id: 'app.execution-type.automated' }), value: ExecutionTypes.AUTOMATED },
  { label: intl.formatMessage({ id: 'app.execution-type.manual' }), value: ExecutionTypes.MANUAL },
]);

export const useConstructor = (callBack = () => {}) => {
  const [hasBeenCalled, setHasBeenCalled] = useState(false);
  if (hasBeenCalled) return;
  callBack();
  setHasBeenCalled(true);
};
