import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Input, IconButton, Button, SelectPicker, Tag, Whisper, Tooltip } from 'rsuite';
import TrashIcon from '@rsuite/icons/Trash';
import PlusIcon from '@rsuite/icons/Plus';
import AttachmentIcon from '@rsuite/icons/Attachment';
import { FormattedMessage, useIntl } from 'react-intl';
import AttachmentUpload from '../attachment-upload/AttachmentUpload';

/**
 * Ordered editor for a test case's steps.
 *
 * A step is either literal (action + expected result) or an inclusion of a shared step, in
 * which case its own text is ignored and the shared step's steps take its place when the
 * case is read expanded or frozen into a version. The two are rendered differently so an
 * author can see at a glance which steps they actually control here.
 *
 * Action and expected sit side by side on one row: a step is a single "do this, expect
 * that" pair, and stacking them made a ten-step case scroll for no reason. Attachments are
 * collapsed behind a toggle per step, because most steps have none and an always-visible
 * drop zone on every row would bury the text the author is actually writing.
 *
 * Reordering is drag-and-drop using the native HTML5 API rather than a library - the list
 * is a single flat column, which is the case the native API handles well, and it avoids a
 * dependency for one interaction.
 */
const ManualStepEditor = ({ steps, onChange, sharedSteps, readOnly, attachmentOwner }) => {
    const intl = useIntl();
    const [dragIndex, setDragIndex] = useState(undefined);
    const [dropIndex, setDropIndex] = useState(undefined);
    // Which rows have their attachment panel open. Kept by index rather than id because a
    // step has no id until it is saved.
    const [openAttachments, setOpenAttachments] = useState({});

    const sharedStepOptions = (sharedSteps || []).map((sharedStep) => ({
        label: `${sharedStep.name} (v${sharedStep.version})`,
        value: sharedStep._id,
    }));

    const updateStep = (index, changes) => {
        const next = steps.map((step, i) => (i === index ? { ...step, ...changes } : step));
        onChange(next);
    };

    const addStep = () => {
        onChange([...(steps || []), { action: '', expected: '' }]);
    };

    const addSharedStep = () => {
        onChange([...(steps || []), { action: '', sharedStep: null }]);
    };

    const removeStep = (index) => {
        onChange(steps.filter((step, i) => i !== index));
    };

    const toggleAttachments = (index) => {
        setOpenAttachments((current) => ({ ...current, [index]: !current[index] }));
    };

    // Removing the dragged row and re-inserting it is what makes a drag across several
    // positions land where the marker showed, rather than swapping two neighbours.
    const moveStep = (from, to) => {
        if (from === to || to === undefined || from === undefined) return;
        const next = [...steps];
        const [moved] = next.splice(from, 1);
        next.splice(to, 0, moved);
        onChange(next);
    };

    const handleDragStart = (index) => (event) => {
        setDragIndex(index);
        // Firefox ignores a drag that sets no data.
        event.dataTransfer.effectAllowed = 'move';
        try { event.dataTransfer.setData('text/plain', String(index)); } catch (error) { /* noop */ }
    };

    const handleDragOver = (index) => (event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
        if (index !== dropIndex) setDropIndex(index);
    };

    const handleDrop = (index) => (event) => {
        event.preventDefault();
        moveStep(dragIndex, index);
        setDragIndex(undefined);
        setDropIndex(undefined);
    };

    const handleDragEnd = () => {
        setDragIndex(undefined);
        setDropIndex(undefined);
    };

    if (readOnly) {
        return (
            <ol className="manual-step-editor manual-step-editor-readonly">
                {(steps || []).map((step, index) => (
                    // eslint-disable-next-line react/no-array-index-key
                    <li className="manual-step" key={step._id || index}>
                        <div className="manual-step-body">
                            <div className="manual-step-row">
                                <div className="manual-step-action">{step.action}</div>
                                <div className="manual-step-expected">{step.expected}</div>
                            </div>
                            {step.data && (
                                <div className="manual-step-data">
                                    <span className="manual-step-label">
                                        <FormattedMessage id="app.manual.step-editor.data" />
                                    </span>
                                    {step.data}
                                </div>
                            )}
                            {(step.attachments || []).length > 0 && (
                                <AttachmentUpload
                                    attachments={step.attachments}
                                    owner={{}}
                                    onChange={() => {}}
                                    readOnly
                                />
                            )}
                            {/* An expanded step says where it came from, so a reader can tell
                                which content is owned by this case and which by a shared step. */}
                            {step.sharedStepRef && (
                                <Tag className="manual-step-shared-tag">
                                    <FormattedMessage
                                        id="app.manual.step-editor.from-shared-step"
                                        values={{ version: step.sharedStepVersion }}
                                    />
                                </Tag>
                            )}
                            {step.unresolvedSharedStep && (
                                <Tag className="manual-step-unresolved-tag">
                                    <FormattedMessage id="app.manual.step-editor.unresolved" />
                                </Tag>
                            )}
                        </div>
                    </li>
                ))}
            </ol>
        );
    }

    return (
        <div className="manual-step-editor">
            <div className="manual-step-heading">
                <span className="manual-step-heading-number" />
                <span className="manual-step-heading-action">
                    <FormattedMessage id="app.manual.step-editor.action" />
                </span>
                <span className="manual-step-heading-expected">
                    <FormattedMessage id="app.manual.step-editor.expected" />
                </span>
                <span className="manual-step-heading-controls" />
            </div>

            <ol className="manual-step-list">
                {(steps || []).map((step, index) => {
                    const classes = ['manual-step'];
                    if (dragIndex === index) classes.push('manual-step-dragging');
                    if (dropIndex === index && dragIndex !== index) classes.push('manual-step-drop-target');
                    return (
                        <li
                            // eslint-disable-next-line react/no-array-index-key
                            key={step._id || index}
                            className={classes.join(' ')}
                            draggable
                            onDragStart={handleDragStart(index)}
                            onDragOver={handleDragOver(index)}
                            onDrop={handleDrop(index)}
                            onDragEnd={handleDragEnd}
                        >
                            <span
                                className="manual-step-handle"
                                aria-label={intl.formatMessage({ id: 'app.manual.step-editor.drag-handle' })}
                            >
                                <span className="manual-step-number">{index + 1}</span>
                            </span>

                            <div className="manual-step-body">
                                {/* `sharedStep` being present at all (even null) marks this row as an
                                    inclusion, so an author can add one before choosing which. */}
                                {'sharedStep' in step ? (
                                    <div className="manual-step-shared">
                                        <span className="manual-step-label">
                                            <FormattedMessage id="app.manual.step-editor.shared-step" />
                                        </span>
                                        <SelectPicker
                                            data={sharedStepOptions}
                                            value={step.sharedStep}
                                            onChange={(value) => updateStep(index, { sharedStep: value })}
                                            placeholder={intl.formatMessage({ id: 'app.manual.step-editor.shared-step-placeholder' })}
                                            block
                                            cleanable={false}
                                        />
                                        <p className="page-help-text">
                                            <FormattedMessage id="app.manual.step-editor.shared-step-help" />
                                        </p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="manual-step-row">
                                            <Input
                                                as="textarea"
                                                rows={2}
                                                className="manual-step-action-input"
                                                value={step.action || ''}
                                                onChange={(value) => updateStep(index, { action: value })}
                                                placeholder={intl.formatMessage({ id: 'app.manual.step-editor.action-placeholder' })}
                                            />
                                            <Input
                                                as="textarea"
                                                rows={2}
                                                className="manual-step-expected-input"
                                                value={step.expected || ''}
                                                onChange={(value) => updateStep(index, { expected: value })}
                                                placeholder={intl.formatMessage({ id: 'app.manual.step-editor.expected-placeholder' })}
                                            />
                                        </div>
                                        <Input
                                            value={step.data || ''}
                                            onChange={(value) => updateStep(index, { data: value })}
                                            placeholder={intl.formatMessage({ id: 'app.manual.step-editor.data-placeholder' })}
                                        />
                                        {(openAttachments[index] || (step.attachments || []).length > 0) && (
                                            <div className="manual-step-attachments">
                                                {attachmentOwner ? (
                                                    <AttachmentUpload
                                                        owner={attachmentOwner}
                                                        attachments={step.attachments || []}
                                                        onChange={(attachments) => updateStep(index, { attachments })}
                                                    />
                                                ) : (
                                                    // Uploads are keyed on the owning entity, so one
                                                    // that has not been saved yet has nothing to key on.
                                                    <div className="app-alert app-alert-info">
                                                        <FormattedMessage id="app.manual.step-editor.attachments-need-save" />
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>

                            <div className="manual-step-controls">
                                {!('sharedStep' in step) && (
                                    <Whisper
                                        placement="top"
                                        speaker={(
                                            <Tooltip>
                                                <FormattedMessage id="app.manual.step-editor.attachments" />
                                            </Tooltip>
                                        )}
                                    >
                                        <IconButton
                                            size="xs"
                                            appearance="subtle"
                                            icon={<AttachmentIcon />}
                                            onClick={() => toggleAttachments(index)}
                                            aria-label={intl.formatMessage({ id: 'app.manual.step-editor.attachments' })}
                                        />
                                    </Whisper>
                                )}
                                <IconButton
                                    size="xs"
                                    appearance="subtle"
                                    icon={<TrashIcon />}
                                    onClick={() => removeStep(index)}
                                    aria-label={intl.formatMessage({ id: 'app.manual.step-editor.remove' })}
                                />
                            </div>
                        </li>
                    );
                })}
            </ol>

            {(!steps || steps.length === 0) && (
                <div className="app-alert app-alert-info">
                    <FormattedMessage id="app.manual.step-editor.empty" />
                </div>
            )}

            <div className="manual-step-editor-actions">
                <Button className="btn-secondary" onClick={addStep} startIcon={<PlusIcon />}>
                    <FormattedMessage id="app.manual.step-editor.add-step" />
                </Button>
                <Button className="btn-ghost" onClick={addSharedStep} startIcon={<PlusIcon />}>
                    <FormattedMessage id="app.manual.step-editor.add-shared-step" />
                </Button>
            </div>
            <p className="page-help-text">
                <FormattedMessage id="app.manual.step-editor.drag-help" />
            </p>
        </div>
    );
};

ManualStepEditor.propTypes = {
    steps: PropTypes.array,
    onChange: PropTypes.func,
    sharedSteps: PropTypes.array,
    readOnly: PropTypes.bool,
    attachmentOwner: PropTypes.object,
};

export default ManualStepEditor;
