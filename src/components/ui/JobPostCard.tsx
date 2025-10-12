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
  appliedJobIds: string[];
}

export const JobPostCard: React.FC<JobPostCardProps> = ({ post, appliedJobIds }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasApplied = post.id != null ? appliedJobIds.includes(post.id) : false;

  return (
    <div className="job-post-card">
      {/* Main clickable area to expand/collapse details */}
      <div className="job-post-header" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex justify-between items-start">
          {/* Post Title and Pay */}
          <div>
            <h3 className="job-post-title">{post.title}</h3>
            <p className="job-post-pay">
              <strong>Pay:</strong> {post.pay_amount ? `$${post.pay_amount}` : 'Not specified'}
            </p>
          </div>
          {/* Applicant Count */}
          <div className="job-post-applicant-count">
            <p className="job-post-applicant-number">{post.application_count}</p>
            <p className="job-post-applicant-label">Applicant(s)</p>
          </div>
        </div>

        {/* Tags */}
        <div className="job-post-tags">
          {post.tags?.map(tag => (
            <span key={tag} className="job-post-tag">{tag}</span>
          ))}
        </div>
      </div>

      {/* Expanded Details View */}
      {isExpanded && (
        <div className="job-post-details">
          <h4 className="job-post-details-title">Job Description</h4>
          <p className="job-post-description">{post.description || 'No description provided.'}</p>
        </div>
      )}

      <div className="job-post-footer">
        <Link
          href={`/apply/${post.id}`}
          className={`job-post-apply-btn ${hasApplied ? 'applied' : ''}`}
        >
          {hasApplied ? 'Applied ✓' : 'Apply Now'}
        </Link>
      </div>
    </div>
  );
};
