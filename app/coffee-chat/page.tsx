'use client';

import { useState, useEffect } from 'react';
import { candidImagesRow1, candidImagesRow2 } from '@/lib/candidImages';
import { coffeeChatMembers, CoffeeChatMember } from '@/lib/coffeeChatMembers';

// Fallback placeholder for missing headshots
const FALLBACK_AVATAR = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Crect fill="%23E8F0F7" width="100" height="100"/%3E%3Ccircle cx="50" cy="35" r="20" fill="%230B1F2E" opacity="0.2"/%3E%3Cellipse cx="50" cy="85" rx="30" ry="25" fill="%230B1F2E" opacity="0.2"/%3E%3C/svg%3E';

// Image component with fallback
function HeadshotImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [imgSrc, setImgSrc] = useState(src);
  
  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      onError={() => setImgSrc(FALLBACK_AVATAR)}
    />
  );
}

export default function CoffeeChatPage() {
  const [selectedMember, setSelectedMember] = useState<CoffeeChatMember | null>(null);

  // Handle ESC key and body scroll lock
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedMember(null);
      }
    };

    if (selectedMember) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEsc);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleEsc);
    };
  }, [selectedMember]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-icg-light via-white to-icg-lighter">
      {/* Header - contained */}
      <div className="container mx-auto px-4 sm:px-6 pt-12 sm:pt-16">
        <div className="text-center mb-12 sm:mb-16">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-icg-navy mb-4">
            Meet our ICG Members!
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
            Click on a member to learn more and set up a time to chat.
          </p>
        </div>
      </div>

      {/* Candid Carousel Section - full width, edge to edge */}
      <section className="mb-12 sm:mb-16 w-full">
        <CandidCarousel />
      </section>

      {/* Member Grid Section - contained */}
      <div className="container mx-auto px-4 sm:px-6 pb-12 sm:pb-16">
        <section>
          <MemberGrid onSelectMember={setSelectedMember} />
        </section>
      </div>

      {/* Member Modal */}
      {selectedMember && (
        <MemberModal
          member={selectedMember}
          onClose={() => setSelectedMember(null)}
        />
      )}
    </div>
  );
}

// Candid photo carousel with two rows scrolling in opposite directions
function CandidCarousel() {
  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Row 1: Scrolls left to right */}
      <div className="candid-carousel-wrapper">
        <div className="candid-carousel-track candid-carousel-track-ltr">
          {/* First set of images */}
          {candidImagesRow1.map((src, idx) => (
            <img
              key={`row1-a-${idx}`}
              src={src}
              alt="ICG candid photo"
              loading="lazy"
            />
          ))}
          {/* Duplicate set for seamless loop */}
          {candidImagesRow1.map((src, idx) => (
            <img
              key={`row1-b-${idx}`}
              src={src}
              alt="ICG candid photo"
              loading="lazy"
            />
          ))}
        </div>
      </div>

      {/* Row 2: Scrolls right to left */}
      <div className="candid-carousel-wrapper">
        <div className="candid-carousel-track candid-carousel-track-rtl">
          {/* First set of images */}
          {candidImagesRow2.map((src, idx) => (
            <img
              key={`row2-a-${idx}`}
              src={src}
              alt="ICG candid photo"
              loading="lazy"
            />
          ))}
          {/* Duplicate set for seamless loop */}
          {candidImagesRow2.map((src, idx) => (
            <img
              key={`row2-b-${idx}`}
              src={src}
              alt="ICG candid photo"
              loading="lazy"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// Member grid displaying profile cards
function MemberGrid({ onSelectMember }: { onSelectMember: (member: CoffeeChatMember) => void }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
      {coffeeChatMembers.map((member) => (
        <div
          key={member.id}
          onClick={() => onSelectMember(member)}
          className="flex flex-col items-center text-center p-6 rounded-2xl cursor-pointer transition-all duration-200 hover:bg-white hover:shadow-xl hover:scale-[1.03]"
        >
          {/* Circular Headshot */}
          <div className="w-32 h-32 sm:w-36 sm:h-36 mb-4 rounded-full overflow-hidden border-4 border-white shadow-lg bg-icg-light">
            <HeadshotImage
              src={member.headshotSrc}
              alt={`${member.firstName} ${member.lastName}`}
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Name */}
          <h3 className="text-lg sm:text-xl font-bold text-icg-navy leading-tight">
            {member.firstName} {member.lastName}
          </h3>
          
          {/* Role */}
          {member.role && (
            <p className="text-sm text-gray-600 mt-1 leading-snug max-w-[200px]">
              {member.role}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

// Modal for member details - Horizontal layout
function MemberModal({
  member,
  onClose,
}: {
  member: CoffeeChatMember;
  onClose: () => void;
}) {
  const hasLinkedIn = member.linkedinUrl && member.linkedinUrl.length > 0;
  const hasCalendly = member.calendlyUrl && member.calendlyUrl.length > 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Modal Content - Horizontal Layout */}
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button - always visible */}
        <button
          onClick={onClose}
          className="absolute top-3 left-3 z-20 w-8 h-8 flex items-center justify-center rounded-full bg-black/20 hover:bg-black/40 transition-colors md:bg-white/80 md:hover:bg-white"
          aria-label="Close modal"
        >
          <svg
            className="w-5 h-5 text-white md:text-gray-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Left Side - Photo */}
        <div className="w-full md:w-2/5 h-64 md:h-auto flex-shrink-0 bg-icg-light">
          <HeadshotImage
            src={member.headshotSrc}
            alt={`${member.firstName} ${member.lastName}`}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Right Side - Content */}
        <div className="flex-1 p-6 md:p-8 overflow-y-auto">
          {/* Header with Name, Role, and LinkedIn */}
          <div className="flex items-start justify-between mb-6">
            <div>
              {/* Name */}
              <h2 className="text-2xl md:text-3xl font-bold text-icg-navy">
                {member.firstName} {member.lastName}
              </h2>
              {/* Role */}
              {member.role && (
                <p className="text-base text-gray-600 mt-1">{member.role}</p>
              )}
            </div>

            {/* LinkedIn Icon - top right of content area */}
            {hasLinkedIn && (
              <a
                href={member.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 ml-4"
                aria-label={`${member.firstName}'s LinkedIn`}
              >
                <svg
                  className="w-8 h-8 text-[#0A66C2] hover:text-[#004182] transition-colors"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
            )}
          </div>

          {/* Info as bullet list */}
          <ul className="space-y-3 text-gray-800 mb-6">
            {member.hobbies && (
              <li className="flex">
                <span className="mr-2">•</span>
                <span><strong>Hobbies:</strong> {member.hobbies}</span>
              </li>
            )}
            {member.funFact && (
              <li className="flex">
                <span className="mr-2">•</span>
                <span><strong>Fun fact:</strong> {member.funFact}</span>
              </li>
            )}
            {member.lookingForwardTo && (
              <li className="flex">
                <span className="mr-2">•</span>
                <span><strong>What I&apos;m looking forward to:</strong> {member.lookingForwardTo}</span>
              </li>
            )}
          </ul>

          {/* Coffee Chat Button */}
          {hasCalendly && (
            <a
              href={member.calendlyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-8 py-3 bg-icg-navy text-white text-center font-semibold rounded-full hover:bg-icg-blue transition-colors"
            >
              Coffee Chat
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

