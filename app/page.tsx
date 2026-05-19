import Image from "next/image";
import Link from "next/link";

export default function OpeningPortal() {
  return (
    <div className="min-h-screen flex font-sans">
      {/* Left panel — dark navy cityscape */}
      <div className="relative w-[36%] min-w-[280px] bg-[#061c2a] overflow-hidden flex-shrink-0">
        {/* Cityscape background image */}
        <Image
          src="/images/cityscape.png"
          alt=""
          fill
          className="object-cover opacity-20"
          priority
        />

        {/* Content overlay */}
        <div className="relative z-10 flex flex-col gap-3 px-12 pt-20">
          {/* Small ICG icon */}
          <div className="w-10 h-10 relative flex-shrink-0">
            <Image
              src="/images/icg-icon-white.png"
              alt="ICG icon"
              fill
              className="object-contain"
            />
          </div>

          {/* Title */}
          <h1 className="text-white text-4xl font-semibold leading-[44px] tracking-tight mt-2">
            ICG Recruitment{" "}
            <br />
            Portal
          </h1>

          {/* Subtitle */}
          <p className="text-white text-lg font-normal leading-7 max-w-xs">
            Indicate if you&apos;re an officer or applicant.
          </p>
        </div>

        {/* Footer copyright */}
        <p className="absolute bottom-8 left-0 right-0 text-center text-white text-sm leading-5 px-4">
          © Irvine Consulting Group 2026. All Rights Reserved
        </p>
      </div>

      {/* Right panel — white, card centered */}
      <div className="flex-1 bg-white flex items-center justify-center px-8 py-12">
        <div className="w-full max-w-[540px] border border-[#e4e4e7] rounded-[26px] p-12 flex flex-col items-center gap-16">
          {/* ICG Logo */}
          <div className="relative w-full max-w-[360px] h-[145px]">
            <Image
              src="/images/icg-logo.png"
              alt="Irvine Consulting Group"
              fill
              className="object-contain"
              priority
            />
          </div>

          {/* Buttons */}
          <div className="flex flex-col gap-5 w-full">
            <Link
              href="/officer/login"
              className="flex items-center justify-center w-full h-[70px] bg-[#061c2a] text-white text-lg font-medium rounded-[5px] hover:bg-[#0d2f47] transition-colors"
            >
              ICG Officer
            </Link>

            <Link
              href="/applicant/login"
              className="flex items-center justify-center w-full h-[70px] bg-[#061c2a] text-white text-lg font-medium rounded-[5px] hover:bg-[#0d2f47] transition-colors"
            >
              Applicant
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
