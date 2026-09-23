import Image from "next/image";
import Link from "next/link";
import { AuthSplitLayout } from "@/components/layout/AuthSplitLayout";

export default function OpeningPortal() {
  return (
    <>
      <AuthSplitLayout
        wide
        title={
          <>
            ICG Recruitment <br />
            Portal
          </>
        }
        subtitle="Apply for open positions and manage your application."
      >
        <div className="w-full border border-[#e4e4e7] rounded-[20px] sm:rounded-[26px] p-6 sm:p-10 lg:p-12 flex flex-col items-center gap-10 sm:gap-16">
          <div className="relative w-full max-w-[360px] h-[100px] sm:h-[145px]">
            <Image
              src="/images/icg-logo.png"
              alt="Irvine Consulting Group"
              fill
              className="object-contain"
              priority
            />
          </div>

          <Link
            href="/applicant/login"
            className="flex items-center justify-center w-full min-h-[56px] sm:h-[70px] bg-[#061c2a] text-white text-base sm:text-lg font-medium rounded-[5px] hover:bg-[#0d2f47] transition-colors px-4"
          >
            Apply Now
          </Link>
        </div>
      </AuthSplitLayout>

      <Link
        href="/officer/login"
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 rounded-md border border-[#e4e4e7] bg-white px-3 py-2 text-xs font-medium text-[#52525b] shadow-sm hover:border-[#061c2a]/30 hover:bg-[#f9fafb] hover:text-[#061c2a] transition-colors"
      >
        ICG Officer
      </Link>
    </>
  );
}
