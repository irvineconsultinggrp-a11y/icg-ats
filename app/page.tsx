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
    <div className="min-h-screen bg-white">
      {/* Hero Section - Full width banner */}
      <div className="relative w-full">
          <Image
      src="/images/groupphoto.png"
      alt="Junior Associate Program"
      width={3840}
      height={1000}
      className="w-full h-auto"
      priority
    />

        {/* Text positioned at bottom-left */}
        <div className="absolute bottom-6 left-6 sm:bottom-6 sm:left-6 md:bottom-10 md:left-10">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white">
            JUNIOR ASSOCIATE
          </h1>
        </div>
      </div>

      {/* Buttons Section */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 py-12 px-4">
        <button
          onClick={handleApplicationClick}
          disabled={!applicationsOpen}
          className={`px-8 py-4 text-lg font-semibold rounded-lg transition-all ${
            applicationsOpen
              ? 'bg-black text-white hover:bg-gray-800'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          APPLICATION LINK
        </button>
        <a
          href="https://irvineconsultinggroup.com"
          target="_blank"
          rel="noopener noreferrer"
          className="px-8 py-4 text-lg font-semibold rounded-lg border-2 border-black text-black bg-transparent hover:bg-gray-50 transition-all"
        >
          COFFEE CHAT SIGN-UP
        </a>
      </div>

      {/* About Sections */}
      <div className="max-w-4xl mx-auto px-6 py-16 space-y-16">
        {/* About the Program */}
        <div>
          <h2 className="text-3xl font-bold text-black mb-4">About the Program</h2>
          <p className="text-lg text-gray-800 leading-relaxed">
          The Junior Associate Program is a 7-week training program designed to prepare you to be client-ready for an ICG project. You'll go through an intensive curriculum that covers consulting fundamentals, practical skills (like PowerPoint), and what it means to think and work like a consultant. Our team will support you throughout the program to help you grow and succeed.
          </p>
        </div>

        {/* About the Team */}
        <div>
          <h2 className="text-3xl font-bold text-black mb-4">About the Team</h2>
          <p className="text-lg text-gray-800 leading-relaxed">
          Your Junior Associate educators are experienced ICG consultants who are committed to helping you become the strongest version of yourself by the end of the program. They'll be available to answer questions and support you as you go.
          At ICG, we value open communication, which means you're always welcome to reach out to anyone on the team for help, clarification, or guidance, we're happy to support you.
          </p>
        </div>

        {/* About the Work */}
        <div>
          <h2 className="text-3xl font-bold text-black mb-4">About the Work</h2>
          <p className="text-lg text-gray-800 leading-relaxed">
          Everything we ask you to do is something we’ve done ourselves. You will never be asked to complete work that we wouldn't take on as consultants. We'll give you real opportunities to learn and grow, which also means the workload is intensive, and we expect a high level of commitment.
          <br />
          <br />
          Participation in the program does not guarantee placement within ICG. Return offers are decided at the end of the program based on performance. Because everyone's background and experience differ, the number of hours you spend each week may vary depending on your pace and skill development.
          </p>
        </div>
      </div>

      {/* Application Timeline */}
      <div className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-black mb-12">Application Timeline</h2>
        <div className="space-y-12">
          {/* Timeline Entry 1 */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <div className="md:col-span-2 relative">
              {/* Vertical line */}
              <div className="absolute left-0 top-0 bottom-0 w-px bg-gray-200 hidden md:block"></div>
              <div className="pl-0 md:pl-6">
                <p className="text-lg font-semibold text-black">January 8, 2026</p>
                <p className="text-sm text-gray-600 mt-1">Deadline: 11:59PM PST</p>
              </div>
            </div>
            <div className="md:col-span-3">
              <h3 className="text-xl font-bold text-black mb-2">Application deadline</h3>
              <p className="text-gray-700 leading-relaxed">
              The application includes:
              <br />
              1) Free-response questions so we can learn more about your story <br />
              2) Your outside commitments to understand your availability <br />
              3) Your interview availability (if selected) <br />
              </p>
            </div>
          </div>

          {/* Timeline Entry 2 */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <div className="md:col-span-2 relative">
              {/* Vertical line */}
              <div className="absolute left-0 top-0 bottom-0 w-px bg-gray-200 hidden md:block"></div>
              <div className="pl-0 md:pl-6">
                <p className="text-lg font-semibold text-black">January 10, 2026</p>
                <p className="text-sm text-gray-600 mt-1">Time: Schedule individually</p>
                <p className="text-sm text-gray-600">Location on Invite</p>
              </div>
            </div>
            <div className="md:col-span-3">
              <h3 className="text-xl font-bold text-black mb-2">First-round interview (Invite-only)</h3>
              <p className="text-gray-700 leading-relaxed">
              This is a 45-minute group case interview.<br />
              For more details, attend our info session or reach out to the recruitment team.
              </p>
            </div>
          </div>

          {/* Timeline Entry 3 */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <div className="md:col-span-2 relative">
              {/* Vertical line */}
              <div className="absolute left-0 top-0 bottom-0 w-px bg-gray-200 hidden md:block"></div>
              <div className="pl-0 md:pl-6">
                <p className="text-lg font-semibold text-black">January 11, 2026</p>
                <p className="text-sm text-gray-600 mt-1">Time: Schedule individually</p>
                <p className="text-sm text-gray-600">Location on Invite</p>
              </div>
            </div>
            <div className="md:col-span-3">
              <h3 className="text-xl font-bold text-black mb-2">Second-round interview (Invite-only)</h3>
              <p className="text-gray-700 leading-relaxed">
              This is a 60-minute individual interview that includes behavioral questions and a case.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer - Dark themed */}
      <footer className="bg-slate-800 py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
            {/* Social Links */}
            <div className="flex gap-6 text-center sm:text-left">
              <a
                href="https://instagram.com/icg.uci"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Instagram: @icg.uci
              </a>
              <a
                href="https://www.linkedin.com/company/irvine-consulting-group"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-white transition-colors"
              >
                LinkedIn: Irvine Consulting Group
              </a>
            </div>

            {/* Officer Login - Very subtle */}
            <a
              href="/login"
              className="text-xs text-gray-600 hover:text-gray-500 transition-colors"
            >
              Officer Login
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
