import React, { useState } from 'react';
import axios from 'axios';
import { Modal, Form, Button, TagInput } from 'rsuite';
import { FormattedMessage, useIntl } from 'react-intl';

// The API's rule for team and component names (see the angles team routes).
const NAME_PATTERN = /^[A-Za-z0-9-]{2,50}$/;

// Lets an admin create a team. The API requires at least one component, so the form
// asks for the first ones up front; more can be added afterwards on the page itself.
function CreateTeamModal(props) {
    const { open, onClose, onCreated } = props;
    const intl = useIntl();

    const [name, setName] = useState('');
    const [components, setComponents] = useState([]);
    const [pendingComponentText, setPendingComponentText] = useState('');
    const [componentInputKey, setComponentInputKey] = useState(0);
    const [saving, setSaving] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const reset = () => {
        setName('');
        setComponents([]);
        setPendingComponentText('');
        setComponentInputKey((key) => key + 1);
        setErrorMessage('');
    };

    const handleClose = () => {
        if (saving) return;
        reset();
        onClose();
    };

    // A component typed but not yet confirmed with enter still counts, as it does when
    // adding components to an existing team.
    const trimmedPending = pendingComponentText.trim();
    const allComponents = trimmedPending && !components.includes(trimmedPending)
        ? [...components, trimmedPending]
        : components;
    const trimmedName = name.trim();
    const nameInvalid = trimmedName.length > 0 && !NAME_PATTERN.test(trimmedName);
    const invalidComponents = allComponents.filter((component) => !NAME_PATTERN.test(component));
    const canCreate = NAME_PATTERN.test(trimmedName)
        && allComponents.length > 0
        && invalidComponents.length === 0;

    const handleCreate = async () => {
        if (!canCreate) return;
        setSaving(true);
        setErrorMessage('');
        try {
            const response = await axios.post('/team', {
                name: trimmedName,
                components: allComponents.map((component) => ({ name: component })),
            });
            reset();
            onCreated(response.data);
        } catch (error) {
            // 422 (validation) answers { errors: [{ msg }] }; 409 (name taken) { message }.
            setErrorMessage(
                error.response?.data?.errors?.[0]?.msg
                || error.response?.data?.message
                || intl.formatMessage({ id: 'page.team-settings.toast.create-error' }),
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal open={open} onClose={handleClose}>
            <Modal.Header>
                <Modal.Title><FormattedMessage id="page.team-settings.create-modal.title" /></Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form fluid>
                    <Form.Group>
                        <Form.ControlLabel><FormattedMessage id="page.team-settings.label.name" /></Form.ControlLabel>
                        <Form.Control
                            name="newTeamName"
                            value={name}
                            onChange={(value) => setName(value)}
                            disabled={saving}
                        />
                        <Form.HelpText>
                            {nameInvalid ? (
                                <span className="form-error-text">
                                    <FormattedMessage id="page.team-settings.create-modal.name-help" />
                                </span>
                            ) : (
                                <FormattedMessage id="page.team-settings.create-modal.name-help" />
                            )}
                        </Form.HelpText>
                    </Form.Group>
                    <Form.Group>
                        <Form.ControlLabel><FormattedMessage id="page.team-settings.section.components" /></Form.ControlLabel>
                        <TagInput
                            key={componentInputKey}
                            value={components}
                            onChange={(value) => setComponents(value || [])}
                            onSearch={setPendingComponentText}
                            placeholder={intl.formatMessage({ id: 'page.team-settings.components.add-placeholder' })}
                            disabled={saving}
                            block
                        />
                        <Form.HelpText>
                            {invalidComponents.length > 0 ? (
                                <span className="form-error-text">
                                    <FormattedMessage
                                        id="page.team-settings.create-modal.components-invalid"
                                        values={{ names: invalidComponents.join(', ') }}
                                    />
                                </span>
                            ) : (
                                <FormattedMessage id="page.team-settings.create-modal.components-help" />
                            )}
                        </Form.HelpText>
                    </Form.Group>
                </Form>
                {errorMessage && (
                    <div className="app-alert app-alert-error">{errorMessage}</div>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button className="btn-primary" onClick={handleCreate} loading={saving} disabled={!canCreate}>
                    <FormattedMessage id="page.team-settings.button.create-team" />
                </Button>
                <Button className="btn-secondary" onClick={handleClose} disabled={saving}>
                    <FormattedMessage id="page.team-settings.button.cancel" />
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default CreateTeamModal;
