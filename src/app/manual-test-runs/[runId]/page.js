'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import ManualTestRunDetailPage from '../../../components/pages/manual-test-runs/ManualTestRunDetailPage';

export default function Page() {
    const params = useParams();
    return <ManualTestRunDetailPage runId={params.runId} />;
}
