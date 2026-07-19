import React from 'react';
import { Popover, Whisper } from 'rsuite';
import TestResultsTable from './TestResultsTable';

const testDetailsSpeaker = (result) => (
  <Popover title="Result" style={{ width: '300px' }}>
    <TestResultsTable result={result} />
  </Popover>
);

// Segment order matches the previous stacked ProgressBar (pass → skipped → error → fail).
const SEGMENTS = [
  { key: 'PASS', className: 'test-result-success' },
  { key: 'SKIPPED', className: 'test-result-skipped' },
  { key: 'ERROR', className: 'test-result-error' },
  { key: 'FAIL', className: 'test-result-failure' },
];

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

  const denominator = localResult.PASS + localResult.FAIL + localResult.ERROR + localResult.SKIPPED;
  const getPercentage = (state) => (
    denominator === 0 ? 0 : Math.round((localResult[state] / denominator) * 100)
  );

  return (
    localResult.TOTAL === 0 ? (
      <span>N/A</span>
    ) : (
      <Whisper
        placement="autoHorizontalStart"
        trigger="hover"
        controlId="control-id-hover"
        speaker={testDetailsSpeaker(localResult)}
      >
        <div className="test-results-progress-bar">
          {SEGMENTS.map((segment) => {
            const pct = getPercentage(segment.key);
            if (pct === 0) return null;
            return (
              <div
                key={segment.key}
                className={`test-result-segment ${segment.className}`}
                style={{ width: `${pct}%` }}
              >
                {`${pct}%`}
              </div>
            );
          })}
        </div>
      </Whisper>
    )
  );
};

export default ExecutionsResultsBar;
