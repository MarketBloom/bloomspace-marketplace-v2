interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export const StepIndicator = ({ currentStep, totalSteps }: StepIndicatorProps) => {
  return (
    <div className="mb-8">
      <div className="flex justify-center items-center space-x-4">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <div key={`step-${index}`} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                index + 1 <= currentStep ? "bg-primary text-white" : "bg-gray-200"
              }`}
            >
              {index + 1}
            </div>
            {index < totalSteps - 1 && (
              <div className="h-1 w-16 bg-gray-200 ml-4" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};