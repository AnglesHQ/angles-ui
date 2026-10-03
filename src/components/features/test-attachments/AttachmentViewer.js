import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FormattedMessage, useIntl } from 'react-intl';
import {
  Modal, Button, ButtonToolbar, Loader,
} from 'rsuite';
import { MdOutlineFileDownload } from 'react-icons/md';
import TextViewer from './TextViewer';
import HarViewer from './HarViewer';
import KindIcon from './KindIcon';
import { formatBytes } from './attachmentFormat';

// Kinds read as text before rendering; everything else is shown from a blob URL or only
// offered for download.
const TEXT_KINDS = ['log', 'json', 'har', 'html'];
const PREVIEWABLE_KINDS = [...TEXT_KINDS, 'video', 'image'];

// Hands the browser a blob to save under the attachment's own name. The file endpoint
// needs the session cookie, so a plain link would come back 401 in any deployment where
// the API and the UI are on different origins.
const saveBlob = (blob, name) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = name || 'attachment';
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60000);
};

const AttachmentBody = function ({ attachment, blob, objectUrl }) {
  const [text, setText] = useState(undefined);

  useEffect(() => {
    let cancelled = false;
    if (blob && TEXT_KINDS.includes(attachment.kind)) {
      blob.text().then((value) => { if (!cancelled) setText(value); });
    }
    return () => { cancelled = true; };
  }, [blob, attachment.kind]);

  switch (attachment.kind) {
    case 'video':
      return (
        // eslint-disable-next-line jsx-a11y/media-has-caption
        <video className="test-attachment-video" src={objectUrl} controls preload="metadata" />
      );
    case 'image':
      return <img className="test-attachment-image" src={objectUrl} alt={attachment.originalName} />;
    case 'log':
    case 'json':
      return text === undefined ? <Loader /> : <TextViewer text={text} json={attachment.kind === 'json'} />;
    case 'har':
      return text === undefined ? <Loader /> : <HarViewer text={text} />;
    case 'html':
      return text === undefined ? <Loader /> : (
        <>
          <p className="page-help-text">
            <FormattedMessage id="common.component.test-attachments.html.sandbox-note" />
          </p>
          {/* An empty sandbox: no scripts, no forms, no same-origin access. The snapshot is
              the page under test, so its scripts must never run inside Angles. */}
          <iframe
            className="test-attachment-html"
            sandbox=""
            srcDoc={text}
            title={attachment.originalName}
          />
        </>
      );
    case 'trace':
      return (
        <p className="page-help-text">
          <FormattedMessage
            id="common.component.test-attachments.trace.hint"
            values={{
              link: (
                <a key="trace-viewer" href="https://trace.playwright.dev" target="_blank" rel="noopener noreferrer">
                  trace.playwright.dev
                </a>
              ),
            }}
          />
        </p>
      );
    default:
      return (
        <p className="page-help-text">
          <FormattedMessage id="common.component.test-attachments.no-preview" />
        </p>
      );
  }
};

/*
 * Shows one attachment in a modal, with a viewer suited to its kind: text with a line
 * filter for logs and JSON, a request table for HAR files, a player for video, the page
 * in a script-less sandbox for HTML snapshots, and the picture for images. Traces and
 * archives are offered for download.
 */
const AttachmentViewer = function ({ attachment, onClose }) {
  const intl = useIntl();
  const [state, setState] = useState({ status: 'loading' });
  const previewable = PREVIEWABLE_KINDS.includes(attachment.kind);

  useEffect(() => {
    if (!previewable) {
      setState({ status: 'ready' });
      return undefined;
    }
    let cancelled = false;
    let created;
    setState({ status: 'loading' });
    axios.get(`attachment/${attachment._id}/file`, { responseType: 'blob' })
      .then((response) => {
        if (cancelled) return;
        created = URL.createObjectURL(response.data);
        setState({ status: 'ready', blob: response.data, objectUrl: created });
      })
      .catch(() => { if (!cancelled) setState({ status: 'error' }); });
    return () => {
      cancelled = true;
      if (created) URL.revokeObjectURL(created);
    };
  }, [attachment._id, previewable]);

  const download = async () => {
    try {
      const blob = state.blob || (await axios.get(
        `attachment/${attachment._id}/file`,
        { params: { download: true }, responseType: 'blob' },
      )).data;
      saveBlob(blob, attachment.originalName);
    } catch (error) {
      setState((current) => ({ ...current, downloadFailed: true }));
    }
  };

  return (
    <Modal
      size="lg"
      open
      onClose={onClose}
      className="test-attachment-modal"
      onClick={(event) => event.stopPropagation()}
    >
      <Modal.Header>
        <Modal.Title className="test-attachment-modal-title">
          <KindIcon kind={attachment.kind} />
          <span className="test-attachment-modal-name">{attachment.originalName}</span>
          <span className="test-attachment-modal-meta">
            <FormattedMessage id={`common.component.test-attachments.kind.${attachment.kind}`} />
            {' · '}
            {formatBytes(intl, attachment.size)}
          </span>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="test-attachment-modal-body">
        { state.status === 'loading' ? (
          <div className="app-alert app-alert-info">
            <Loader content={intl.formatMessage({ id: 'common.component.test-attachments.loading' })} />
          </div>
        ) : null }
        { state.status === 'error' ? (
          <div className="app-alert app-alert-error">
            <FormattedMessage id="common.component.test-attachments.load-error" />
          </div>
        ) : null }
        { state.status === 'ready' ? (
          <AttachmentBody attachment={attachment} blob={state.blob} objectUrl={state.objectUrl} />
        ) : null }
        { state.downloadFailed ? (
          <p className="form-error-text">
            <FormattedMessage id="common.component.test-attachments.load-error" />
          </p>
        ) : null }
      </Modal.Body>
      <Modal.Footer>
        <ButtonToolbar className="test-attachment-modal-actions">
          <Button className="btn-primary" onClick={download}>
            <MdOutlineFileDownload aria-hidden="true" />
            <FormattedMessage id="common.component.test-attachments.download" />
          </Button>
          <Button className="btn-secondary" onClick={onClose}>
            <FormattedMessage id="common.component.test-attachments.close" />
          </Button>
        </ButtonToolbar>
      </Modal.Footer>
    </Modal>
  );
};

export default AttachmentViewer;
