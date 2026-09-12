import React, { useState } from 'react';
import { Tree, IconButton, Whisper, Tooltip, Modal, Button, Form, Input, Loader } from 'rsuite';
import FolderFillIcon from '@rsuite/icons/FolderFill';
import PlusIcon from '@rsuite/icons/Plus';
import EditIcon from '@rsuite/icons/Edit';
import TrashIcon from '@rsuite/icons/Trash';
import { FormattedMessage, useIntl } from 'react-intl';
import { CASE_MIME } from '../test-case-suites/dragTypes';

/*
Folder tree for manual test cases.

The API already returns the tree nested with a per-folder count, so this renders what it is
given rather than reassembling it. A synthetic "All test cases" root sits above the real
folders: cases that have never been filed have to stay reachable, and a tree with no way
back to everything is a trap.

Selecting a folder reports its id upward; the synthetic entries report undefined (all) and
'none' (unfiled), which is what the list endpoint expects.
 */
export const ALL_FOLDERS = '__all__';
export const UNFILED = 'none';

const FolderTree = ({
    folders, unfiledCount, totalCount, value, onSelect, onCreate, onRename, onDelete, loading,
    onDropCase,
}) => {
    const intl = useIntl();
    const [dialog, setDialog] = useState(undefined);
    const [name, setName] = useState('');
    const [busy, setBusy] = useState(false);
    const [dropTarget, setDropTarget] = useState(undefined);

    // Only a dragged test case is a valid drop; anything else dragged over the tree (a
    // file, selected text) has to keep its default browser behaviour.
    const isCaseDrag = (event) => event.dataTransfer.types.includes(CASE_MIME);

    const handleDragOver = (event, key) => {
        if (!onDropCase || !isCaseDrag(event)) return;
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
        setDropTarget(key);
    };

    const handleDrop = (event, key) => {
        if (!onDropCase || !isCaseDrag(event)) return;
        event.preventDefault();
        // Stop the drop bubbling to an ancestor folder row, which would otherwise file
        // the case into the parent as well as the folder actually aimed at.
        event.stopPropagation();
        setDropTarget(undefined);
        const caseId = event.dataTransfer.getData(CASE_MIME);
        if (caseId) onDropCase(caseId, key === UNFILED ? null : key);
    };

    // Shared by every droppable row, real or synthetic.
    const dropProps = (key) => ({
        onDragOver: (event) => handleDragOver(event, key),
        onDragLeave: () => setDropTarget(undefined),
        onDrop: (event) => handleDrop(event, key),
    });

    // RSuite's Tree wants a uniform node shape, so the two synthetic rows are mapped into
    // the same shape as a real folder rather than rendered separately.
    const toNode = (folder) => ({
        value: folder._id,
        label: folder.name,
        count: folder.testCaseCount,
        folder,
        children: (folder.children || []).map(toNode),
    });

    const data = [
        {
            value: ALL_FOLDERS,
            label: intl.formatMessage({ id: 'app.manual.folders.all' }),
            count: totalCount,
            synthetic: true,
        },
        {
            value: UNFILED,
            label: intl.formatMessage({ id: 'app.manual.folders.unfiled' }),
            count: unfiledCount,
            synthetic: true,
        },
        ...(folders || []).map(toNode),
    ];

    const openDialog = (mode, folder) => {
        setDialog({ mode, folder });
        setName(mode === 'rename' && folder ? folder.name : '');
    };

    const closeDialog = () => {
        setDialog(undefined);
        setName('');
    };

    const submit = async () => {
        if (!dialog || !name.trim()) return;
        setBusy(true);
        try {
            if (dialog.mode === 'rename') {
                await onRename(dialog.folder, name.trim());
            } else {
                // A null folder on "create" means a new root; otherwise it nests under the
                // folder whose + was clicked, which is how depth is added.
                await onCreate(dialog.folder ? dialog.folder._id : null, name.trim());
            }
            closeDialog();
        } finally {
            setBusy(false);
        }
    };

    const renderNode = (node) => {
        if (node.synthetic) {
            // "All test cases" is a view, not a place - there is nothing to file into, so
            // only the unfiled row accepts a drop (it means "take this out of its folder").
            const droppable = node.value === UNFILED;
            return (
                <span
                    className={`folder-tree-node${dropTarget === node.value ? ' folder-tree-node-drop' : ''}`}
                    {...(droppable ? dropProps(node.value) : {})}
                >
                    <span className="folder-tree-label">{node.label}</span>
                    <span className="folder-tree-count">{node.count}</span>
                </span>
            );
        }
        return (
            <span
                className={`folder-tree-node${dropTarget === node.value ? ' folder-tree-node-drop' : ''}`}
                {...dropProps(node.value)}
            >
                <FolderFillIcon className="folder-tree-icon" />
                <span className="folder-tree-label">{node.label}</span>
                <span className="folder-tree-count">{node.count}</span>
                <span className="folder-tree-actions">
                    <Whisper
                        placement="top"
                        speaker={<Tooltip><FormattedMessage id="app.manual.folders.add-sub" /></Tooltip>}
                    >
                        <IconButton
                            size="xs"
                            appearance="subtle"
                            icon={<PlusIcon />}
                            onClick={(event) => { event.stopPropagation(); openDialog('create', node.folder); }}
                        />
                    </Whisper>
                    <Whisper
                        placement="top"
                        speaker={<Tooltip><FormattedMessage id="app.manual.folders.rename" /></Tooltip>}
                    >
                        <IconButton
                            size="xs"
                            appearance="subtle"
                            icon={<EditIcon />}
                            onClick={(event) => { event.stopPropagation(); openDialog('rename', node.folder); }}
                        />
                    </Whisper>
                    <Whisper
                        placement="top"
                        speaker={<Tooltip><FormattedMessage id="app.manual.folders.delete" /></Tooltip>}
                    >
                        <IconButton
                            size="xs"
                            appearance="subtle"
                            icon={<TrashIcon />}
                            onClick={(event) => { event.stopPropagation(); onDelete(node.folder); }}
                        />
                    </Whisper>
                </span>
            </span>
        );
    };

    return (
        <div className="folder-tree">
            <div className="folder-tree-header">
                <span className="page-section-title">
                    <FormattedMessage id="app.manual.folders.title" />
                </span>
                <Whisper
                    placement="top"
                    speaker={<Tooltip><FormattedMessage id="app.manual.folders.add-root" /></Tooltip>}
                >
                    <IconButton
                        size="xs"
                        appearance="subtle"
                        icon={<PlusIcon />}
                        onClick={() => openDialog('create', undefined)}
                    />
                </Whisper>
            </div>

            {loading ? <Loader content={intl.formatMessage({ id: 'app.manual.loading' })} /> : (
                <Tree
                    data={data}
                    value={value || ALL_FOLDERS}
                    labelKey="label"
                    valueKey="value"
                    childrenKey="children"
                    defaultExpandAll
                    renderTreeNode={renderNode}
                    onSelect={(node) => onSelect(node.value)}
                />
            )}

            <Modal open={!!dialog} size="xs" onClose={closeDialog}>
                <Modal.Header>
                    <Modal.Title>
                        <FormattedMessage
                            id={dialog && dialog.mode === 'rename'
                                ? 'app.manual.folders.rename-title'
                                : 'app.manual.folders.create-title'}
                        />
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {dialog && dialog.mode === 'create' && dialog.folder && (
                        <div className="folder-tree-parent-hint">
                            <FormattedMessage
                                id="app.manual.folders.creating-under"
                                values={{ name: dialog.folder.name }}
                            />
                        </div>
                    )}
                    <Form fluid>
                        <Form.Group>
                            <Form.ControlLabel>
                                <FormattedMessage id="app.manual.folders.name" />
                            </Form.ControlLabel>
                            <Input value={name} onChange={setName} />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button className="btn-secondary" onClick={closeDialog}>
                        <FormattedMessage id="app.manual.cancel" />
                    </Button>
                    <Button
                        className="btn-primary"
                        loading={busy}
                        disabled={!name.trim()}
                        onClick={submit}
                    >
                        <FormattedMessage id="app.manual.save" />
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default FolderTree;
