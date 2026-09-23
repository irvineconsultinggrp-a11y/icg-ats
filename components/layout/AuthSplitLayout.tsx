import Image from "next/image";
import type { ReactNode } from "react";

type AuthSplitLayoutProps = {
  title: ReactNode;
  subtitle: ReactNode;
  children: ReactNode;
  /** Wider form column (e.g. applicant portal card). */
  wide?: boolean;
};

/** Login/signup: stacked on mobile, split panel on lg+. */
export function AuthSplitLayout({ title, subtitle, children, wide }: AuthSplitLayoutProps) {
  return (
    <div className="min-h-screen min-h-[100dvh] flex flex-col lg:flex-row font-sans">
      <div className="relative lg:w-[36%] lg:min-w-[280px] bg-[#061c2a] overflow-hidden flex-shrink-0 px-6 py-10 lg:px-12 lg:pt-20 lg:pb-8 min-h-[200px] lg:min-h-screen">
        <Image src="/images/cityscape.png" alt="" fill className="object-cover opacity-20" priority />
        <div className="relative z-10 flex flex-col gap-3">
          <div className="w-10 h-10 relative flex-shrink-0">
            <Image src="/images/icg-icon-white.png" alt="ICG icon" fill className="object-contain" />
          </div>
          <h1 className="text-white text-2xl sm:text-3xl lg:text-4xl font-semibold leading-tight tracking-tight mt-2">
            {title}
          </h1>
          <p className="text-white text-base lg:text-lg font-normal leading-7 max-w-xs">{subtitle}</p>
        </div>
        <p className="relative z-10 mt-8 lg:mt-auto lg:absolute lg:bottom-8 lg:left-0 lg:right-0 text-center text-white/80 text-xs lg:text-sm leading-5 px-4">
          © Irvine Consulting Group 2026. All Rights Reserved
        </p>
      </div>

      <div className="flex-1 bg-white flex items-center justify-center px-4 sm:px-8 py-10 lg:py-12 overflow-y-auto">
        <div className={`w-full ${wide ? "max-w-[540px]" : "max-w-[480px]"}`}>{children}</div>
      </div>
    </div>
  );
}
