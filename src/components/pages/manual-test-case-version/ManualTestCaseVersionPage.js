import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { Loader, Message, useToaster, SelectPicker, Panel, Tag } from 'rsuite';
import { FormattedMessage, useIntl } from 'react-intl';
import { ManualTestCaseRequests } from 'angles-javascript-client';
import { getApiErrorMessage } from '../../../utility/ApiUtilities';
import ManualStepEditor from '../../features/manual-step-editor/ManualStepEditor';
import CustomFieldForm from '../../features/custom-field-form/CustomFieldForm';
import VersionBadge from '../../features/version-badge/VersionBadge';
import VersionDiff from '../../features/version-diff/VersionDiff';

/*
 * Read-only view of one frozen version, with an optional diff against another.
 *
 * Everything here renders from the version document rather than the live case: that is the
 * whole point of the frozen collection, and re-reading the head would defeat it. The step
 * editor and custom field form are reused in readOnly mode so a version renders exactly the
 * way the case does, including the field labels that were in force at the time.
 */
const ManualTestCaseVersionPage = function ({ caseId, version }) {
    const intl = useIntl();
    const toaster = useToaster();

    const [frozen, setFrozen] = useState(undefined);
    const [versions, setVersions] = useState([]);
    const [compareTo, setCompareTo] = useState(undefined);
    const [compareVersion, setCompareVersion] = useState(undefined);
    const [loading, setLoading] = useState(true);

    const manualTestCaseRequests = new ManualTestCaseRequests(axios);
    const versionNumber = Number(version);

    const pushError = (error, fallbackId) => {
        toaster.push(
            <Message type="error">
                {getApiErrorMessage(error, intl.formatMessage({ id: fallbackId }))}
            </Message>,
            { placement: 'topEnd' },
        );
    };

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const [frozenResponse, versionsResponse] = await Promise.all([
                manualTestCaseRequests.getVersion(caseId, versionNumber),
                manualTestCaseRequests.getVersions(caseId),
            ]);
            setFrozen(frozenResponse);
            setVersions(versionsResponse.versions || []);
        } catch (error) {
            pushError(error, 'page.manual-test-case-version.toast.fetch-error');
        } finally {
            setLoading(false);
        }
    }, [caseId, versionNumber]);

    useEffect(() => { load(); }, [load]);

    const handleCompare = async (value) => {
        setCompareTo(value);
        if (!value) {
            setCompareVersion(undefined);
            return;
        }
        try {
            const other = await manualTestCaseRequests.getVersion(caseId, value);
            setCompareVersion(other);
        } catch (error) {
            pushError(error, 'page.manual-test-case-version.toast.compare-error');
            setCompareVersion(undefined);
        }
    };

    if (loading) {
        return (
            <div className="app-alert app-alert-info">
                <Loader content={intl.formatMessage({ id: 'app.manual.loading' })} />
            </div>
        );
    }

    if (!frozen) {
        return (
            <div className="app-alert app-alert-error">
                <FormattedMessage id="page.manual-test-case-version.not-found" />
            </div>
        );
    }

    const latestVersion = versions.length > 0
        ? Math.max(...versions.map((entry) => entry.version)) : versionNumber;

    const compareOptions = versions
        .filter((entry) => entry.version !== versionNumber)
        .map((entry) => ({
            label: intl.formatMessage(
                { id: 'page.manual-test-case-detail.version-option' },
                { version: entry.version },
            ),
            value: entry.version,
        }));

    // The diff always reads oldest-to-newest regardless of which side was picked, so
    // "before" and "after" mean what they say.
    const [diffLeft, diffRight] = compareVersion && compareVersion.version < frozen.version
        ? [compareVersion, frozen] : [frozen, compareVersion];

    return (
        <div className="page manual-test-case-version-page">
            <div className="page-detail-header">
                <span className="page-detail-header-title">{frozen.title}</span>
                <VersionBadge version={frozen.version} latestVersion={latestVersion} />
                <Link className="link-action" href={`/manual-test-cases/${caseId}`}>
                    <FormattedMessage id="page.manual-test-case-version.back-to-case" />
                </Link>
            </div>

            <div className="app-alert app-alert-info">
                <FormattedMessage id="page.manual-test-case-version.frozen-notice" />
            </div>

            <div className="page-panel">
                <div className="page-toolbar">
                    <SelectPicker
                        label={<FormattedMessage id="page.manual-test-case-version.compare-with" />}
                        data={compareOptions}
                        value={compareTo}
                        searchable={false}
                        style={{ width: 260 }}
                        onChange={handleCompare}
                    />
                </div>

                {compareVersion && (
                    <div className="page-section">
                        <VersionDiff left={diffLeft} right={diffRight} />
                    </div>
                )}
            </div>

            <Panel className="page-panel" header={<FormattedMessage id="page.manual-test-case-detail.tab.details" />}>
                <div className="detail-row">
                    <span><FormattedMessage id="app.manual.field.description" /></span>
                    <span>{frozen.description || '-'}</span>
                </div>
                <div className="detail-row">
                    <span><FormattedMessage id="app.manual.field.preconditions" /></span>
                    <span>{frozen.preconditions || '-'}</span>
                </div>
                <div className="detail-row">
                    <span><FormattedMessage id="app.manual.field.priority" /></span>
                    <span>
                        {frozen.priority
                            ? <FormattedMessage id={`app.manual.priority.${frozen.priority.toLowerCase()}`} />
                            : '-'}
                    </span>
                </div>
                <div className="detail-row">
                    <span><FormattedMessage id="app.manual.field.tags" /></span>
                    <span>
                        {(frozen.tags || []).map((tag) => <Tag key={tag}>{tag}</Tag>)}
                    </span>
                </div>
                <CustomFieldForm
                    definitions={frozen.fieldDefinitions || []}
                    values={frozen.customFields || {}}
                    onChange={() => {}}
                    disabled
                />
            </Panel>

            <Panel className="page-panel" header={<FormattedMessage id="page.manual-test-case-detail.tab.steps" />}>
                <ManualStepEditor steps={frozen.steps || []} onChange={() => {}} readOnly />
            </Panel>
        </div>
    );
};

export default ManualTestCaseVersionPage;
