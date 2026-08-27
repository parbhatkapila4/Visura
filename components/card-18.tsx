import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { motion, type HTMLMotionProps } from "framer-motion";
import { ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const cardVariants = cva(
  "group relative flex flex-col overflow-hidden rounded-xl border shadow-sm transition-all duration-300 ease-in-out hover:shadow-md",
  {
    variants: {
      variant: {
        default: "p-6 md:p-7",
        featured: "flex-col md:flex-row",
      },
      theme: {
        light: "bg-card text-card-foreground border-border",
        dark: "bg-zinc-900/95 border-gray-700 text-white",
      },
    },
    defaultVariants: {
      variant: "default",
      theme: "light",
    },
  }
);

export interface BlogPostCardProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof cardVariants> {
  tag: string;
  date: string;
  title: string;
  description: string;
  imageUrl?: string;
  href?: string;
  readMoreText?: string;
  clickable?: boolean;
}

const BlogPostCard = React.forwardRef<HTMLDivElement, BlogPostCardProps>(
  (
    {
      className,
      variant,
      theme = "light",
      tag,
      date,
      title,
      description,
      imageUrl,
      href,
      readMoreText = "Read the full article",
      clickable = true,
      onDrag,
      onDragStart,
      onDragEnd,
      onDragOver,
      onDragLeave,
      onDrop,
      ...props
    },
    ref
  ) => {
    const isClickable = clickable && href;

    const cardHover = {
      hover: {
        y: -5,
        transition: {
          duration: 0.2,
          ease: "easeInOut" as const,
        },
      },
    };

    const content = (
      <>
        {variant === "featured" && imageUrl && (
          <div className="relative w-full overflow-hidden md:w-1/2 lg:w-3/5">
            <img
              src={imageUrl}
              alt={title}
              className="h-full w-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
            />
          </div>
        )}

        <div
          className={cn(
            "flex flex-1 flex-col justify-between",
            variant === "featured" && "p-8 md:p-10 lg:p-12"
          )}
        >
          <div>
            <div
              className={cn(
                "mb-5 flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-wide",
                theme === "dark" ? "text-gray-400" : "text-muted-foreground"
              )}
            >
              <span
                className={cn(
                  theme === "dark"
                    ? "rounded-full bg-white/10 px-3 py-1.5 text-white/90"
                    : "rounded-full bg-primary/10 px-3 py-1.5 text-primary"
                )}
              >
                {tag}
              </span>
              <span className={theme === "dark" ? "text-white/60" : undefined}>{date}</span>
            </div>

            <h3
              className={cn(
                "font-bold leading-tight",
                variant === "featured"
                  ? "mb-4 text-2xl md:text-3xl lg:text-[1.75rem]"
                  : "mb-3 text-xl md:text-[1.25rem]",
                theme === "dark" ? "text-white" : "text-foreground"
              )}
            >
              <span
                className={cn(
                  "bg-[length:0%_2px] bg-left-bottom bg-no-repeat transition-[background-size] duration-500 group-hover:bg-[length:100%_2px]",
                  theme === "dark"
                    ? "bg-gradient-to-r from-white to-white"
                    : "bg-gradient-to-r from-primary to-primary"
                )}
              >
                {title}
              </span>
            </h3>

            <p
              className={cn(
                "leading-relaxed",
                variant === "featured"
                  ? "text-base md:text-lg text-gray-400"
                  : "text-sm md:text-base",
                theme === "dark" ? "text-gray-400" : "text-muted-foreground"
              )}
            >
              {description}
            </p>
          </div>

          {variant === "featured" && isClickable && (
            <div className="mt-10">
              <Button
                variant={theme === "dark" ? "secondary" : "default"}
                className={cn(
                  "group/button",
                  theme === "dark" &&
                    "bg-gray-800 hover:bg-gray-700 text-white border border-gray-600"
                )}
              >
                {readMoreText}
                <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover/button:translate-x-1" />
              </Button>
            </div>
          )}
        </div>
      </>
    );

    return (
      <motion.div
        ref={ref}
        className={cn(
          cardVariants({ variant, theme, className }),
          !isClickable && "cursor-default"
        )}
        variants={cardHover}
        whileHover="hover"
        {...(props as Omit<
          HTMLMotionProps<"div">,
          "ref" | "className" | "variants" | "whileHover"
        >)}
      >
        {isClickable && href && (
          <a href={href} className="absolute inset-0 z-10" aria-label={`Read more about ${title}`}>
            <span className="sr-only">Read More</span>
          </a>
        )}
        <div className="relative z-0 flex h-full w-full flex-col md:flex-row">{content}</div>
      </motion.div>
    );
  }
);

BlogPostCard.displayName = "BlogPostCard";

export { BlogPostCard };
