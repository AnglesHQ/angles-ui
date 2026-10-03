/* eslint react/no-array-index-key: [0] */
import React from 'react';
import Moment from 'react-moment';

import {
  Timeline,
  Panel,
} from 'rsuite';
import InfoRoundIcon from '@rsuite/icons/InfoRound';
import WarningRoundIcon from '@rsuite/icons/WarningRound';
import CheckRoundIcon from '@rsuite/icons/CheckRound';
import RemindRoundIcon from '@rsuite/icons/RemindRound';

const StepsTimeline = function (props) {
  const {
    action,
    openModal,
    screenshots,
    showScreenshots = true,
  } = props;

  const getScreenShot = (screenshotId) => {
    if (screenshots !== undefined && screenshotId !== undefined) {
      const image = screenshots.filter((screenshot) => screenshot._id === screenshotId)[0];
      if (image !== undefined && image.thumbnail) {
        if (image.thumbnail.startsWith('data:image')) {
          // to handle move to jimp
          return image.thumbnail;
        }
        return `data:image/png;base64, ${image.thumbnail}`;
      }
    }
    return undefined;
  };

  const getTimeLineIcon = (status) => {
    switch (status) {
      case 'PASS':
        return <CheckRoundIcon className="status-pass" />;
      case 'FAIL':
        return <WarningRoundIcon className="status-fail" />;
      case 'ERROR':
        return <RemindRoundIcon className="status-error" />;
      case 'INFO':
        return <InfoRoundIcon className="status-info" />;
      default:
        return <InfoRoundIcon className="status-info" />;
    }
  };

  // Step info comes from test results, i.e. from anyone with an API token for the team, so
  // it is rendered as text: HTML in it is shown, never interpreted. (It used to be parsed
  // as HTML after DOMPurify, which still let through forms, inline styles and off-site
  // links - enough for a convincing fake "session expired" form.) Only http(s) URLs are
  // turned into links, built as React elements rather than markup.
  const URL_PATTERN = /(https?:\/\/[\w=?./#&%+:~@,;!*'()$-]+)/g;
  const renderInfo = (content) => {
    if (!content) return '';
    return String(content).split(URL_PATTERN).map((part, index) => (
      index % 2 === 1 ? (
        <a key={`${index}-${part}`} href={part} target="_blank" rel="noopener noreferrer">{part}</a>
      ) : part
    ));
  };

  const renderScreenshot = (step) => {
    if (!showScreenshots || !step.screenshot) {
      return null;
    }
    return (
      <div className="step-shot">
        <img
          src={`${getScreenShot(step.screenshot)}`}
          alt="Step screenshot thumbnail"
          className="screenshot-thumbnail"
          onClick={() => openModal(step.screenshot)}
        />
      </div>
    );
  };

  // Only PASS/FAIL steps carry a name + expected/actual assertion; everything
  // else (INFO, ERROR, ...) carries free-form `info` text.
  const isAssertionStep = (status) => status === 'PASS' || status === 'FAIL';

  const renderStepBody = (step) => {
    if (isAssertionStep(step.status)) {
      const showDiff = step.status === 'FAIL'
        && (step.expected !== undefined || step.actual !== undefined);
      return (
        <>
          <div className="step-head">
            <span className="step-time">
              <Moment utc format="HH:mm:ss">{step.timestamp}</Moment>
            </span>
            <span className="step-name">{step.name}</span>
          </div>
          { showDiff ? (
            <div className="step-diff">
              <div className="step-diff-line">
                <span className="step-diff-label">Expected</span>
                <span className="step-diff-value">{`${step.expected}`}</span>
              </div>
              <div className="step-diff-line">
                <span className="step-diff-label">Actual</span>
                <span className="step-diff-value">{`${step.actual}`}</span>
              </div>
            </div>
          ) : null }
        </>
      );
    }
    return (
      <div className="step-head">
        <span className="step-time">
          <Moment utc format="HH:mm:ss">{step.timestamp}</Moment>
        </span>
        <span className="step-name step-name-info">
          {renderInfo(step.info)}
        </span>
      </div>
    );
  };

  return (
    <Panel className="steps-timeline-panel">
      <Timeline className="test-steps-timeline" key={action._id}>
        {
          action.steps.map((step, index) => (
            <Timeline.Item
              dot={getTimeLineIcon(step.status)}
              className={`timeline-step timeline-step-${step.status.toLowerCase()}`}
              key={index}
            >
              <div className="step-row">
                <div className="step-main">
                  {renderStepBody(step)}
                </div>
                {renderScreenshot(step)}
              </div>
            </Timeline.Item>
          ))
        }
      </Timeline>
    </Panel>
  );
};

export default StepsTimeline;
