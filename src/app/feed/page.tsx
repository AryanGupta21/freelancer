'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useSession } from '@/components/SessionProvider';
import { JobPostCard } from '@/components/ui/JobPostCard';
import type { JobPost } from '@/types/job_post';

type PostWithCount = JobPost & {
  application_count: number;
};

export default function FeedPage() {
  const { session } = useSession();
  const [posts, setPosts] = useState<PostWithCount[]>([]);
  const [appliedJobIds, setAppliedJobIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFeedData = useCallback(async () => {
    // Fetch all open job posts with application counts
    const { data: postData, error: postError } = await supabase
      .from('posts_with_application_count')
      .select('*')
      .eq('status', 'Open')
      .order('created_at', { ascending: false });

    if (postError) {
      console.error('Error fetching posts:', postError);
    } else {
      setPosts(postData as PostWithCount[]);
    }

    // If user is logged in, fetch their applications to disable "Apply" buttons
    if (session) {
      const { data: appData, error: appError } = await supabase
        .from('job_applications')
        .select('job_id')
        .eq('applicant_id', session.user.id);

      if (appError) {
        console.error('Error fetching applications:', appError);
      } else {
        setAppliedJobIds(appData.map(app => app.job_id));
      }
    }
    setLoading(false);
  }, [session]);

  useEffect(() => {
    fetchFeedData();
  }, [fetchFeedData]);


  if (loading) {
    return <div className="text-center text-black bg-white min-h-screen min-w-screen p-10">Loading job feed...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-4xl font-bold text-center mb-10 text-text-dark">Open Job Posts</h1>
      <div className="space-y-4">
        {posts.length > 0 ? (
          posts.map(post => (
            <JobPostCard
              key={post.id}
              post={post}
              appliedJobIds={appliedJobIds}
            />
          ))
        ) : (
          <p className="text-center text-text-medium p-8 bg-white rounded-xl">
            No open job posts available at the moment. Check back later!
          </p>
        )}
      </div>
    </div>
  );
}
