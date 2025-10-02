'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useSession } from '@/components/SessionProvider';
import { useRouter, notFound } from 'next/navigation';
import type { JobPost } from '@/types/job_post';

export default function ApplyPage({ params }: { params: { id: string } }) {
  const { session } = useSession();
  const router = useRouter();
  const [post, setPost] = useState<JobPost | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [selfIntro, setSelfIntro] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [currentSkill, setCurrentSkill] = useState('');

  useEffect(() => {
    if (!session) router.push('/login');
    const fetchPost = async () => {
      const { data, error } = await supabase.from('job_posts').select('title').eq('id', params.id).single();
      if (error) return notFound();
      setPost(data);
    };
    fetchPost();
  }, [params.id, router, session]);
  
  const handleAddSkill = () => {
    if (currentSkill && !skills.includes(currentSkill.trim())) {
      setSkills([...skills, currentSkill.trim()]);
    }
    setCurrentSkill('');
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;
    
    /* eslint-disable */
    const { error } = await supabase.from('job_applications').insert({
      job_id: params.id,
      applicant_id: session.user.id,
      name,
      contact_info: contactInfo,
      self_intro: selfIntro,
      skills,
    });
    /* esline-enable */

    if (error) {
      alert('Error submitting application: ' + error.message);
    } else {
      alert('Application submitted successfully!');
      router.push('/my-applications');
    }
  };

  return (
    <div className="min-h-screen min-w-screeen mx-auto bg-white p-8 text-black border">
      <h1 className="text-3xl font-bold mb-2">Apply for: {post?.title || '...'}</h1>
      <h1 className="text-lg text-text-medium mb-4">Job ID: {params.id}</h1>
      <p className="text-text-medium mb-6">Submit your details below.</p>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
          <input id="name" type="text" value={name} onChange={e => setName(e.target.value)} required
                 className="block w-full rounded-lg p-2 border-gray-300 shadow-sm focus:border-primary focus:ring-primary" />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Intro</label>
          <input id="name" type="text" value={selfIntro} onChange={e => setSelfIntro(e.target.value)} required
                 className="block w-full rounded-lg p-2 border-gray-300 shadow-sm focus:border-primary focus:ring-primary" />
        </div>

        <label htmlFor="skills" className="block text-sm font-medium text-gray-700 mb-1">Skills</label>
        <div className='flex gap-2'>
          <input id="name" type="text" placeholder="Enter command separated list" value={skills.join(", ")} required
                 className="block w-[70%] rounded-lg p-2 border-gray-300 shadow-sm focus:border-primary focus:ring-primary" />

          <input id="name" type="text" placeholder="Enter one Skill and press add" value={currentSkill} onChange={e => setCurrentSkill(e.target.value)}
                 className="block w-[25%] rounded-lg p-2 border-gray-300 shadow-sm focus:border-primary focus:ring-primary" />
          <button type="button" onClick={handleAddSkill} className="bg-primary text-white bg-blue-500 hover:bg-blue-700 font-semibold py-2 px-4 rounded-lg">
            Add
            </button>
        </div>

        <div>
          <label htmlFor="skills" className="block text-sm font-medium text-gray-700 mb-1">Contact Info(email, phone number)</label>
          <input id="name" type="text" placeholder="email or phone number" value={contactInfo} onChange={e => setContactInfo(e.target.value)} required
                 className="block w-full rounded-lg p-2 border-gray-300 shadow-sm focus:border-primary focus:ring-primary" />
        </div>
        
        <div className="text-center">
          <button type="submit" className="bg-primary text-black bg-green-500 hover:bg-green-700 font-semibold py-2 px-5 rounded-lg">
            Submit Application
          </button>
        </div>
      </form>
    </div>
  );
}
