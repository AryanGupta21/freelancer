'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useSession } from '@/components/SessionProvider';

const Navbar = () => {
  const { session } = useSession();
  const router = useRouter();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

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
              <Link href="/job_post_manager" className="text-base font-medium text-text-medium hover:text-primary transition-colors">
                Job Post Manager
              </Link>
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