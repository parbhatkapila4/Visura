import {
  Brain,
  FileAxis3D,
  FileText,
  Upload,
  Zap,
  Download,
} from "lucide-react";
import { ReactNode } from "react";

type Step = {
  stepNumber: string;
  title: string;
  icon: ReactNode;
  description: string;
  benefits: string[];
};

const steps: Step[] = [
  {
    stepNumber: "Step One",
    title: "Upload",
    icon: <Upload size={32} strokeWidth={1.5} />,
    description:
      "Choose your PDF file and upload it to our secure platform for processing.",
    benefits: [
      "DRAG & DROP INTERFACE",
      "SUPPORTED FORMATS",
      "SECURE UPLOAD",
      "INSTANT PROCESSING",
    ],
  },
  {
    stepNumber: "Step Two",
    title: "Process",
    icon: <Brain size={32} strokeWidth={1.5} />,
    description:
      "Our advanced AI analyzes and breaks down your document content intelligently.",
    benefits: [
      "AI-POWERED ANALYSIS",
      "CONTENT EXTRACTION",
      "KEY INSIGHTS IDENTIFIED",
      "SMART SUMMARIZATION",
    ],
  },
  {
    stepNumber: "Step Three",
    title: "Download",
    icon: <Download size={32} strokeWidth={1.5} />,
    description:
      "Get your beautifully formatted summary and download it in your preferred format.",
    benefits: [
      "MULTIPLE FORMATS",
      "INSTANT DOWNLOAD",
      "SHARE EASILY",
      "SAVE TIME",
    ],
  },
];

export default function HowItWorksSection() {
  return (
    <section className="bg-black py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-16">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="bg-gray-900/80 backdrop-blur-sm rounded-3xl p-8 lg:p-12 border border-gray-800/50 shadow-2xl">
                <div className="text-center ">
                  <p className="text-orange-400 font-semibold text-sm uppercase tracking-wider mb-2">
                    {step.stepNumber}
                  </p>
                  <h3 className="bg-gradient-to-r from-white to-danger bg-clip-text text-transparent font-bold text-3xl lg:text-6xl mb-4">
                    {step.title}
                  </h3>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                  {/* Left Side - Plan Selection Visual */}
                  <div className="relative">
                    <div className="relative flex items-center justify-center">
                      {/* Card 1 */}
                      <div className="bg-green-600 rounded-2xl p-6 w-full max-w-sm shadow-lg transform rotate-2 hover:rotate-0 transition-transform duration-300">
                        <div className="flex justify-between items-start mb-4">
                          <span className="text-white font-semibold text-sm">
                            VISURA.AI
                          </span>
                          <span className="text-white text-xs bg-green-500 px-2 py-1 rounded">
                            STEP {index + 1}
                          </span>
                        </div>
                        <div className="flex items-center justify-center h-20 bg-white/10 rounded-xl mb-4">
                          <div className="text-white">{step.icon}</div>
                        </div>
                        <div className="text-center">
                          <h3 className="text-white font-bold text-lg">
                            {step.title.toUpperCase()}
                          </h3>
                        </div>
                      </div>

                      {/* Card 2 - Offset */}
                      <div className="absolute top-4 left-4 bg-gradient-to-br from-green-700 via-emerald-600 to-teal-500 rounded-2xl p-6 w-full max-w-sm shadow-lg transform -rotate-2 hover:rotate-0 transition-transform duration-300 opacity-90">
                        <div className="flex justify-between items-start mb-4">
                          <span className="text-white font-semibold text-sm">
                            VISURA.AI
                          </span>
                          <span className="text-white text-xs bg-emerald-500 px-2 py-1 rounded">
                            PRO
                          </span>
                        </div>
                        <div className="flex items-center justify-center h-20 bg-white/10 rounded-xl mb-4 relative">
                          <div className="text-white">{step.icon}</div>
                          {/* Progress bars effect */}
                          <div className="absolute bottom-2 right-2 flex space-x-1">
                            <div className="w-1 h-4 bg-white/60 rounded"></div>
                            <div className="w-1 h-6 bg-white/80 rounded"></div>
                            <div className="w-1 h-3 bg-white/40 rounded"></div>
                            <div className="w-1 h-5 bg-white/70 rounded"></div>
                          </div>
                        </div>
                        <div className="text-center">
                          <h3 className="text-white font-bold text-lg">
                            {step.title.toUpperCase()}
                          </h3>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Side - Benefits and Description */}
                  <div className="flex">
                    <div className="w-[0.5px] bg-white/20"></div>
                    <div className="space-y-6 ml-6">
                      <p className="text-white text-lg leading-relaxed">
                        {step.description}
                      </p>

                      <div className="space-y-3">
                        {step.benefits.map((benefit, benefitIndex) => (
                          <div key={benefitIndex} className="flex items-center">
                            <span className="text-white/40 text-sm font-medium">
                              {benefit}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
