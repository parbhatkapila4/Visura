export default function UploadHeader() {
  return (
    <div className="text-center max-w-2xl mx-auto">
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#111] border border-[#1f1f1f] mb-4">
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-xs text-[#888]">Ready to process</span>
      </div>
      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-white tracking-tight mb-3">
        Upload your document
      </h1>
      <p className="text-[#666] text-base sm:text-lg max-w-md mx-auto">
        Our AI will analyze and summarize your document in seconds. Supports PDF, Word, Text, Markdown, Excel, and PowerPoint.
      </p>
    </div>
  );
}
