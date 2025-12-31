'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import type { Config } from '@/types';
import Image from 'next/image';

export default function LandingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [applicationsOpen, setApplicationsOpen] = useState(false);

  useEffect(() => {
    checkApplicationStatus();
  }, []);

  const checkApplicationStatus = async () => {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

      if (!supabaseUrl || !supabaseAnonKey) {
        console.warn('Supabase credentials not configured');
        setLoading(false);
        return;
      }

      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      const { data, error } = await supabase
        .from('config')
        .select('*')
        .single();

      if (error) {
        console.error('Error fetching config:', error);
        setLoading(false);
        return;
      }

      const config = data as Config;
      setApplicationsOpen(config.applications_open);
      setLoading(false);
    } catch (error) {
      console.error('Failed to check application status:', error);
      setLoading(false);
    }
  };

  const handleApplicationClick = () => {
    if (applicationsOpen) {
      router.push('/apply');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-black">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/groupphoto.png"
          alt="Junior Associate Program"
          fill
          className="object-cover"
          priority
          quality={100}
        />
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/50"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-12">
        {/* Heading */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-semibold text-white text-center mb-4">
          Junior Associate Program
        </h1>

        {/* Subheading */}
        <p className="text-xl sm:text-2xl md:text-3xl text-white text-center mb-12">
          Winter 2026 Recruitment
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
          <button
            onClick={handleApplicationClick}
            disabled={!applicationsOpen}
            className={`px-16 py-5 text-lg sm:text-xl font-semibold rounded-full transition-all ${
              applicationsOpen
                ? 'bg-white text-black hover:bg-gray-00'
                : 'bg-gray-400 text-gray-600 cursor-not-allowed'
            }`}
          >
            APPLICATION LINK
          </button>

          <a
            href="/coffee-chat"
            className="px-16 py-5 text-lg sm:text-xl font-semibold rounded-full bg-white text-black hover:bg-gray-200 transition-all text-center"
          >
            COFFEE CHAT SIGN-UP
          </a>
        </div>
      </div>
    </div>
  );
}
