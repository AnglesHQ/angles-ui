import React from 'react';
import ProgressBar from 'react-bootstrap/ProgressBar';

const ExecutionsResultsBar = function (props) {
  const { result } = props;
  const localResult = {
    PASS: result.PASS || 0,
    FAIL: result.FAIL || 0,
    ERROR: result.ERROR || 0,
    SKIPPED: result.SKIPPED || 0,
  };
  localResult.TOTAL = result.TOTAL
    || (localResult.PASS + localResult.FAIL + localResult.ERROR + localResult.SKIPPED);

  const getPercentageString = (resultState) => {
    let total = 0;
    Object.keys(localResult).forEach((key) => {
      if (key !== 'TOTAL') {
        total += localResult[key];
      }
    });
    return Math.round(((localResult[resultState] / total) * 100));
  };

  return (
    localResult.TOTAL === 0 ? (
      <span>N/A</span>
    ) : (
      <ProgressBar className="test-results-progress-bar">
        <ProgressBar label={`${getPercentageString('PASS', localResult)}%`} className="test-result-success" variant="success" now={getPercentageString('PASS', localResult)} key={1} />
        <ProgressBar label={`${getPercentageString('SKIPPED', localResult)}%`} className="test-result-skipped" variant="info" now={getPercentageString('SKIPPED', localResult)} key={2} />
        <ProgressBar label={`${getPercentageString('ERROR', localResult)}%`} className="test-result-error" variant="warning" now={getPercentageString('ERROR', localResult)} key={3} />
        <ProgressBar label={`${getPercentageString('FAIL', localResult)}%`} className="test-result-failure" variant="danger" now={getPercentageString('FAIL', localResult)} key={4} />
      </ProgressBar>
    )
  );
};

export default ExecutionsResultsBar;
