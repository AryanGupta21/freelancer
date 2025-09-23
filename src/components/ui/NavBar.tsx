'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useSession } from '@/components/SessionProvider';
import { on } from 'events';

const Navbar = () => {
  const { session } = useSession();
  const router = useRouter();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  let curUrl = ''
  window.addEventListener('load', () => {
    curUrl = window.location.pathname;
  });
  window.addEventListener('navigation', () => {
    curUrl = window.location.pathname;
  });

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-200 text-black">
      <div className="container mx-auto flex justify-between items-center p-4">
        {/* Brand/Logo */}
        <Link href="/" className="text-2xl font-bold text-text-dark hover:text-primary transition-colors">
          Freelancer Platform
        </Link>

        {/* Links */}
        <div className="flex items-center gap-6">

          {session ? (
            <>
              <Link href="/feed" className={window.location.pathname.startsWith("/feed") ? " font-bold text-primary" : ""}>Job Feed</Link>
              <Link href="/my-applications" className={window.location.pathname.startsWith("/my-applications") ? " font-bold text-primary" : ""}>
                My Applications
              </Link>
              <Link href="/my-posts" className={window.location.pathname.startsWith("/my-posts") ? " font-bold text-primary" : ""}>My Posts</Link>
              <button
                onClick={handleSignOut}
                className="bg-gray-200 text-text-dark font-semibold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-base font-medium text-text-medium hover:text-primary transition-colors">
                Login
              </Link>
              <Link href="/signup" className="bg-primary text-white font-semibold py-2 px-4 rounded-lg hover:bg-primary-dark transition-colors">
                Signup
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;