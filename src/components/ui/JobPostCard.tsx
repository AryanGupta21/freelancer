'use client';

import { useState } from 'react';
import type { JobPost } from '@/types/job_post';
import Link from 'next/link';

// Define a type for the post that includes our application_count
type PostWithCount = JobPost & {
  application_count: number;
};

interface JobPostCardProps {
  post: PostWithCount;
  onApply: (jobId: string) => void;
  appliedJobIds: string[];
}

export const JobPostCard: React.FC<JobPostCardProps> = ({ post, appliedJobIds }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasApplied = appliedJobIds.includes(post.id);

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm transition-all duration-200 overflow-hidden">
      {/* Main clickable area to expand/collapse details */}
      <div className="p-5 cursor-pointer hover:bg-gray-50" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex justify-between items-start">
          {/* Post Title and Pay */}
          <div>
            <h3 className="text-xl font-bold text-primary mb-1">{post.title}</h3>
            <p className="text-sm text-text-medium">
              <strong>Pay:</strong> {post.pay_amount ? `$${post.pay_amount}` : 'Not specified'}
            </p>
          </div>
          {/* Applicant Count */}
          <div className="text-right flex-shrink-0 ml-4">
            <p className="text-lg font-bold text-text-dark">{post.application_count}</p>
            <p className="text-xs text-text-light -mt-1">Applicant(s)</p>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mt-3">
          {post.tags?.map(tag => (
            <span key={tag} className="bg-gray-100 text-gray-600 text-xs font-medium px-2.5 py-1 rounded-full">{tag}</span>
          ))}
        </div>
      </div>

      {/* Expanded Details View */}
      {isExpanded && (
        <div className="px-5 pb-5 border-t border-gray-200 pt-4">
          <h4 className="font-semibold text-text-dark mb-2">Job Description</h4>
          <p className="text-text-medium whitespace-pre-wrap">{post.description || 'No description provided.'}</p>
        </div>
      )}

      <div className="px-5 py-3 bg-blue-200 border-t text-black border-gray-200 text-center">
        <Link
          href={`/apply/${post.id}`}
          className={`font-semibold py-2 px-5 rounded-lg transition-colors text-white text-sm inline-block ${
            hasApplied
              ? 'bg-success cursor-not-allowed pointer-events-none' // Visually disable if applied
              : 'bg-primary hover:bg-primary-dark'
          }`}
        >
          {hasApplied ? 'Applied ✓' : 'Apply Now'}
        </Link>
      </div>
    </div>
  );
};