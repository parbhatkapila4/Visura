"use client";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Upload, FileText, Sparkles, CheckCircle2, MessageCircle, Play, Pause, Zap } from "lucide-react";

const TypeWriter = ({ text, speed = 30, delay = 0 }: { text: string; speed?: number; delay?: number }) => {
  const [displayText, setDisplayText] = useState("");
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const startTimeout = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(startTimeout);
  }, [delay]);

  useEffect(() => {
    if (!started) return;
    let i = 0;
    const interval = setInterval(() => {
      if (i < text.length) {
        setDisplayText(text.slice(0, i + 1));
        i++;
      } else {
        clearInterval(interval);
      }
    }, speed);
    return () => clearInterval(interval);
  }, [started, text, speed]);

  return <span>{displayText}</span>;
};

const MockPDFViewer = () => (
  <div className="w-full h-full bg-white rounded-lg overflow-hidden shadow-2xl">
    <div className="bg-gray-50 px-4 py-2 flex items-center gap-3 border-b border-gray-200">
      <div className="flex gap-1.5">
        <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
        <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
        <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
      </div>
      <div className="flex-1 text-center text-xs text-gray-500 font-medium">quarterly_report.pdf</div>
    </div>
    <div className="p-4 space-y-3 bg-gradient-to-br from-gray-50 to-white">
      <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse" />
      <div className="h-2.5 bg-gray-100 rounded w-full" />
      <div className="h-2.5 bg-gray-100 rounded w-5/6" />
      <div className="h-2.5 bg-gray-100 rounded w-4/5" />
      <div className="mt-3 h-2.5 bg-gray-100 rounded w-full" />
      <div className="h-2.5 bg-gray-100 rounded w-3/4" />
      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="h-16 bg-gradient-to-br from-blue-50 to-blue-100 rounded border border-blue-200" />
        <div className="h-16 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded border border-emerald-200" />
      </div>
    </div>
  </div>
);

const AIChatInterface = ({ isActive }: { isActive: boolean }) => {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [currentMessage, setCurrentMessage] = useState(0);

  const demoMessages = [
    { role: "user", content: "What are the key findings?" },
    { role: "ai", content: "Key findings:\n\n1. Revenue up 23% YoY\n2. CAC reduced by 15%\n3. 3 new market regions\n4. NPS score: 72" },
  ];

  useEffect(() => {
    if (!isActive) return;
    const showNext = () => {
      if (currentMessage < demoMessages.length) {
        setMessages(prev => [...prev, demoMessages[currentMessage]]);
        setCurrentMessage(prev => prev + 1);
      }
    };
    const timeout = setTimeout(showNext, currentMessage === 0 ? 1000 : 2000);
    return () => clearTimeout(timeout);
  }, [isActive, currentMessage]);

  return (
    <div className="w-full h-full bg-gradient-to-br from-gray-900 to-black rounded-lg overflow-hidden flex flex-col border border-white/10 shadow-2xl">
      <div className="px-4 py-3 border-b border-white/10 flex items-center gap-3 bg-black/50">
        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#ff6b00] to-[#ff00ff] flex items-center justify-center shadow-lg">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <div>
          <div className="text-sm font-semibold text-white">Visura AI</div>
          <div className="text-xs text-white/50">Always ready</div>
        </div>
      </div>
      <div className="flex-1 p-4 space-y-3 overflow-y-auto">
        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] px-3 py-2 rounded-xl text-sm ${
                msg.role === 'user' 
                  ? 'bg-gradient-to-r from-[#ff6b00] to-[#ff00ff] text-white rounded-br-sm shadow-lg' 
                  : 'bg-white/10 text-white/90 rounded-bl-sm backdrop-blur-sm'
              }`}>
                <div className="whitespace-pre-line leading-relaxed">{msg.content}</div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

const ProcessingStage = ({ icon: Icon, label, isActive, isComplete }: any) => (
  <motion.div
    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all ${
      isActive ? 'bg-[#ff6b00]/20 border border-[#ff6b00]/30' : isComplete ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-white/5 border border-white/10'
    }`}
    animate={isActive ? { scale: [1, 1.02, 1] } : {}}
    transition={{ duration: 1.5, repeat: isActive ? Infinity : 0 }}
  >
    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
      isComplete ? 'bg-emerald-500/20' : isActive ? 'bg-[#ff6b00]/20' : 'bg-white/5'
    }`}>
      {isComplete ? (
        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
      ) : (
        <Icon className={`w-4 h-4 ${isActive ? 'text-[#ff6b00]' : 'text-white/30'}`} />
      )}
    </div>
    <div className="flex-1 min-w-0">
      <div className={`text-xs font-medium truncate ${isComplete || isActive ? 'text-white' : 'text-white/40'}`}>
        {label}
      </div>
      {isActive && (
        <motion.div className="h-0.5 mt-1.5 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-[#ff6b00] to-[#ff00ff]"
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 2, ease: "linear" }}
          />
        </motion.div>
      )}
    </div>
  </motion.div>
);

export default function DemoSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [demoStage, setDemoStage] = useState<'idle' | 'uploading' | 'processing' | 'analyzing' | 'complete'>('idle');
  const [showChat, setShowChat] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const stages = [
    { id: 'uploading', icon: Upload, label: 'Uploading...' },
    { id: 'processing', icon: FileText, label: 'Processing...' },
    { id: 'analyzing', icon: Sparkles, label: 'AI analyzing...' },
    { id: 'complete', icon: CheckCircle2, label: 'Ready!' },
  ];

  const startDemo = () => {
    setIsPlaying(true);
    setDemoStage('uploading');
    setShowChat(false);
    setTimeout(() => setDemoStage('processing'), 2000);
    setTimeout(() => setDemoStage('analyzing'), 4000);
    setTimeout(() => {
      setDemoStage('complete');
      setShowChat(true);
    }, 6000);
  };

  const resetDemo = () => {
    setIsPlaying(false);
    setDemoStage('idle');
    setShowChat(false);
  };

  return (
    <section ref={ref} id="demo" className="relative py-20 overflow-hidden bg-black">
      {/* Subtle background gradient */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,107,0,0.08)_0%,transparent_70%)]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <motion.div 
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#ff6b00]/30 bg-[#ff6b00]/10 mb-4"
            whileHover={{ scale: 1.05, borderColor: "rgba(255,107,0,0.5)" }}
          >
            <Zap className="w-3.5 h-3.5 text-[#ff6b00]" />
            <span className="text-xs font-medium text-white/70">Live Demo</span>
          </motion.div>

          <h2 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tight">
            See the<span className="bg-gradient-to-r from-[#ff6b00] to-[#ff00ff] bg-clip-text text-transparent"> magic </span>happen
          </h2>
          <p className="text-base text-white/50 max-w-lg mx-auto">
            Watch as we transform a 50-page document into actionable insights in real-time.
          </p>
        </motion.div>

        {/* Demo Container */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative"
        >
          <div className="relative rounded-xl overflow-hidden border border-white/10 bg-gradient-to-br from-white/[0.03] to-transparent backdrop-blur-xl shadow-2xl">
            {/* Browser Bar */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-black/50">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                </div>
                <div className="text-xs text-white/40 font-mono">visura.ai/demo</div>
              </div>
              <motion.button
                onClick={isPlaying ? resetDemo : startDemo}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#ff6b00] to-[#ff00ff] text-white text-xs font-semibold shadow-lg"
                whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(255,107,0,0.4)" }}
                whileTap={{ scale: 0.95 }}
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                {isPlaying ? 'Reset' : 'Play Demo'}
              </motion.button>
            </div>

            {/* Main Content */}
            <div className="grid md:grid-cols-2 gap-4 p-4">
              {/* Left: PDF Viewer */}
              <div className="space-y-3">
                <div className="relative h-[280px] rounded-lg overflow-hidden">
                  <MockPDFViewer />
                  <AnimatePresence>
                    {demoStage !== 'idle' && demoStage !== 'complete' && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center"
                      >
                        <motion.div
                          className="w-16 h-16 rounded-full border-3 border-[#ff6b00]/30 border-t-[#ff6b00]"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                        <div className="mt-3 text-sm text-white font-medium">
                          {stages.find(s => s.id === demoStage)?.label}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <AnimatePresence>
                    {demoStage === 'complete' && !showChat && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-emerald-500/20 backdrop-blur-sm flex flex-col items-center justify-center"
                      >
                        <motion.div 
                          initial={{ scale: 0 }} 
                          animate={{ scale: 1 }} 
                          transition={{ type: "spring", bounce: 0.4 }}
                        >
                          <CheckCircle2 className="w-12 h-12 text-emerald-400" />
                        </motion.div>
                        <div className="mt-2 text-sm text-white font-medium">Complete!</div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                
                {/* Processing Stages */}
                <div className="space-y-1.5">
                  {stages.map((stage) => (
                    <ProcessingStage
                      key={stage.id}
                      {...stage}
                      isActive={demoStage === stage.id}
                      isComplete={stages.findIndex(s => s.id === demoStage) > stages.findIndex(s => s.id === stage.id)}
                    />
                  ))}
                </div>
              </div>

              {/* Right: AI Chat */}
              <div className="relative">
                <div className="h-[280px] rounded-lg overflow-hidden">
                  {showChat ? (
                    <AIChatInterface isActive={showChat} />
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-black text-center p-6 border border-white/10 rounded-lg">
                      <MessageCircle className="w-12 h-12 text-white/20 mb-3" />
                      <div className="text-white/40 text-xs">AI chat will appear here after processing</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Decorative corners */}
          <div className="absolute -top-2 -left-2 w-6 h-6 border-l-2 border-t-2 border-[#ff6b00]/40 rounded-tl-lg" />
          <div className="absolute -top-2 -right-2 w-6 h-6 border-r-2 border-t-2 border-[#ff00ff]/40 rounded-tr-lg" />
          <div className="absolute -bottom-2 -left-2 w-6 h-6 border-l-2 border-b-2 border-[#00ff88]/40 rounded-bl-lg" />
          <div className="absolute -bottom-2 -right-2 w-6 h-6 border-r-2 border-b-2 border-[#0088ff]/40 rounded-br-lg" />
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-8"
        >
          <p className="text-white/40 text-sm mb-4">Ready to experience this with your own documents?</p>
          <motion.a
            href="/sign-up"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-black font-semibold text-sm shadow-lg"
            whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(255,107,0,0.3)" }}
            whileTap={{ scale: 0.95 }}
          >
            Try it free
            <motion.span animate={{ x: [0, 4, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>→</motion.span>
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}
