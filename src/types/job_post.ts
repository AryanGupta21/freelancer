import { Session } from '@supabase/supabase-js';

export interface JobPost {
  id: string | null;
  user_id: string;
  created_at: string;
  title: string;
  description: string | null;
  pay_amount: number | null;
  tags: string[] | null;
  status: 'Open' | 'Hired' | 'Closed';
}

// Defines the props for our main component
export interface JobPostManagerProps {
  session: Session;
}