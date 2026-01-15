"use client";

export default function MobileNewChatButton() {
  return (
    <button
      type="button"
      className="md:hidden h-8 px-3 rounded-lg bg-white/5 hover:bg-white/10 border border-[#2a2a2a] text-xs text-white transition-colors"
      onClick={() => {
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("chatbot-new-chat"));
        }
      }}
    >
      New chat
    </button>
  );
}
