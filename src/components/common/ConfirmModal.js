'use client';

import React from 'react';
import { Modal, Button, ButtonToolbar } from 'rsuite';

/**
 * ConfirmModal — a themed confirmation dialog that replaces window.confirm().
 *
 * Props:
 *   open       {boolean}  — controls visibility
 *   title      {string}   — modal heading (e.g. "Delete User")
 *   message    {string}   — body text asking the user to confirm
 *   confirmLabel {string} — label for the confirm button (default: "Confirm")
 *   cancelLabel  {string} — label for the cancel button (default: "Cancel")
 *   onConfirm  {function} — called when the user clicks the confirm button
 *   onCancel   {function} — called when the user cancels or closes the modal
 */
export default function ConfirmModal({
    open,
    title = 'Are you sure?',
    message,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    onConfirm,
    onCancel,
}) {
    return (
        <Modal size="xs" open={open} onClose={onCancel} className="confirm-modal">
            <Modal.Header>
                <Modal.Title className="confirm-modal-title">{title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p className="confirm-modal-message">{message}</p>
            </Modal.Body>
            <Modal.Footer>
                <ButtonToolbar className="confirm-modal-actions">
                    <Button className="filter-submit-button" onClick={onConfirm}>
                        {confirmLabel}
                    </Button>
                    <Button className="filter-cancel-button" onClick={onCancel}>
                        {cancelLabel}
                    </Button>
                </ButtonToolbar>
            </Modal.Footer>
        </Modal>
    );
}
