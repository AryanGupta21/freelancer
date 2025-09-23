'use client';

import type { JobApplication } from '@/types/job_application';

interface ApplicantCardProps {
  application: JobApplication;
  isExpanded: boolean;
  onToggle: () => void;
  onStatusUpdate: (appId: string, status: 'accepted' | 'rejected') => void;
}

export const ApplicantCard: React.FC<ApplicantCardProps> = ({ application, isExpanded, onToggle, onStatusUpdate }) => {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* Collapsed View - Always Visible */}
      <div
        className="p-4 cursor-pointer hover:bg-gray-50 flex justify-between items-center"
        onClick={onToggle}
      >
        <div>
          <h4 className="font-bold text-text-dark">{application.name}</h4>
          <p className="text-sm text-text-medium">{application.contact_info}</p>
        </div>
        <div className="flex items-center gap-4">
          <span className={`px-3 py-1 text-xs font-bold rounded-full ${
            application.status === 'accepted' ? 'bg-success/20 text-success' : 
            application.status === 'rejected' ? 'bg-red-500/20 text-red-600' : 'bg-yellow-500/20 text-yellow-600'
          }`}>
            {application.status}
          </span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
            viewBox="0 0 20 20" fill="currentColor"
          >
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
      </div>

      {/* Expanded View - Conditional */}
      {isExpanded && (
        <div className="p-4 border-t border-gray-200 bg-gray-50/50">
          <div className="space-y-4">
            <div>
              <h5 className="text-sm font-semibold text-text-dark mb-1">Self Introduction</h5>
              <p className="text-sm text-text-medium whitespace-pre-wrap">{application.self_intro || 'N/A'}</p>
            </div>
            <div>
              <h5 className="text-sm font-semibold text-text-dark mb-1">Skills</h5>
              <div className="flex flex-wrap gap-2">
                {application.skills?.map(skill => (
                  <span key={skill} className="bg-gray-200 text-gray-700 text-xs font-medium px-2.5 py-1 rounded-full">{skill}</span>
                ))}
              </div>
            </div>
            {/* Buttons are only shown when expanded and if the application is pending */}
            {application.status === 'pending' && (
              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={(e) => { e.stopPropagation(); onStatusUpdate(application.id, 'rejected'); }}
                  className="bg-red-500 text-white font-semibold py-2 px-4 text-sm rounded-lg hover:bg-red-600 transition-colors"
                >
                  Reject
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onStatusUpdate(application.id, 'accepted'); }}
                  className="bg-success text-white font-semibold py-2 px-4 text-sm rounded-lg hover:bg-success-dark transition-colors"
                >
                  Accept
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};