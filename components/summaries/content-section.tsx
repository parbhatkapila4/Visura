function parsePoint(point: string) {
  const isNumbered = /^\d+\./.test(point);
  const isMainPoint = /^[A-Z]/.test(point);
  const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]/u;
  const hasEmoji = emojiRegex.test(point);
  const isEmpty = point.trim() === "";
  
  // Check for different types of content
  const isDefinition = point.includes(":") && hasEmoji;
  const isActionItem = point.includes("✅") || point.includes("🎯") || point.includes("💡");
  const isWarning = point.includes("⚠️") || point.includes("🔒");
  const isData = point.includes("📊") || point.includes("📈");

  return { isNumbered, isMainPoint, hasEmoji, isEmpty, isDefinition, isActionItem, isWarning, isData };
}

export default function ContentSection({
  title,
  points,
}: {
  title: string;
  points: string[];
}) {
  return (
    <div className="space-y-4">
      {points.map((point, index) => {
        const { isNumbered, isMainPoint, hasEmoji, isEmpty, isDefinition, isActionItem, isWarning, isData } =
          parsePoint(point);

        if (hasEmoji || isMainPoint) {
          const emojiMatch = point.match(
            /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]/u
          );
          const emoji = emojiMatch ? emojiMatch[0] : "📝";
          const text = point
            .replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]/u, "")
            .replace(/^•\s*/, "")
            .replace(/^\s*•\s*/, "")
            .trim();

          // Determine card styling based on content type
          let cardClasses = "group relative bg-linear-to-br from-gray-200/[0.08] to-gray-400/[0.03] p-4 rounded-2xl border border-gray-500/10 hover:shadow-lg transition-all";
          let emojiClasses = "text-lg lg:text-xl shrink-0 pt-1";
          let textClasses = "text-lg lg:text-xl text-muted-foreground/90 leading-relaxed";

          if (isActionItem) {
            cardClasses = "group relative bg-gradient-to-br from-green-200/[0.08] to-green-400/[0.03] p-4 rounded-2xl border border-green-500/20 hover:shadow-lg transition-all";
            emojiClasses = "text-lg lg:text-xl shrink-0 pt-1 text-green-500";
          } else if (isWarning) {
            cardClasses = "group relative bg-gradient-to-br from-red-200/[0.08] to-red-400/[0.03] p-4 rounded-2xl border border-red-500/20 hover:shadow-lg transition-all";
            emojiClasses = "text-lg lg:text-xl shrink-0 pt-1 text-red-500";
          } else if (isData) {
            cardClasses = "group relative bg-gradient-to-br from-blue-200/[0.08] to-blue-400/[0.03] p-4 rounded-2xl border border-blue-500/20 hover:shadow-lg transition-all";
            emojiClasses = "text-lg lg:text-xl shrink-0 pt-1 text-blue-500";
          } else if (isDefinition) {
            cardClasses = "group relative bg-gradient-to-br from-purple-200/[0.08] to-purple-400/[0.03] p-4 rounded-2xl border border-purple-500/20 hover:shadow-lg transition-all";
            emojiClasses = "text-lg lg:text-xl shrink-0 pt-1 text-purple-500";
          }

          return (
            <div key={`point-${index}`} className={cardClasses}>
              <div className="absolute inset-0 bg-linear-to-r from-gray-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
              <div className="relative flex items-start gap-3">
                <span className={emojiClasses}>
                  {emoji}
                </span>
                <p className={textClasses}>
                  {text}
                </p>
              </div>
            </div>
          );
        }
        return (
          <div
            key={`point-${index}`}
            className="group relative bg-linear-to-br from-gray-200/[0.08] to-gray-400/[0.03] p-4 rounded-2xl border border-gray-500/10 hover:shadow-lg transition-all"
          >
            <div className="absolute inset-0 bg-linear-to-r from-gray-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
            <div className="relative">
              <p className="text-muted-foreground/90 leading-relaxed">
                {point.replace(/^•\s*/, "").replace(/^\s*•\s*/, "").trim()}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
