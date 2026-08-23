import React, { useState } from 'react';
import Link from 'next/link';
import { Table, Tag, IconButton } from 'rsuite';
import FolderFillIcon from '@rsuite/icons/FolderFill';
import ArrowDownIcon from '@rsuite/icons/ArrowDown';
import ArrowRightIcon from '@rsuite/icons/ArrowRight';
import { FormattedMessage } from 'react-intl';
import { UNFILED } from '../folder-tree/FolderTree';
import { CASE_MIME } from './dragTypes';

const { Column, HeaderCell, Cell } = Table;

/*
Test cases grouped into one table per folder, mirroring the folder tree.

A single flat table cannot show where a case lives, which matters once cases are filed:
the tree says a folder holds twelve cases, and the list beside it has to make the same
claim visibly. Each folder that has cases on the current page becomes its own section.

Grouping is done over the page the API returned rather than over the whole team. The list
endpoint sorts by folder before recency for exactly this reason, so a page arrives as
whole folders instead of an interleaved slice that would repeat the same heading on
several pages.
 */

/*
Orders sections the way the tree reads top to bottom.

Sections are keyed by folder id, but the folders arrive nested, so a depth-first walk of
the tree gives the order; anything left over (a folder the tree no longer lists) is
appended rather than dropped, and unfiled cases sort last.
 */
export const orderSections = (folders, sectionKeys) => {
    const ordered = [];
    const walk = (nodes) => {
        (nodes || []).forEach((node) => {
            ordered.push(node._id.toString());
            walk(node.children);
        });
    };
    walk(folders);
    const known = ordered.filter((id) => sectionKeys.includes(id));
    const leftovers = sectionKeys.filter((key) => key !== UNFILED && !ordered.includes(key));
    return [...known, ...leftovers, ...(sectionKeys.includes(UNFILED) ? [UNFILED] : [])];
};

/*
"Checkout / Refunds" rather than just "Refunds".

A section heading is read without the tree's indentation to lean on, so a bare leaf name
is ambiguous the moment two folders share one.
 */
export const buildFolderLabel = (folder, byId) => {
    const names = (folder.path || [])
        .map((ancestorId) => byId.get(ancestorId.toString()))
        .filter(Boolean)
        .map((ancestor) => ancestor.name);
    return [...names, folder.name].join(' / ');
};

// Flattens the nested tree into a lookup, so a section can resolve its own ancestors.
export const indexFolders = (folders) => {
    const byId = new Map();
    const walk = (nodes) => {
        (nodes || []).forEach((node) => {
            byId.set(node._id.toString(), node);
            walk(node.children);
        });
    };
    walk(folders);
    return byId;
};

const TestCaseSuites = ({
    testCases, folders, onOpen, onMoveCase, collapsedIds, onToggleCollapse,
}) => {
    const [dropTarget, setDropTarget] = useState(undefined);
    const byId = indexFolders(folders);

    // Group the page by folder. An unfiled case has folder null, which cannot key an
    // object, so it gets the same sentinel the tree and the API already use.
    const grouped = {};
    (testCases || []).forEach((testCase) => {
        const key = testCase.folder ? testCase.folder.toString() : UNFILED;
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(testCase);
    });

    const sectionKeys = orderSections(folders, Object.keys(grouped));

    const labelFor = (key) => {
        if (key === UNFILED) {
            return <FormattedMessage id="app.manual.folders.unfiled" />;
        }
        const folder = byId.get(key);
        // A folder the tree has not loaded yet still has cases to show, so the section is
        // rendered with a neutral heading rather than being hidden.
        return folder ? buildFolderLabel(folder, byId) : <FormattedMessage id="app.manual.folders.unknown" />;
    };

    const handleDragStart = (event, testCase) => {
        event.dataTransfer.setData(CASE_MIME, testCase._id);
        // Some browsers only expose a drag as valid once text/plain is also set.
        event.dataTransfer.setData('text/plain', testCase.title || testCase._id);
        event.dataTransfer.effectAllowed = 'move';
    };

    const isCaseDrag = (event) => event.dataTransfer.types.includes(CASE_MIME);

    const handleDragOver = (event, key) => {
        if (!isCaseDrag(event)) return;
        // Only preventDefault marks this a valid drop target.
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
        setDropTarget(key);
    };

    const handleDrop = (event, key) => {
        if (!isCaseDrag(event)) return;
        event.preventDefault();
        setDropTarget(undefined);
        const caseId = event.dataTransfer.getData(CASE_MIME);
        if (!caseId) return;
        // Dropping a case back into the folder it already sits in is a no-op, not a
        // request the server needs to hear about.
        const dragged = (testCases || []).find((testCase) => testCase._id === caseId);
        const currentKey = dragged && dragged.folder ? dragged.folder.toString() : UNFILED;
        if (currentKey === key) return;
        onMoveCase(caseId, key === UNFILED ? null : key);
    };

    return (
        <div className="test-case-suites">
            {sectionKeys.map((key) => {
                const collapsed = collapsedIds.includes(key);
                const rows = grouped[key] || [];
                return (
                    <div
                        key={key}
                        className={`test-case-suite${dropTarget === key ? ' test-case-suite-drop' : ''}`}
                        onDragOver={(event) => handleDragOver(event, key)}
                        onDragLeave={() => setDropTarget(undefined)}
                        onDrop={(event) => handleDrop(event, key)}
                    >
                        <div
                            className="test-case-suite-header"
                            onClick={() => onToggleCollapse(key)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(event) => {
                                if (event.key === 'Enter' || event.key === ' ') onToggleCollapse(key);
                            }}
                        >
                            <IconButton
                                size="xs"
                                appearance="subtle"
                                icon={collapsed ? <ArrowRightIcon /> : <ArrowDownIcon />}
                            />
                            {key !== UNFILED && <FolderFillIcon className="test-case-suite-icon" />}
                            <span className="test-case-suite-title">{labelFor(key)}</span>
                            <span className="test-case-suite-count">{rows.length}</span>
                        </div>

                        {!collapsed && (
                            <Table
                                data={rows}
                                autoHeight
                                rowHeight={44}
                                onRowClick={(row) => onOpen(row._id)}
                            >
                                <Column flexGrow={3} align="left">
                                    <HeaderCell><FormattedMessage id="page.manual-test-cases.table.title" /></HeaderCell>
                                    <Cell>
                                        {(row) => (
                                            <span
                                                className="test-case-suite-row"
                                                draggable
                                                onDragStart={(event) => handleDragStart(event, row)}
                                                // The row is a link; without this the browser
                                                // drags the href instead of starting a move.
                                                onClick={(event) => event.stopPropagation()}
                                            >
                                                <span className="test-case-suite-grip" aria-hidden="true">⠿</span>
                                                <Link className="link-action" href={`/manual-test-cases/${row._id}`}>
                                                    {row.title}
                                                </Link>
                                            </span>
                                        )}
                                    </Cell>
                                </Column>
                                <Column width={120} align="left">
                                    <HeaderCell><FormattedMessage id="page.manual-test-cases.table.status" /></HeaderCell>
                                    <Cell>
                                        {(row) => (
                                            <Tag className={`manual-status-tag manual-status-${row.status.toLowerCase()}`}>
                                                <FormattedMessage id={`app.manual.status.${row.status.toLowerCase()}`} />
                                            </Tag>
                                        )}
                                    </Cell>
                                </Column>
                                <Column width={110} align="left">
                                    <HeaderCell><FormattedMessage id="page.manual-test-cases.table.priority" /></HeaderCell>
                                    <Cell>
                                        {(row) => (
                                            <FormattedMessage id={`app.manual.priority.${row.priority.toLowerCase()}`} />
                                        )}
                                    </Cell>
                                </Column>
                                <Column width={80} align="center">
                                    <HeaderCell><FormattedMessage id="page.manual-test-cases.table.version" /></HeaderCell>
                                    <Cell>{(row) => `v${row.version}`}</Cell>
                                </Column>
                                <Column width={160} align="left">
                                    <HeaderCell><FormattedMessage id="page.manual-test-cases.table.updated-by" /></HeaderCell>
                                    <Cell>{(row) => (row.updatedBy ? row.updatedBy.username : '—')}</Cell>
                                </Column>
                                <Column width={80} align="center">
                                    <HeaderCell><FormattedMessage id="page.manual-test-cases.table.steps" /></HeaderCell>
                                    <Cell>{(row) => (row.steps ? row.steps.length : 0)}</Cell>
                                </Column>
                            </Table>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default TestCaseSuites;
