import React, { useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import AttachmentViewer from './AttachmentViewer';
import KindIcon from './KindIcon';
import { formatBytes } from './attachmentFormat';

/*
 * A row of chips, one per attachment, each opening the attachment in a viewer suited to
 * its kind. `ids` are the ids the execution (or step) lists; `byId` is the metadata loaded
 * by useExecutionAttachments. Ids with no metadata - a manual-testing image on a manual
 * step, or an attachment since deleted - are skipped.
 */
const AttachmentList = function ({
  ids, byId, status, showLabel,
}) {
  const intl = useIntl();
  const [open, setOpen] = useState(undefined);

  if (!ids || ids.length === 0) return null;
  if (status === 'loading') {
    return (
      <div className="test-attachment-list">
        <span className="test-attachment-list-note">
          <FormattedMessage id="common.component.test-attachments.list-loading" />
        </span>
      </div>
    );
  }
  if (status === 'error') {
    return (
      <div className="test-attachment-list">
        <span className="form-error-text">
          <FormattedMessage id="common.component.test-attachments.list-error" />
        </span>
      </div>
    );
  }
  const attachments = ids.map((id) => byId[id]).filter(Boolean);
  if (attachments.length === 0) return null;

  return (
    <div className="test-attachment-list">
      { showLabel ? (
        <span className="test-attachment-list-label">
          <FormattedMessage id="common.component.test-attachments.title" />
        </span>
      ) : null }
      { attachments.map((attachment) => (
        <button
          type="button"
          key={attachment._id}
          className={`test-attachment-chip test-attachment-chip-${attachment.kind}`}
          title={intl.formatMessage(
            { id: 'common.component.test-attachments.open' },
            { name: attachment.originalName },
          )}
          onClick={(event) => {
            event.stopPropagation();
            setOpen(attachment);
          }}
        >
          <KindIcon kind={attachment.kind} />
          <span className="test-attachment-chip-name">{attachment.originalName}</span>
          <span className="test-attachment-chip-size">{formatBytes(intl, attachment.size)}</span>
        </button>
      ))}
      { open ? (
        <AttachmentViewer attachment={open} onClose={() => setOpen(undefined)} />
      ) : null }
    </div>
  );
};

export default AttachmentList;
