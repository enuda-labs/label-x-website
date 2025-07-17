'use client';

import ProjectDetail from '@/components/project/details';
import DetailsSkeleton from '@/components/project/details-skeleton';
import { Suspense } from 'react';
import { useParams } from 'next/navigation';

function ProjectDetailsPage() {
    const { id } = useParams<{ id: number |string }>();
    
    return (
        <Suspense fallback={<div className='py-10'><DetailsSkeleton /></div>}>
            <ProjectDetail id={id} />
        </Suspense>
    )
}

export default ProjectDetailsPage;