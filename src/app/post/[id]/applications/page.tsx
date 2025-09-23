'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useSession } from '@/components/SessionProvider';
import { useRouter } from 'next/navigation';
import type { JobApplication } from '@/types/job_application';

export default function ViewApplicationsPage({ params }: { params: { id: string } }) {
  const { session } = useSession();
  const router = useRouter();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchApplications = useCallback(async () => {
    const { data, error } = await supabase
      .from('job_applications')
      .select('*')
      .eq('job_id', params.id);
    if (error) console.error(error);
    else setApplications(data);
    setLoading(false);
  }, [params.id]);

  useEffect(() => {
    // Security check: Make sure user is owner (RLS handles fetch, but this prevents even loading the page)
    if (session) {
      supabase.from('job_posts').select('id').eq('id', params.id).eq('user_id', session.user.id).single()
        .then(({ data }) => { if (!data) router.push('/'); });
    }
    fetchApplications();
  }, [session, params.id, router, fetchApplications]);
  
  const handleStatusUpdate = async (appId: string, status: 'accepted' | 'rejected') => {
    const { error } = await supabase.from('job_applications').update({ status }).eq('id', appId);
    if (error) alert('Error updating status: ' + error.message);
    else fetchApplications(); // Refresh list
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Received Applications</h1>
      <div className="space-y-4">
        {applications.map(app => (
          <div key={app.id} className="bg-white p-5 rounded-lg border shadow-sm">
            <h3 className="font-bold text-lg">{app.name}</h3>
            {/* Display other app details like intro, contact, skills */}
            <div className="flex items-center gap-4 mt-4">
              <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                app.status === 'accepted' ? 'bg-success/20 text-success' : 
                app.status === 'rejected' ? 'bg-red-500/20 text-red-600' : 'bg-yellow-500/20 text-yellow-600'
              }`}>{app.status}</span>
              <div className="ml-auto flex gap-2">
                <button onClick={() => handleStatusUpdate(app.id, 'accepted')} className="bg-success text-white text-sm font-semibold py-1 px-3 rounded-md">Accept</button>
                <button onClick={() => handleStatusUpdate(app.id, 'rejected')} className="bg-red-500 text-white text-sm font-semibold py-1 px-3 rounded-md">Reject</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}