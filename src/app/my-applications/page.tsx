'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { JobApplication } from '@/types/job_application'

export default function MyApplicationsPage() {
  const [applications, setApplications] = useState<JobApplication[]>([]); // Define a proper type for this join

  useEffect(() => {
    const fetchMyApps = async () => {
      // This query joins applications with posts to get the job title
      const { data, error } = await supabase
        .from('job_applications')
        .select(`
          id,
          status,
          created_at,
          job_posts ( id, title )
        `);
      if (error) console.error(error);
      else setApplications(data || []);
    };
    fetchMyApps();
  }, []);

  return (
    <div className="max-w-3xl mx-auto bg-white text-black min-h-screen min-w-screen p-8">
      <div className="space-y-4">
        {applications.map(app => (
          <div key={app.id} className="bg-white p-5 rounded-lg border shadow-sm flex justify-between items-center">
            <div>
              <Link href={`/post/${app.job_posts.id}`} className="font-bold text-lg text-primary hover:underline">
                {app.job_posts.title}
              </Link>
              <p className="text-sm text-text-medium">Applied on: {new Date(app.created_at).toLocaleDateString()}</p>
            </div>
            <span className={`px-3 py-1 text-sm font-bold rounded-full ${
              app.status === 'accepted' ? 'bg-success/20 text-success' : 
              app.status === 'rejected' ? 'bg-red-500/20 text-red-600' : 'bg-yellow-500/20 text-yellow-600'
            }`}>{app.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
