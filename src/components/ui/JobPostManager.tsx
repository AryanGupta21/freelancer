import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase'; 
import { Session } from '@supabase/supabase-js';
import { JobPost } from '../../types/job_post'; 

interface JobPostManagerProps {
  session: Session;
}

const JobPostManager: React.FC<JobPostManagerProps> = ({ session }) => {
  // --- Typed State Hooks ---
  const [posts, setPosts] = useState<JobPost[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [editingPost, setEditingPost] = useState<JobPost | null>(null);
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [payAmount, setPayAmount] = useState<string>('');
  const [status, setStatus] = useState<'Open' | 'Hired' | 'Closed'>('Open');
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState<string>('');

  const [selectedPost, setSelectedPost] = useState<JobPost | null>(null);
const [view, setView] = useState<'welcome' | 'create' | 'edit'>('create');

// This handler will be for the "Create New Post" button
const handleCreateClick = () => {
  setSelectedPost(null); // Clear any selected post
  resetForm(); // Clear form fields
  setView('create');
};

// This handler is for when a user clicks a post in the list
const handlePostSelect = (post: JobPost) => {
  setSelectedPost(post);
  setView('edit');
};

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('job_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error: any) {
      console.error('Error fetching posts:', error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  useEffect(() => {
  if (view === 'edit' && selectedPost) {
    // Populate the form when a post is selected for editing
    setTitle(selectedPost.title);
    setDescription(selectedPost.description || '');
    setPayAmount(selectedPost.pay_amount?.toString() || '');
    setStatus(selectedPost.status);
    setTags(selectedPost.tags || []);
  }
}, [selectedPost, view]);

  const resetForm = () => {
    setEditingPost(null);
    setTitle('');
    setDescription('');
    setPayAmount('');
    setStatus('Open');
    setTags([]);
    setCurrentTag('');
  };

  // --- Tag Management ---
  const handleAddTag = () => {
    const trimmedTag = currentTag.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
    }
    setCurrentTag('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };
  
  // Type the form event
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!title || !description) {
      alert('Title and Description are required!');
      return;
    }

    // Prepare the data payload, ensuring types are correct for the DB
    const postData = {
        user_id: session.user.id,
        created_at: editingPost ? editingPost.created_at : new Date().toISOString(),
        title,
        description,
        pay_amount: payAmount ? parseFloat(payAmount) : null,
        status,
        tags,
    };

    try {
      if (editingPost) {
        // UPDATE
        const { error } = await supabase
          .from('job_posts')
          .update(postData)
          .eq('id', editingPost.id);
        if (error) throw error;
      } else {
        // CREATE
        const { error } = await supabase.from('job_posts').insert([postData]);
        if (error) throw error;
      }

      alert(`Post ${editingPost ? 'updated' : 'created'} successfully! 🎉`);
      resetForm();
      await fetchPosts();
    } catch (error: any) {
      console.error('Error saving post:', error.message);
      alert('Failed to save post.');
    }
    
    await fetchPosts(); // Refresh the list
    setView('welcome'); // Go back to the welcome screen
    setSelectedPost(null); // Deselect the post
  };

  const handleEditClick = (post: JobPost) => {
    window.scrollTo(0, 0);
    setEditingPost(post);
    setTitle(post.title);
    setDescription(post.description || '');
    setPayAmount(post.pay_amount?.toString() || '');
    setStatus(post.status);
    setTags(post.tags || []);
  };

  const handleDelete = async (postId: string) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        const { error } = await supabase.from('job_posts').delete().eq('id', postId);
        if (error) throw error;
        alert('Post deleted successfully!');
        await fetchPosts();
      } catch (error: any) {
        console.error('Error deleting post:', error.message);
      }
    }
  };

  if (loading) return <p>Loading your posts...</p>;

return (
  <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 min-h-[calc(100vh-100px)] text-black">
    <div className="lg:col-span-2 bg-white border-r border-gray-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-text-dark">Your Posts</h2>
        <button
          onClick={handleCreateClick}
          className="bg-primary text-white font-semibold py-2 px-4 rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Create Post
        </button>
      </div>

      <div className="space-y-3">
        {posts.length > 0 ? (
          posts.map(post => (
            <div
              key={post.id}
              onClick={() => handlePostSelect(post)}
              className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                selectedPost?.id === post.id
                  ? 'bg-primary/10 border-primary shadow-md'
                  : 'bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
              }`}
            >
              <h3 className="font-bold text-text-dark">{post.title}</h3>
              <p className={`text-sm font-semibold mt-1 ${
                post.status === 'Open' ? 'text-success' : post.status === 'Hired' ? 'text-primary' : 'text-text-light'
              }`}>
                {post.status}
              </p>
            </div>
          ))
        ) : (
          <p className="text-center text-text-medium p-8">You haven't created any posts yet.</p>
        )}
      </div>
    </div>

    {/* ============================================= */}
    {/* ==      RIGHT COLUMN: DYNAMIC VIEW         == */}
    {/* ============================================= */}
    <div className="lg:col-span-3 bg-white">
      {view === 'welcome' && (
        <div className="flex flex-col items-center justify-center h-full bg-gray-50 rounded-lg">
          <h3 className="text-2xl font-bold text-text-dark">Welcome!</h3>
          <p className="text-text-medium mt-2">Select a post on the left to view or edit, or create a new one.</p>
          <button
            onClick={handleCreateClick}
            className="mt-6 bg-primary font-semibold py-2 px-5 rounded-lg hover:bg-primary-dark transition-colors bg-[#345f6a]"
          >
            Create Post
          </button>
        </div>
      )}

      {(view === 'create' || view === 'edit') && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="text-2xl font-semibold mb-6 text-text-dark">
            {view === 'edit' ? 'Edit Your Post' : 'Create a New Post'}
          </h2>
          {/* Your existing form JSX goes here. It will now live inside this div. */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                     className="block w-full rounded-sm border p-2 focus:border-primary focus:ring-primary"
                     placeholder="e.g., Senior Frontend Developer" required />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)}
                        className="block w-full rounded-sm border p-2 focus:border-primary focus:ring-primary"
                        rows={5} placeholder="Describe the job requirements..." required />
            </div>

            {/* Pay and Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="payAmount" className="block text-sm font-medium text-gray-700 mb-1">Pay Amount (Optional)</label>
                <input id="payAmount" type="number" value={payAmount} onChange={(e) => setPayAmount(e.target.value)}
                       className="block w-full rounded-sm border p-2 focus:border-primary focus:ring-primary"
                       placeholder="e.g., 90000" />
              </div>
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select id="status" value={status} onChange={(e) => setStatus(e.target.value as 'Open' | 'Hired' | 'Closed')}
                        className="block w-full rounded-sm border p-2 focus:border-primary focus:ring-primary">
                  <option>Open</option>
                  <option>Hired</option>
                  <option>Closed</option>
                </select>
              </div>
            </div>

            {/* Tags Input */}
            <div>
              <label htmlFor="tag-input" className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
              {/* ... The rest of your form JSX (tags, buttons) goes here ... */}
            </div>

            {/* Form Actions */}
            <div className="flex justify-end items-center gap-4 pt-4">
              <button type="button" onClick={() => setView('welcome')}
                      className="bg-red-400 font-semibold py-2 px-5 rounded-lg hover:bg-red-600 transition-colors">
                Cancel
              </button>
              <button type="submit"
                      className="bg-primary bg-blue-200 font-semibold py-2 px-5 rounded-lg hover:bg-blue-400 transition-colors">
                {view === 'edit' ? 'Update Post' : 'Create Post'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  </div>
);

};

export default JobPostManager;