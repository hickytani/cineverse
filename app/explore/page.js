'use client';
import { Suspense } from 'react';
 export default function Page() { return <Suspense fallback={<div>Loading...</div>}><Page /></Suspense> }
export const dynamic = 'force-dynamic';
