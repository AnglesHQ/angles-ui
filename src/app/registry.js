'use client';

import React from 'react';
import { useServerInsertedHTML } from 'next/navigation';

export default function StyledComponentsRegistry({ children }) {
    // Logic to handle server-side style insertion if needed in the future
    return <>{children}</>;
}
