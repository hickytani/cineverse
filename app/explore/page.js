'use client';
import { Suspense } from 'react';
export default function Page() { return <Suspense fallback={<div>Loading...</div>}><ExploreContent /></Suspense> };
function ExploreContent()    () { return <Suspense fallback={<div>Loading...</div>}><ExplorePage /></Suspense> }; export const dynamic = 'force-dynamic';
