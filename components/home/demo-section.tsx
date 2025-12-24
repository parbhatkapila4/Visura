"use client";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import {
  Upload,
  FileText,
  Sparkles,
  CheckCircle2,
  MessageCircle,
  Play,
  Pause,
  Zap,
  ArrowRight,
  Loader2,
} from "lucide-react";

const MockPDFViewer = () => (
  <div className="w-full h-full bg-white rounded-xl overflow-hidden shadow-2xl border border-gray-200">
    <div className="bg-gradient-to-r from-gray-50 to-white px-5 py-3 flex items-center gap-3 border-b border-gray-200">
      <div className="flex gap-2">
        <div className="w-3 h-3 rounded-full bg-red-400 shadow-sm" />
        <div className="w-3 h-3 rounded-full bg-yellow-400 shadow-sm" />
        <div className="w-3 h-3 rounded-full bg-green-400 shadow-sm" />
      </div>
      <div className="flex-1 text-center text-sm text-gray-600 font-semibold">
        quarterly_report.pdf
      </div>
    </div>
    <div className="p-6 space-y-4 bg-gradient-to-br from-white via-gray-50 to-white">
      <div className="space-y-2">
        <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-4/5 animate-pulse" />
        <div className="h-3 bg-gray-100 rounded w-full" />
        <div className="h-3 bg-gray-100 rounded w-5/6" />
        <div className="h-3 bg-gray-100 rounded w-4/5" />
      </div>
      <div className="mt-6 space-y-2">
        <div className="h-3 bg-gray-100 rounded w-full" />
        <div className="h-3 bg-gray-100 rounded w-3/4" />
      </div>
      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="h-20 bg-gradient-to-br from-blue-50 via-blue-100 to-blue-50 rounded-lg border-2 border-blue-200 shadow-sm" />
        <div className="h-20 bg-gradient-to-br from-emerald-50 via-emerald-100 to-emerald-50 rounded-lg border-2 border-emerald-200 shadow-sm" />
      </div>
      <div className="mt-4 space-y-2">
        <div className="h-3 bg-gray-100 rounded w-full" />
        <div className="h-3 bg-gray-100 rounded w-2/3" />
      </div>
    </div>
  </div>
);

const AIChatInterface = ({ isActive }: { isActive: boolean }) => {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [currentMessage, setCurrentMessage] = useState(0);

  const demoMessages = [
    { role: "user", content: "What are the key findings?" },
    {
      role: "ai",
      content:
        "Key findings:\n\n1. Revenue up 23% YoY\n2. CAC reduced by 15%\n3. 3 new market regions\n4. NPS score: 72",
    },
  ];

  useEffect(() => {
    if (!isActive) return;
    const showNext = () => {
      if (currentMessage < demoMessages.length) {
        setMessages((prev) => [...prev, demoMessages[currentMessage]]);
        setCurrentMessage((prev) => prev + 1);
      }
    };
    const timeout = setTimeout(showNext, currentMessage === 0 ? 800 : 2000);
    return () => clearTimeout(timeout);
  }, [isActive, currentMessage]);

  return (
    <div className="w-full h-full bg-gradient-to-br from-gray-950 via-black to-gray-950 rounded-xl overflow-hidden flex flex-col border border-white/10 shadow-2xl">
      <div className="px-5 py-4 border-b border-white/10 flex items-center gap-3 bg-black/60 backdrop-blur-sm">
        <motion.div
          className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#ff6b00] to-[#ff00ff] flex items-center justify-center shadow-lg"
          animate={{
            boxShadow: [
              "0 0 20px rgba(255,107,0,0.3)",
              "0 0 30px rgba(255,0,255,0.4)",
              "0 0 20px rgba(255,107,0,0.3)",
            ],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Sparkles className="w-5 h-5 text-white" />
        </motion.div>
        <div>
          <div className="text-sm font-bold text-white">Visura AI</div>
          <div className="text-xs text-white/60">Always ready</div>
        </div>
        <div className="ml-auto">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </div>
      </div>
      <div className="flex-1 p-5 space-y-4 overflow-y-auto bg-gradient-to-b from-black/50 to-transparent">
        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.4, type: "spring", stiffness: 200 }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-gradient-to-r from-[#ff6b00] to-[#ff00ff] text-white rounded-br-md shadow-xl"
                    : "bg-white/10 text-white/95 rounded-bl-md backdrop-blur-sm border border-white/5"
                }`}
              >
                <div className="whitespace-pre-line">{msg.content}</div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

const ProcessingStage = ({ icon: Icon, label, isActive, isComplete, index }: any) => {
  const stageIndex = ["uploading", "processing", "analyzing", "complete"].indexOf(
    label.toLowerCase().replace("...", "").replace("!", "")
  );

  return (
    <motion.div
      className={`relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all overflow-hidden ${
        isActive
          ? "bg-gradient-to-r from-[#ff6b00]/20 to-[#ff00ff]/20 border-2 border-[#ff6b00]/40 shadow-lg"
          : isComplete
          ? "bg-emerald-500/10 border-2 border-emerald-500/30"
          : "bg-white/5 border border-white/10"
      }`}
      animate={
        isActive
          ? {
              scale: [1, 1.02, 1],
              boxShadow: [
                "0 0 0px rgba(255,107,0,0)",
                "0 0 20px rgba(255,107,0,0.3)",
                "0 0 0px rgba(255,107,0,0)",
              ],
            }
          : {}
      }
      transition={{ duration: 2, repeat: isActive ? Infinity : 0 }}
    >
      {isActive && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-[#ff6b00]/10 via-[#ff00ff]/10 to-[#ff6b00]/10"
          animate={{
            x: ["-100%", "100%"],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      )}

      <div
        className={`relative z-10 w-10 h-10 rounded-lg flex items-center justify-center ${
          isComplete
            ? "bg-emerald-500/20 border-2 border-emerald-400/50"
            : isActive
            ? "bg-gradient-to-br from-[#ff6b00]/30 to-[#ff00ff]/30 border-2 border-[#ff6b00]/50"
            : "bg-white/5 border border-white/10"
        }`}
      >
        {isComplete ? (
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
        ) : isActive ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          >
            <Icon className="w-5 h-5 text-[#ff6b00]" />
          </motion.div>
        ) : (
          <Icon className="w-5 h-5 text-white/30" />
        )}
      </div>
      <div className="relative z-10 flex-1 min-w-0">
        <div
          className={`text-sm font-semibold ${
            isComplete || isActive ? "text-white" : "text-white/40"
          }`}
        >
          {label}
        </div>
        {isActive && (
          <motion.div className="h-1 mt-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-[#ff6b00] via-[#ff00ff] to-[#ff6b00]"
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 2, ease: "linear" }}
            />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default function DemoSection() {
  const ref = useRef(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [demoStage, setDemoStage] = useState<
    "idle" | "uploading" | "processing" | "analyzing" | "complete"
  >("idle");
  const [showChat, setShowChat] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const stages = [
    { id: "uploading", icon: Upload, label: "Uploading..." },
    { id: "processing", icon: FileText, label: "Processing..." },
    { id: "analyzing", icon: Sparkles, label: "AI analyzing..." },
    { id: "complete", icon: CheckCircle2, label: "Ready!" },
  ];

  const startDemo = () => {
    if (videoRef.current) {
      videoRef.current.style.display = "block";
      setIsPlaying(true);
      videoRef.current.play().catch((error) => {
        console.error("Error playing video:", error);
      });
    }
  };

  const resetDemo = () => {
    if (videoRef.current) {
      setIsPlaying(false);
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      videoRef.current.style.display = "none";
      setDemoStage("idle");
      setShowChat(false);
    }
  };

  const handleVideoEnd = () => {
    setIsPlaying(false);
    setDemoStage("idle");
    setShowChat(false);
  };

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.defaultPlaybackRate = 1.0;
      videoRef.current.playbackRate = 1.0;
    }
  }, []);

  return (
    <section ref={ref} id="demo" className="relative py-24 overflow-hidden bg-black">
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#ff6b00]/40 bg-gradient-to-r from-[#ff6b00]/10 to-[#ff00ff]/10 mb-6 backdrop-blur-sm"
            whileHover={{
              scale: 1.05,
              borderColor: "rgba(255,107,0,0.6)",
              boxShadow: "0 0 20px rgba(255,107,0,0.2)",
            }}
          >
            <Zap className="w-4 h-4 text-[#ff6b00]" />
            <span className="text-sm font-semibold text-white/90">Live Demo</span>
          </motion.div>

          <h2 className="text-4xl md:text-6xl font-black text-white mb-5 tracking-tight">
            See the
            <span className="bg-gradient-to-r from-[#ff6b00] via-[#ff00ff] to-[#00ff88] bg-clip-text text-transparent">
              {" "}
              magic{" "}
            </span>
            happen
          </h2>
          <p className="text-lg text-white/60 max-w-2xl mx-auto leading-relaxed">
            Watch as we transform a 50-page document into actionable insights in real-time.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-[#ff6b00] via-[#ff00ff] to-[#00ff88] rounded-2xl opacity-20 blur-xl" />

          <div className="relative rounded-2xl overflow-hidden border-2 border-white/10 bg-gradient-to-br from-white/[0.05] via-black/50 to-black backdrop-blur-2xl shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-gradient-to-r from-black/80 via-black/60 to-black/80 backdrop-blur-xl">
              <div className="flex items-center gap-4">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400 shadow-sm" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400 shadow-sm" />
                  <div className="w-3 h-3 rounded-full bg-green-400 shadow-sm" />
                </div>
                <div className="text-sm text-white/50 font-mono font-medium">visura.ai/demo</div>
              </div>
              <motion.button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log("Button clicked, isPlaying:", isPlaying);
                  if (isPlaying) {
                    resetDemo();
                  } else {
                    startDemo();
                  }
                }}
                className="relative flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#ff6b00] to-[#ff00ff] text-white text-sm font-bold shadow-xl overflow-hidden group"
                whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(255,107,0,0.5)" }}
                whileTap={{ scale: 0.95 }}
                type="button"
              >
                <motion.div className="absolute inset-0 bg-gradient-to-r from-[#ff00ff] to-[#ff6b00] opacity-0 group-hover:opacity-100 transition-opacity" />
                {isPlaying ? (
                  <>
                    <Pause className="w-4 h-4 relative z-10" />
                    <span className="relative z-10">Reset</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 relative z-10" />
                    <span className="relative z-10">Play Demo</span>
                  </>
                )}
              </motion.button>
            </div>

            <div className="p-6">
              <div
                className="relative w-full aspect-video rounded-xl overflow-hidden bg-black"
                style={{
                  transform: "translateZ(0)",
                  willChange: "contents",
                  backfaceVisibility: "hidden",
                }}
              >
                <video
                  ref={videoRef}
                  src="/visura-demo.mp4"
                  className="w-full h-full object-contain"
                  style={{
                    display: isPlaying ? "block" : "none",
                    transform: "translateZ(0)",
                    willChange: "auto",
                    backfaceVisibility: "hidden",
                    WebkitTransform: "translateZ(0)",
                    WebkitBackfaceVisibility: "hidden",
                  }}
                  controls={true}
                  onEnded={handleVideoEnd}
                  onPlay={() => {
                    setIsPlaying(true);
                  }}
                  onPause={() => {
                    setIsPlaying(false);
                  }}
                  onError={(e) => {
                    console.error("Video error:", e, videoRef.current?.error);
                    setIsPlaying(false);
                  }}
                  playsInline
                  preload="none"
                  muted={false}
                  disablePictureInPicture
                  disableRemotePlayback
                />
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-12"
        >
          <p className="text-white/50 text-base mb-6">
            Ready to experience this with your own documents?
          </p>
          <motion.a
            href="/sign-up"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white text-black font-bold text-base shadow-2xl group"
            whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(255,107,0,0.4)" }}
            whileTap={{ scale: 0.95 }}
          >
            Try it free
            <motion.span
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="group-hover:translate-x-1 transition-transform"
            >
              <ArrowRight className="w-5 h-5" />
            </motion.span>
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}
