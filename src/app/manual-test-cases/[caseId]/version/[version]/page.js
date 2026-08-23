'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import ManualTestCaseVersionPage from '../../../../../components/pages/manual-test-case-version/ManualTestCaseVersionPage';

export default function Page() {
    const params = useParams();
    return <ManualTestCaseVersionPage caseId={params.caseId} version={params.version} />;
}
