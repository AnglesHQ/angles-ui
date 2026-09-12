import React from 'react';
import { Tag } from 'rsuite';
import { FormattedMessage } from 'react-intl';

/*
 * Side-by-side comparison of two frozen test case versions.
 *
 * The diff is computed here rather than server-side because both versions are already
 * loaded for display - asking the API to diff them would be a third round trip for data
 * the page is holding. Steps are compared positionally and reported as one row per
 * position, so an inserted step shows every later position as changed; that is honest
 * about what the tester would have seen rather than pretending to track step identity
 * across an edit.
 */
const FIELDS = ['title', 'description', 'preconditions', 'priority', 'tags'];

const formatValue = (value) => {
    if (value === undefined || value === null || value === '') return null;
    if (Array.isArray(value)) return value.join(', ');
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
};

const sameValue = (left, right) => formatValue(left) === formatValue(right);

const VersionDiff = ({ left, right }) => {
    if (!left || !right) return null;

    const changedFields = FIELDS.filter((field) => !sameValue(left[field], right[field]));

    const leftSteps = left.steps || [];
    const rightSteps = right.steps || [];
    const stepCount = Math.max(leftSteps.length, rightSteps.length);
    const stepRows = [];
    for (let index = 0; index < stepCount; index += 1) {
        const leftStep = leftSteps[index];
        const rightStep = rightSteps[index];
        const changed = !leftStep || !rightStep
            || !sameValue(leftStep.action, rightStep.action)
            || !sameValue(leftStep.expected, rightStep.expected)
            || !sameValue(leftStep.data, rightStep.data);
        if (changed) stepRows.push({ index, leftStep, rightStep });
    }

    const leftFields = left.customFields || {};
    const rightFields = right.customFields || {};
    const customKeys = Array.from(new Set([
        ...Object.keys(leftFields), ...Object.keys(rightFields),
    ])).filter((key) => !sameValue(leftFields[key], rightFields[key]));

    const unchanged = changedFields.length === 0
        && stepRows.length === 0 && customKeys.length === 0;

    if (unchanged) {
        return (
            <div className="app-alert app-alert-info">
                <FormattedMessage id="app.manual.version-diff.identical" />
            </div>
        );
    }

    const renderCell = (value) => {
        const formatted = formatValue(value);
        if (formatted === null) {
            return (
                <span className="version-diff-empty">
                    <FormattedMessage id="app.manual.version-diff.empty" />
                </span>
            );
        }
        return formatted;
    };

    return (
        <div className="version-diff">
            <div className="version-diff-header">
                <Tag><FormattedMessage id="app.manual.version-badge.version" values={{ version: left.version }} /></Tag>
                <span className="version-diff-arrow">→</span>
                <Tag><FormattedMessage id="app.manual.version-badge.version" values={{ version: right.version }} /></Tag>
            </div>

            <table className="version-diff-table">
                <thead>
                    <tr>
                        <th><FormattedMessage id="app.manual.version-diff.field" /></th>
                        <th><FormattedMessage id="app.manual.version-diff.before" /></th>
                        <th><FormattedMessage id="app.manual.version-diff.after" /></th>
                    </tr>
                </thead>
                <tbody>
                    {changedFields.map((field) => (
                        <tr key={field}>
                            <td><FormattedMessage id={`app.manual.field.${field}`} /></td>
                            <td className="version-diff-before">{renderCell(left[field])}</td>
                            <td className="version-diff-after">{renderCell(right[field])}</td>
                        </tr>
                    ))}
                    {customKeys.map((key) => (
                        <tr key={`custom-${key}`}>
                            <td>{key}</td>
                            <td className="version-diff-before">{renderCell(leftFields[key])}</td>
                            <td className="version-diff-after">{renderCell(rightFields[key])}</td>
                        </tr>
                    ))}
                    {stepRows.map(({ index, leftStep, rightStep }) => (
                        <tr key={`step-${index}`}>
                            <td>
                                <FormattedMessage
                                    id="app.manual.version-diff.step"
                                    values={{ number: index + 1 }}
                                />
                            </td>
                            <td className="version-diff-before">
                                {leftStep ? (
                                    <>
                                        <div>{renderCell(leftStep.action)}</div>
                                        <div className="version-diff-expected">{renderCell(leftStep.expected)}</div>
                                    </>
                                ) : renderCell(null)}
                            </td>
                            <td className="version-diff-after">
                                {rightStep ? (
                                    <>
                                        <div>{renderCell(rightStep.action)}</div>
                                        <div className="version-diff-expected">{renderCell(rightStep.expected)}</div>
                                    </>
                                ) : renderCell(null)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default VersionDiff;
