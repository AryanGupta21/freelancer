'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useSession } from '@/components/SessionProvider';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { JobPost } from '@/types/job_post';

interface PostWithCount { application_count: number | null; created_at: string | null; description: string | null; id: string | null; pay_amount: number | null; status: string | null; tags: string[] | null; title: string | null; user_id: string | null; }

// type PostWithCount = JobPost & { application_count: number };

export default function PostDetailsPage({ params }: { params: { id: string } }) {
  const { session } = useSession();
  const [post, setPost] = useState<PostWithCount | null>(null);
  const [hasApplied, setHasApplied] = useState(false);
  const [loading, setLoading] = useState(true);
  const isOwner = post && session?.user.id === post.user_id;

  const fetchPost = useCallback(async () => {
    // Fetch post details
    const { data: postData, error: postError } = await supabase
      .from('posts_with_application_count')
      .select('*')
      .eq('id', params.id)
      .single();

    if (postError || !postData) {
      return notFound();
    }
    setPost(postData);

    // Check if the current user has already applied
    if (session) {
      const { data: applicationData, error: appError } = await supabase
        .from('job_applications')
        .select('id')
        .eq('job_id', params.id)
        .eq('applicant_id', session.user.id)
        .maybeSingle();

      if (applicationData) {
        setHasApplied(true);
      }
    }
    setLoading(false);
  }, [params.id, session]);

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  if (loading) return <p className="text-center p-10">Loading post...</p>;
  if (!post) return null;

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md border border-gray-200">
      <h1 className="text-4xl font-bold text-text-dark mb-2">{post.title}</h1>
      <div className="flex items-center gap-4 text-text-medium mb-6">
        <span><strong>Pay:</strong> {post.pay_amount ? `$${post.pay_amount}` : 'Not specified'}</span>
        <span>•</span>
        <span><strong>Applicants:</strong> {post.application_count}</span>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {post.tags?.map(tag => (
          <span key={tag} className="bg-gray-100 text-gray-600 text-xs font-medium px-2.5 py-1 rounded-full">{tag}</span>
        ))}
      </div>

      <h2 className="text-2xl font-semibold text-text-dark mb-4 border-b pb-2">Description</h2>
      <p className="text-text-medium whitespace-pre-wrap">{post.description}</p>

      <div className="mt-8 pt-6 border-t text-right">
        {isOwner ? (
          <div className="flex justify-end gap-4">
            <Link href={`/post/${post.id}/applications`} className="bg-primary text-white font-semibold py-2 px-5 rounded-lg hover:bg-primary-dark transition-colors">
              View Applications ({post.application_count})
            </Link>
            <Link href="/job_post_manager" className="bg-gray-200 text-text-dark font-semibold py-2 px-5 rounded-lg hover:bg-gray-300 transition-colors">
              Edit Post
            </Link>
          </div>
        ) : (
          <Link href={`/apply/${post.id}`}
                className={`font-semibold py-2 px-5 rounded-lg transition-colors text-white ${hasApplied ? 'bg-success cursor-not-allowed' : 'bg-primary hover:bg-primary-dark'}`}>
            {hasApplied ? 'You Have Applied ✓' : 'Apply Now'}
          </Link>
        )}
      </div>
    </div>
  );
}
