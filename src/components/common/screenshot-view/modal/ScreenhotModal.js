import React from 'react';
import Modal from 'react-bootstrap/Modal';
import { FormattedMessage } from 'react-intl';
import ScreenshotView from '../ScreenshotView';

const ScreenshotModal = function (props) {
  const {
    closeModal,
    showModal,
    screenshots,
    currentShotId,
    selectedTab,
    addImageToBuildScreenshots,
    removeImageFromBuildScreenshots,
  } = props;

  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <Modal show={showModal} onHide={closeModal} dialogClassName="screenshot-modal" {...props}>
      <Modal.Header closeButton>
        <Modal.Title>
          <FormattedMessage id="common.component.screenshot-view.header" />
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <ScreenshotView
          buildScreenshots={screenshots}
          selectedScreenshotId={currentShotId}
          selectedTab={selectedTab}
          addImageToBuildScreenshots={addImageToBuildScreenshots}
          removeImageFromBuildScreenshots={removeImageFromBuildScreenshots}
        />
      </Modal.Body>
    </Modal>
  );
};

export default ScreenshotModal;
