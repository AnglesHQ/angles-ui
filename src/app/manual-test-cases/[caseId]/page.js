'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import ManualTestCaseDetailPage from '../../../components/pages/manual-test-cases/ManualTestCaseDetailPage';

export default function Page() {
    const params = useParams();
    return <ManualTestCaseDetailPage caseId={params.caseId} />;
}
