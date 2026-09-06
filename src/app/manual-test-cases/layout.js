'use client';

import React from 'react';
import { ManualTestingGuard } from '../../components/common/FeatureGuard';

// Applied at the segment level so nested routes (a case, a version, a run) are gated by
// the same toggle without each page having to remember to guard itself.
export default function Layout({ children }) {
    return <ManualTestingGuard>{children}</ManualTestingGuard>;
}
