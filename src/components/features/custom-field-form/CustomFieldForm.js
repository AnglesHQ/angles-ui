import React from 'react';
import PropTypes from 'prop-types';
import { Input, InputNumber, Toggle, SelectPicker, TagPicker, DatePicker } from 'rsuite';
import { FormattedMessage } from 'react-intl';

/**
 * Renders the inputs for a team's configured custom fields.
 *
 * The definitions come from the API rather than being hard-coded, so an admin adding a
 * field makes it appear here with no UI change. Archived fields are rendered only when the
 * case already holds a value for one - they are on their way out, so they should not be
 * offered for new input, but an existing value still has to be visible and editable.
 */
const CustomFieldForm = ({ definitions, values, onChange, users, disabled }) => {
    const setValue = (key, value) => {
        onChange({ ...(values || {}), [key]: value });
    };

    const visible = (definitions || []).filter((definition) => !definition.archived
        || (values && values[definition.key] !== undefined && values[definition.key] !== null));

    if (visible.length === 0) return null;

    const renderInput = (definition) => {
        const value = values ? values[definition.key] : undefined;
        const common = { disabled, block: true };

        switch (definition.type) {
            case 'textarea':
                return (
                    <Input
                        as="textarea"
                        rows={3}
                        value={value || ''}
                        onChange={(next) => setValue(definition.key, next)}
                        disabled={disabled}
                    />
                );
            case 'number':
                return (
                    <InputNumber
                        value={value === undefined || value === null ? '' : value}
                        onChange={(next) => setValue(definition.key, next === '' ? null : Number(next))}
                        disabled={disabled}
                    />
                );
            case 'boolean':
                return (
                    <Toggle
                        checked={Boolean(value)}
                        onChange={(next) => setValue(definition.key, next)}
                        disabled={disabled}
                    />
                );
            case 'date':
                return (
                    <DatePicker
                        value={value ? new Date(value) : null}
                        onChange={(next) => setValue(definition.key, next ? next.toISOString() : null)}
                        disabled={disabled}
                        block
                    />
                );
            case 'select':
                return (
                    <SelectPicker
                        data={(definition.options || []).map((option) => ({ label: option, value: option }))}
                        value={value === undefined ? null : value}
                        onChange={(next) => setValue(definition.key, next)}
                        {...common}
                    />
                );
            case 'multiselect':
                return (
                    <TagPicker
                        data={(definition.options || []).map((option) => ({ label: option, value: option }))}
                        value={Array.isArray(value) ? value : []}
                        onChange={(next) => setValue(definition.key, next)}
                        {...common}
                    />
                );
            case 'user':
                return (
                    <SelectPicker
                        data={(users || []).map((user) => ({ label: user.username, value: user._id }))}
                        value={value === undefined ? null : value}
                        onChange={(next) => setValue(definition.key, next)}
                        {...common}
                    />
                );
            default:
                return (
                    <Input
                        value={value || ''}
                        onChange={(next) => setValue(definition.key, next)}
                        disabled={disabled}
                    />
                );
        }
    };

    return (
        <div className="custom-field-form">
            {visible.map((definition) => (
                <div className="custom-field-row" key={definition.key}>
                    <label className="custom-field-label" htmlFor={`custom-field-${definition.key}`}>
                        {definition.label}
                        {definition.required && <span className="custom-field-required">*</span>}
                        {definition.archived && (
                            <span className="custom-field-archived">
                                <FormattedMessage id="app.manual.custom-field.archived" />
                            </span>
                        )}
                    </label>
                    <div className="custom-field-input" id={`custom-field-${definition.key}`}>
                        {renderInput(definition)}
                    </div>
                </div>
            ))}
        </div>
    );
};

CustomFieldForm.propTypes = {
    definitions: PropTypes.array,
    values: PropTypes.object,
    onChange: PropTypes.func,
    users: PropTypes.array,
    disabled: PropTypes.bool,
};

export default CustomFieldForm;
