import React, { useState } from 'react';
import axios from 'axios';
import { Uploader, Loader, Message, useToaster, IconButton, Whisper, Tooltip } from 'rsuite';
import TrashIcon from '@rsuite/icons/Trash';
import CopyIcon from '@rsuite/icons/Copy';
import { FormattedMessage, useIntl } from 'react-intl';
import { AttachmentRequests } from 'angles-javascript-client';
import { getApiErrorMessage } from '../../../utility/ApiUtilities';

/*
 * Drop zone plus thumbnail strip for a test case step, shared step or execution.
 *
 * `owner` is the { testCaseId | sharedStepId | executionId } pair the API keys storage on.
 * Uploads go straight to the server rather than being held until save, because the markdown
 * reference a QA pastes into a step has to resolve to a real attachment id immediately.
 */
const AttachmentUpload = ({ owner, attachments, onChange, readOnly }) => {
    const intl = useIntl();
    const toaster = useToaster();
    const [uploading, setUploading] = useState(false);
    const attachmentRequests = new AttachmentRequests(axios);

    const list = attachments || [];

    const pushError = (error, fallbackId) => {
        toaster.push(
            <Message type="error">
                {getApiErrorMessage(error, intl.formatMessage({ id: fallbackId }))}
            </Message>,
            { placement: 'topEnd' },
        );
    };

    const handleUpload = async (file) => {
        setUploading(true);
        try {
            // blobFile is the underlying File; RSuite wraps it in its own descriptor.
            const uploaded = await attachmentRequests
                .uploadAttachment(file.blobFile, owner, file.name);
            onChange([...list, uploaded]);
        } catch (error) {
            pushError(error, 'app.manual.attachments.upload-error');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (attachment) => {
        try {
            await attachmentRequests.deleteAttachment(attachment._id);
            onChange(list.filter((item) => item._id !== attachment._id));
        } catch (error) {
            // A 409 here is expected and meaningful: a frozen version still references the
            // image, so it cannot be removed without rewriting history.
            pushError(error, 'app.manual.attachments.delete-error');
        }
    };

    const copyReference = (attachment) => {
        const reference = `![${attachment.originalName || 'image'}](attachment:${attachment._id})`;
        if (navigator.clipboard) {
            navigator.clipboard.writeText(reference);
            toaster.push(
                <Message type="info">
                    <FormattedMessage id="app.manual.attachments.reference-copied" />
                </Message>,
                { placement: 'topEnd' },
            );
        }
    };

    return (
        <div className="attachment-upload">
            {!readOnly && (
                <Uploader
                    action=""
                    autoUpload={false}
                    fileListVisible={false}
                    multiple
                    accept="image/png,image/jpeg,image/gif,image/webp,image/bmp,image/tiff"
                    onChange={(fileList) => {
                        const pending = fileList[fileList.length - 1];
                        if (pending) handleUpload(pending);
                    }}
                    draggable
                >
                    <div className="attachment-upload-zone">
                        {uploading ? <Loader content={intl.formatMessage({ id: 'app.manual.attachments.uploading' })} />
                            : <FormattedMessage id="app.manual.attachments.drop-hint" />}
                    </div>
                </Uploader>
            )}
            {list.length > 0 && (
                <div className="attachment-upload-list">
                    {list.map((attachment) => (
                        <div className="attachment-upload-item" key={attachment._id}>
                            <a
                                href={attachmentRequests.getAttachmentUrl(attachment._id)}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <img
                                    src={attachmentRequests.getThumbnailUrl(attachment._id)}
                                    alt={attachment.originalName || ''}
                                />
                            </a>
                            <div className="attachment-upload-item-actions">
                                <Whisper
                                    placement="top"
                                    speaker={(
                                        <Tooltip>
                                            <FormattedMessage id="app.manual.attachments.copy-reference" />
                                        </Tooltip>
                                    )}
                                >
                                    <IconButton
                                        size="xs"
                                        icon={<CopyIcon />}
                                        onClick={() => copyReference(attachment)}
                                    />
                                </Whisper>
                                {!readOnly && (
                                    <IconButton
                                        size="xs"
                                        icon={<TrashIcon />}
                                        onClick={() => handleDelete(attachment)}
                                    />
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AttachmentUpload;
