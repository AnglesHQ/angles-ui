import React from 'react';
import PropTypes from 'prop-types';
import { Tag } from 'rsuite';
import { FormattedMessage } from 'react-intl';

/**
 * Shows which version of a test case is being looked at, and how far behind the latest it
 * is. Displayed anywhere a bound version is rendered - a run's execution view, or a
 * historical version - because "v3" alone does not tell a QA whether what they are reading
 * is current.
 */
const VersionBadge = ({ version, latestVersion, onClick }) => {
    if (!version) return null;
    const behind = latestVersion && latestVersion > version ? latestVersion - version : 0;
    const isCurrent = behind === 0;

    return (
        <span className="version-badge">
            <Tag
                className={isCurrent ? 'version-badge-tag' : 'version-badge-tag version-badge-tag-behind'}
                onClick={onClick}
            >
                <FormattedMessage id="app.manual.version-badge.version" values={{ version }} />
                {!isCurrent && (
                    <span className="version-badge-behind">
                        <FormattedMessage
                            id="app.manual.version-badge.behind"
                            values={{ count: behind }}
                        />
                    </span>
                )}
            </Tag>
        </span>
    );
};

VersionBadge.propTypes = {
    version: PropTypes.number,
    latestVersion: PropTypes.number,
    onClick: PropTypes.func,
};

export default VersionBadge;
