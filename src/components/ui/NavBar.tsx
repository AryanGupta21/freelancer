'use client';

import Link from 'next/link';

const Navbar = () => {

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <div className="logo">
          <Link href="/">
            <span>Job Portal.AI - Freelance</span>
          </Link>
        </div>
      </div>

      <div className="nav-right">
        <Link href="/auth/login" className="auth-nav-btn">
          Login
        </Link>
        <Link href="/auth/signup" className="auth-nav-btn">
          Signup
        </Link>
      </div>
    </nav>
  );
};



export default Navbar;