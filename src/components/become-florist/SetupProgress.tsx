export function SetupProgress({ currentStep }: { currentStep: number }) {
  const steps = [
    { title: 'Store Details', description: 'Basic information' },
    { title: 'Operating Hours', description: 'When you\'re open' },
    { title: 'Delivery Settings', description: 'Delivery zones and fees' },
    { title: 'Store Images', description: 'Logo and banner' },
    { title: 'Products', description: 'Add your first products' },
  ];

  return (
    <div className="mb-8">
      <div className="relative">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center mb-4">
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center
              ${currentStep > index ? 'bg-primary text-white' : 
                currentStep === index ? 'bg-primary/20 text-primary' : 
                'bg-muted text-muted-foreground'}
            `}>
              {index + 1}
            </div>
            <div className="ml-3">
              <div className="font-medium">{step.title}</div>
              <div className="text-sm text-muted-foreground">{step.description}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 