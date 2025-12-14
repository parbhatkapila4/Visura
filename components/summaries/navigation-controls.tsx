import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function NavigationControls({
  currentSection,
  totalSections,
  onPrevious,
  onNext,
  onSectionSelect,
}: {
  currentSection: number;
  totalSections: number;
  onPrevious: () => void;
  onNext: () => void;
  onSectionSelect: (index: number) => void;
}) {
  return (
    <div
      className="absolute bottom-0 left-0 right-0 p-4
      bg-background/80 backdrop-blur-xs border-t
      border-green-900/10"
    >
      <div className="flex justify-between items-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={onPrevious}
          disabled={currentSection === 0}
          className={cn(
            "rounded-full w-12 h-12 transition-all",
            "duration-200 bg-gradient-to-br from-green-900",
            "to-green-800 backdrop-blur-xs border",
            "border-green-900/10",
            currentSection === 0 ? "opacity-50" : "hover:bg-green-900/20"
          )}
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>

        <div className="flex gap-2">
          {Array.from({ length: totalSections }).map((_, index) => (
            <button
              key={index}
              onClick={() => onSectionSelect(index)}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-300",
                currentSection === index
                  ? "bg-gradient-to-r from-green-900 to-green-800"
                  : "bg-green-900/20 hover:bg-green-900/30"
              )}
            />
          ))}
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={onNext}
          disabled={currentSection === totalSections - 1}
          className={cn(
            "rounded-full w-12 h-12 transition-all",
            "duration-200 bg-gradient-to-br from-green-900",
            "to-green-800 backdrop-blur-xs border",
            "border-green-900/10",
            currentSection === totalSections - 1 ? "opacity-50" : "hover:bg-green-900/20"
          )}
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
}
