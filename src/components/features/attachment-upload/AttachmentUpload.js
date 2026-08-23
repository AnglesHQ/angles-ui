import React, { useState, useEffect } from 'react';
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
/*
 * An <img> for an endpoint that requires the session cookie.
 *
 * A plain <img src> is a separate browser request that carries no credentials to another
 * origin, so it comes back 401 and renders as a broken image - the API and the UI are not
 * the same origin in any real deployment. Fetching through axios (which is configured with
 * withCredentials) and handing the <img> a blob URL is what makes the picture appear.
 *
 * Screenshots avoid this by embedding base64 in their JSON, but an attachment list would
 * carry every image in full on every read, so attachments stay URL-addressed and load here.
 */
const AuthenticatedImage = ({ url, alt, className }) => {
    const [objectUrl, setObjectUrl] = useState(undefined);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        let revoked = false;
        let created;
        if (!url) return undefined;
        setFailed(false);
        axios.get(url, { responseType: 'blob' })
            .then((response) => {
                if (revoked) return;
                created = URL.createObjectURL(response.data);
                setObjectUrl(created);
            })
            .catch(() => { if (!revoked) setFailed(true); });
        return () => {
            revoked = true;
            // Blob URLs are held by the document until revoked, so a list that re-renders
            // would otherwise leak one per image per render.
            if (created) URL.revokeObjectURL(created);
        };
    }, [url]);

    if (failed) {
        return (
            <span className="attachment-upload-broken" title={alt}>
                <FormattedMessage id="app.manual.attachments.load-error" />
            </span>
        );
    }
    if (!objectUrl) return <span className="attachment-upload-loading" />;
    return <img className={className} src={objectUrl} alt={alt} />;
};

const AttachmentUpload = ({ owner, attachments, onChange, readOnly }) => {
    const intl = useIntl();
    const toaster = useToaster();
    const [uploading, setUploading] = useState(false);
    const attachmentRequests = new AttachmentRequests(axios);

    // The API stores references, so a case read back gives id strings while a freshly
    // uploaded one gives the whole document. Both are normalised to { _id, originalName }
    // so the list renders either way - the thumbnail only needs the id.
    const list = (attachments || [])
        .map((attachment) => (typeof attachment === 'string' ? { _id: attachment } : attachment))
        .filter((attachment) => attachment && attachment._id);

    const pushError = (error, fallbackId) => {
        toaster.push(
            <Message type="error" showIcon closable>
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
            onChange([...(attachments || []), uploaded]);
        } catch (error) {
            pushError(error, 'app.manual.attachments.upload-error');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (attachment) => {
        try {
            await attachmentRequests.deleteAttachment(attachment._id);
            onChange((attachments || []).filter((item) => {
                const id = typeof item === 'string' ? item : item && item._id;
                return id !== attachment._id;
            }));
        } catch (error) {
            // A 409 here is expected and meaningful: a frozen version still references the
            // image, so it cannot be removed without rewriting history.
            pushError(error, 'app.manual.attachments.delete-error');
        }
    };

    // Opening the raw URL in a new tab hits the same 401 as an <img> would, so the bytes
    // are fetched with credentials and handed to the tab as a blob.
    const openFullSize = async (attachment) => {
        try {
            const response = await axios.get(
                attachmentRequests.getAttachmentUrl(attachment._id),
                { responseType: 'blob' },
            );
            const url = URL.createObjectURL(response.data);
            window.open(url, '_blank', 'noopener,noreferrer');
            // Revoked once the new tab has had a chance to load it; revoking immediately
            // races the open and shows an empty tab.
            setTimeout(() => URL.revokeObjectURL(url), 60000);
        } catch (error) {
            pushError(error, 'app.manual.attachments.load-error');
        }
    };

    const copyReference = (attachment) => {
        const reference = `![${attachment.originalName || 'image'}](attachment:${attachment._id})`;
        if (navigator.clipboard) {
            navigator.clipboard.writeText(reference);
            toaster.push(
                <Message type="info" showIcon closable>
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
                            <button
                                type="button"
                                className="attachment-upload-open"
                                onClick={() => openFullSize(attachment)}
                                title={attachment.originalName || ''}
                            >
                                <AuthenticatedImage
                                    url={attachmentRequests.getThumbnailUrl(attachment._id)}
                                    alt={attachment.originalName || ''}
                                />
                            </button>
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
