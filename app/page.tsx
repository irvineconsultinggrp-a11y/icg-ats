import Image from "next/image";
import Link from "next/link";
import { AuthSplitLayout } from "@/components/layout/AuthSplitLayout";

export default function OpeningPortal() {
  return (
    <AuthSplitLayout
      wide
      title={
        <>
          ICG Recruitment <br />
          Portal
        </>
      }
      subtitle="Indicate if you're an officer or applicant."
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

        <div className="flex flex-col gap-4 sm:gap-5 w-full">
          <Link
            href="/officer/login"
            className="flex items-center justify-center w-full min-h-[56px] sm:h-[70px] bg-[#061c2a] text-white text-base sm:text-lg font-medium rounded-[5px] hover:bg-[#0d2f47] transition-colors px-4"
          >
            ICG Officer
          </Link>

          <Link
            href="/applicant/login"
            className="flex items-center justify-center w-full min-h-[56px] sm:h-[70px] bg-[#061c2a] text-white text-base sm:text-lg font-medium rounded-[5px] hover:bg-[#0d2f47] transition-colors px-4"
          >
            Applicant
          </Link>
        </div>
      </div>
    </AuthSplitLayout>
  );
}
