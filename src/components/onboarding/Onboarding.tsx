import { useState } from 'react'
import { X, ChevronLeft, ChevronRight, Check } from 'lucide-react'

interface OnboardingProps {
  onComplete: () => void
  onSkip: () => void
}

interface OnboardingStep {
  title: string
  description: string
  icon: string
  tips: string[]
}

const steps: OnboardingStep[] = [
  {
    title: 'Welcome to Deskia Prompt Library!',
    description: 'Your centralized platform for storing, organizing, and sharing AI prompts across your team.',
    icon: '👋',
    tips: [
      'Save your best prompts and never lose them',
      'Organize prompts by categories and tags',
      'Share prompts with your team',
      'Track which prompts you use most'
    ]
  },
  {
    title: 'Create Your First Prompt',
    description: 'Click the "+ New Prompt" button to save your first AI prompt.',
    icon: '📝',
    tips: [
      'Give your prompt a clear, descriptive title',
      'Add the full prompt text in the content area',
      'Select a category to organize it',
      'Add tags to make it searchable',
      'Toggle "Public" to share with your team'
    ]
  },
  {
    title: 'Organize with Categories',
    description: 'Categories help you group related prompts together.',
    icon: '🏷️',
    tips: [
      'Click categories in the sidebar to filter prompts',
      'Each category has a color for easy identification',
      'Admins can create new categories',
      'Organize by use case, department, or project'
    ]
  },
  {
    title: 'Search & Filter',
    description: 'Quickly find the perfect prompt when you need it.',
    icon: '🔍',
    tips: [
      'Use the search bar to find prompts by title, description, or content',
      'Filter by category using the sidebar',
      'View only your prompts or all public prompts',
      'Track usage counts to see your favorites'
    ]
  },
  {
    title: 'Share & Collaborate',
    description: 'Work together to build a library of amazing prompts.',
    icon: '🤝',
    tips: [
      'Mark well-tested prompts as "Public"',
      'Keep experimental prompts private',
      'Copy prompts with one click',
      'Learn from your team\'s best prompts'
    ]
  }
]

export function Onboarding({ onComplete, onSkip }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0)

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      onComplete()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const step = steps[currentStep]
  const isLastStep = currentStep === steps.length - 1

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in duration-300">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <button
            onClick={onSkip}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="text-6xl mb-4">{step.icon}</div>
          <h2 className="text-2xl font-bold mb-2">{step.title}</h2>
          <p className="text-white/90">{step.description}</p>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="space-y-3">
            {step.tips.map((tip, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-gray-700">{tip}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t bg-gray-50 px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Progress Dots */}
            <div className="flex gap-2">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 rounded-full transition-all ${
                    index === currentStep
                      ? 'w-8 bg-blue-600'
                      : index < currentStep
                      ? 'w-2 bg-blue-400'
                      : 'w-2 bg-gray-300'
                  }`}
                />
              ))}
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-3">
              {currentStep > 0 && (
                <button
                  onClick={handlePrevious}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>
              )}

              <button
                onClick={handleNext}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium"
              >
                {isLastStep ? (
                  <>
                    Get Started
                    <Check className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Step Counter */}
          <div className="text-center mt-3 text-sm text-gray-500">
            Step {currentStep + 1} of {steps.length}
          </div>
        </div>
      </div>
    </div>
  )
}
