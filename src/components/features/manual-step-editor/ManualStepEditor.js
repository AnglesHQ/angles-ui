import React from 'react';
import PropTypes from 'prop-types';
import { Input, IconButton, Button, SelectPicker, Tag } from 'rsuite';
import ArrowUpIcon from '@rsuite/icons/ArrowUp';
import ArrowDownIcon from '@rsuite/icons/ArrowDown';
import TrashIcon from '@rsuite/icons/Trash';
import PlusIcon from '@rsuite/icons/Plus';
import { FormattedMessage, useIntl } from 'react-intl';

/**
 * Ordered editor for a test case's steps.
 *
 * A step is either literal (action + expected result) or an inclusion of a shared step,
 * in which case its own text is ignored and the shared step's steps take its place when
 * the case is read expanded or frozen into a version. The two are rendered differently so
 * an author can see at a glance which steps they actually control here.
 *
 * Order is managed with explicit move buttons rather than drag-and-drop: the list is
 * keyboard-navigable, needs no extra dependency, and step order is load-bearing (a step
 * result binds to a step by id, but the tester follows them top to bottom).
 */
const ManualStepEditor = ({ steps, onChange, sharedSteps, readOnly }) => {
    const intl = useIntl();

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

    const moveStep = (index, direction) => {
        const target = index + direction;
        if (target < 0 || target >= steps.length) return;
        const next = [...steps];
        [next[index], next[target]] = [next[target], next[index]];
        onChange(next);
    };

    if (readOnly) {
        return (
            <ol className="manual-step-editor manual-step-editor-readonly">
                {(steps || []).map((step, index) => (
                    // eslint-disable-next-line react/no-array-index-key
                    <li className="manual-step" key={step._id || index}>
                        <div className="manual-step-body">
                            <div className="manual-step-action">{step.action}</div>
                            {step.expected && (
                                <div className="manual-step-expected">
                                    <span className="manual-step-label">
                                        <FormattedMessage id="app.manual.step-editor.expected" />
                                    </span>
                                    {step.expected}
                                </div>
                            )}
                            {step.data && (
                                <div className="manual-step-data">
                                    <span className="manual-step-label">
                                        <FormattedMessage id="app.manual.step-editor.data" />
                                    </span>
                                    {step.data}
                                </div>
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
            <ol className="manual-step-list">
                {(steps || []).map((step, index) => (
                    // eslint-disable-next-line react/no-array-index-key
                    <li className="manual-step" key={step._id || index}>
                        <div className="manual-step-controls">
                            <IconButton
                                size="xs"
                                icon={<ArrowUpIcon />}
                                disabled={index === 0}
                                onClick={() => moveStep(index, -1)}
                                aria-label={intl.formatMessage({ id: 'app.manual.step-editor.move-up' })}
                            />
                            <IconButton
                                size="xs"
                                icon={<ArrowDownIcon />}
                                disabled={index === steps.length - 1}
                                onClick={() => moveStep(index, 1)}
                                aria-label={intl.formatMessage({ id: 'app.manual.step-editor.move-down' })}
                            />
                            <IconButton
                                size="xs"
                                icon={<TrashIcon />}
                                onClick={() => removeStep(index)}
                                aria-label={intl.formatMessage({ id: 'app.manual.step-editor.remove' })}
                            />
                        </div>

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
                                    <Input
                                        as="textarea"
                                        rows={2}
                                        value={step.action || ''}
                                        onChange={(value) => updateStep(index, { action: value })}
                                        placeholder={intl.formatMessage({ id: 'app.manual.step-editor.action-placeholder' })}
                                    />
                                    <Input
                                        as="textarea"
                                        rows={2}
                                        value={step.expected || ''}
                                        onChange={(value) => updateStep(index, { expected: value })}
                                        placeholder={intl.formatMessage({ id: 'app.manual.step-editor.expected-placeholder' })}
                                    />
                                    <Input
                                        value={step.data || ''}
                                        onChange={(value) => updateStep(index, { data: value })}
                                        placeholder={intl.formatMessage({ id: 'app.manual.step-editor.data-placeholder' })}
                                    />
                                </>
                            )}
                        </div>
                    </li>
                ))}
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
        </div>
    );
};

ManualStepEditor.propTypes = {
    steps: PropTypes.array,
    onChange: PropTypes.func,
    sharedSteps: PropTypes.array,
    readOnly: PropTypes.bool,
};

export default ManualStepEditor;
