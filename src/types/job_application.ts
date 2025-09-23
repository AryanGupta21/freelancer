export interface JobPost {
  id: string;
  user_id: string;
  created_at: string;
  title: string;
  description: string | null;
  pay_amount: number | null;
  tags: string[] | null;
  status: 'Open' | 'Hired' | 'Closed';
}

export interface JobApplication {
  id: string;
  job_id: string;
  applicant_id: string;
  created_at: string;
  name: string;
  contact_info: string;
  self_intro: string | null;
  skills: string[] | null;
  status: 'pending' | 'accepted' | 'rejected';
}

export interface ApplicationWithPost extends JobApplication {
  job_posts: {
    id: string;
    title: string;
  } | null;
}