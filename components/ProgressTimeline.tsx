interface ProgressTimelineProps {
  currentStep: 1 | 2 | 3 | 4;
}

const steps = [
  { number: 1, label: 'Information' },
  { number: 2, label: 'Application' },
  { number: 3, label: 'Availability' },
  { number: 4, label: 'Review' },
];

export default function ProgressTimeline({ currentStep }: ProgressTimelineProps) {
  return (
    <div className="w-full max-w-2xl mx-auto px-4 sm:px-6">
      <div className="relative py-2">
        {/* Steps container */}
        <div className="relative flex justify-between items-start">
          {steps.map((step, index) => {
            const isActive = currentStep === step.number;
            const isCompleted = currentStep > step.number;

            return (
              <div key={step.number} className="flex flex-col items-center relative" style={{ flex: '1 1 0%' }}>
                {/* Circle */}
                <div
                  className={`
                    relative z-10 rounded-full transition-all duration-200 flex items-center justify-center
                    ${isActive ? 'w-3 h-3 sm:w-4 sm:h-4 bg-white border-2 border-gray-300' : isCompleted ? 'w-3 h-3 sm:w-4 sm:h-4 bg-black' : 'w-3 h-3 sm:w-4 sm:h-4 bg-white border-2 border-gray-300'}
                  `}
                >
                  {/* Inner black dot for active step */}
                  {isActive && (
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-black rounded-full" />
                  )}
                </div>

                {/* Connecting line to next step */}
                {index < steps.length - 1 && (
                  <div
                    className="absolute top-1.5 sm:top-2 left-1/2 w-full h-0.5 bg-gray-300 -z-0"
                    style={{ transform: 'translateY(-50%)' }}
                  />
                )}

                {/* Label */}
                <div className="mt-2 sm:mt-3 text-center px-1">
                  <span
                    className={`
                      text-xs sm:text-sm whitespace-nowrap transition-all duration-200
                      ${isActive ? 'font-semibold text-black' : 'text-gray-500'}
                    `}
                  >
                    {step.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
