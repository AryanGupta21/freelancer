'use client'; // This page uses client-side state and hooks

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/components/SessionProvider';
import JobPostManager from '@/components/ui/JobPostManager';

export default function JobPostManagerPage() {
  const { session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!session) {
      router.push('/login');
    }
  }, [session, router]);

  if (!session) {
    return <p>Loading...</p>;
  }

  return <JobPostManager session={session} />;
}