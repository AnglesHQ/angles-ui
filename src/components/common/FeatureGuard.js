'use client';

import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Loader } from 'rsuite';
import { useAuth } from '../../context/AuthContext';

/**
 * Gates a page behind an admin-controlled feature toggle.
 *
 * The toggle arrives with the auth config, so nothing is rendered until it has loaded -
 * without that wait a disabled page would flash on screen before disappearing. When the
 * feature is off the page is replaced with an explanation rather than redirected away,
 * so a bookmarked or shared link says why it no longer works.
 *
 * This is presentation only: the API rejects the underlying routes independently, which
 * is what actually makes the feature inaccessible.
 */
const FeatureGuard = function ({ enabled, loaded, children }) {
    if (!loaded) {
        return (
            <div className="app-alert app-alert-info">
                <Loader />
            </div>
        );
    }

    if (!enabled) {
        return (
            <div className="app-alert app-alert-info">
                <FormattedMessage id="app.feature.disabled" />
            </div>
        );
    }

    return children;
};

/**
 * Convenience wrapper for the manual testing feature, which gates the test cases, test
 * runs and shared steps pages as one unit.
 */
export const ManualTestingGuard = function ({ children }) {
    const { manualTestingEnabled, featuresLoaded } = useAuth();
    return (
        <FeatureGuard enabled={manualTestingEnabled} loaded={featuresLoaded}>
            {children}
        </FeatureGuard>
    );
};

export default FeatureGuard;
