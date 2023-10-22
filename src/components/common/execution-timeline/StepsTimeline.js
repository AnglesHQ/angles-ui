/* eslint react/no-array-index-key: [0] */
import React from 'react';
import Moment from 'react-moment';
import { useNavigate } from 'react-router-dom';
import {
  Timeline,
  Panel,
  Stack,
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
  } = props;

  const getScreenShot = (screenshotId) => {
    if (screenshots !== undefined && screenshotId !== undefined) {
      const image = screenshots.filter((screenshot) => screenshot._id === screenshotId)[0];
      if (image !== undefined) {
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
        return <CheckRoundIcon className="timeline-icon-pass" />;
      case 'FAIL':
        return <WarningRoundIcon className="timeline-icon-fail" />;
      case 'ERROR':
        return <RemindRoundIcon className="timeline-icon-error" />;
      case 'INFO':
        return <InfoRoundIcon className="timeline-icon-info" />;
      default:
        return <InfoRoundIcon className="timeline-icon-info" />;
    }
  };
  // eslint-disable-next-line no-unused-vars
  const navigateToImageDetails = (imageId) => {
    const navigate = useNavigate();
    navigate(`/image/${imageId}`);
  };

  const convertTextToLinks = (content) => {
    const reg = /(http:\/\/|https:\/\/)((\w|=|\?|\.|\/|#|&|-)+)/g;
    if (content) {
      return content.replace(reg, "<a href='$1$2' target='_blank'>$1$2</a>");
    }
    return '';
  };

  return [
    <Panel className="steps-timeline-panel">
      <Timeline className="test-steps-timeline" key={action._id}>
        {
          action.steps.map((step, index) => {
            let screenshotImage = null;
            if (step.screenshot) {
              screenshotImage = (
                <img
                  src={`${getScreenShot(step.screenshot)}`}
                  alt="Thumbnail"
                  className="screenshot-thumbnail"
                  onClick={() => openModal(step.screenshot)}
                  style={{ cursor: 'pointer', height: '120px' }}
                />
              );
            }
            if (step.status === 'PASS' || step.status === 'FAIL') {
              return (
                <Timeline.Item dot={getTimeLineIcon(step.status)} className="timeline-step" key={index}>
                  <Stack className="rg-stack" spacing={10}>
                    <p><Moment format="HH:mm:ss">{step.timestamp}</Moment></p>
                    <p>{step.name}</p>
                    <p>{`Expected: ${step.expected}, Actual: ${step.actual}`}</p>
                    <p>{screenshotImage}</p>
                  </Stack>
                </Timeline.Item>
              );
            }
            return (
              <Timeline.Item dot={getTimeLineIcon(step.status)} className="timeline-step" key={index}>
                <Stack className="rg-stack" spacing={10}>
                  <p><Moment format="HH:mm:ss">{step.timestamp}</Moment></p>
                  <p>{convertTextToLinks(step.info)}</p>
                  <p>{screenshotImage}</p>
                </Stack>
              </Timeline.Item>
            );
          })
        }
      </Timeline>
    </Panel>,
  ];
};

export default StepsTimeline;
