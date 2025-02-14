'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

/**
 * Returns the value of the cookie by name.
 */
function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2]! : null;
}

/**
 * Control panel for testing middlewares.
 * Provides buttons to toggle cookies and links to navigate to different routes.
 */
export default function ControlPanel() {
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<string | null>(null);
  const [bypassAdmin, setBypassAdmin] = useState<string | null>(null);

  useEffect(() => {
    console.log("getCookie('authToken')", getCookie('authToken'));

    setAuthToken(getCookie('authToken'));
    setIsAdmin(getCookie('isAdmin'));
    setBypassAdmin(getCookie('bypassAdmin'));
  }, []);

  const toggleCookie = (
    name: string,
    current: string | null,
    value: string,
  ) => {
    if (current) {
      // Remove cookie
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    } else {
      // Set cookie with value, expire in 1 day
      document.cookie = `${name}=${value}; path=/; max-age=86400;`;
    }
    // Update state after a short delay to let cookie update
    setTimeout(() => {
      if (name === 'authToken') setAuthToken(getCookie('authToken'));
      if (name === 'isAdmin') setIsAdmin(getCookie('isAdmin'));
      if (name === 'bypassAdmin') setBypassAdmin(getCookie('bypassAdmin'));
    }, 100);
  };

  return (
    <div style={{ padding: '1rem', fontFamily: 'Arial, sans-serif' }}>
      <h1>Control Panel</h1>
      <section style={{ marginBottom: '1.5rem' }}>
        <h2>Toggle Cookies</h2>
        <div style={{ marginBottom: '0.5rem' }}>
          <button
            onClick={() => toggleCookie('authToken', authToken, 'valid-token')}
          >
            Toggle authToken (Current: {authToken || 'none'})
          </button>
        </div>
        <div style={{ marginBottom: '0.5rem' }}>
          <button onClick={() => toggleCookie('isAdmin', isAdmin, 'true')}>
            Toggle isAdmin (Current: {isAdmin || 'none'})
          </button>
        </div>
        <div style={{ marginBottom: '0.5rem' }}>
          <button
            onClick={() => toggleCookie('bypassAdmin', bypassAdmin, 'true')}
          >
            Toggle bypassAdmin (Current: {bypassAdmin || 'none'})
          </button>
        </div>
      </section>
      <section style={{ marginBottom: '1.5rem' }}>
        <h2>Navigation</h2>
        <ul>
          <li>
            <Link href="/">Home</Link>
          </li>
          <li>
            <Link href="/dashboard">Dashboard</Link>
          </li>
          <li>
            <Link href="/profile">Profile</Link>
          </li>
          <li>
            <Link href="/admin">Admin</Link>
          </li>
          <li>
            <Link href="/admin/settings">Admin Settings</Link>
          </li>
          <li>
            <Link href="/login">Login</Link>
          </li>
          <li>
            <Link href="/unauthorized">Unauthorized</Link>
          </li>
        </ul>
      </section>
    </div>
  );
}
