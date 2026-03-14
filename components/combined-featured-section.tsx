'use client'

import { Activity, ArrowRight, Files, Flower, GalleryVerticalEnd, MapPin } from 'lucide-react'
import DottedMap from 'dotted-map'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts'
import * as React from "react"
import * as RechartsPrimitive from "recharts"
import { cn } from "@/lib/utils"

const panelClass = "rounded-none overflow-hidden border border-gray-700 bg-zinc-900/95"

export default function CombinedFeaturedSection() {
  const featuredCaseStudy = {
    tags: "For Teams",
    title: "How teams understand 10K+ documents",
    subtitle: "without the hassle. Smart extraction, instant search, and AI that answers from your files.",
  }

  return (
    <section className="pt-20 pb-16 bg-black" style={{ backgroundColor: "#000000" }}>
      <div className="max-w-[1400px] mx-auto px-6 lg:px-8">

        <div className="text-center mb-10">
          <div className="flex flex-col items-center gap-3 mb-8">
            <span
              className="relative inline-flex items-center rounded-full px-6 py-2.5 text-[11px] font-semibold tracking-[0.28em] text-white/90 uppercase"
              style={{
                border: "1px solid rgba(255,255,255,0.18)",
                background: "linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)",
                boxShadow:
                  "0 0 0 1px rgba(255,255,255,0.06) inset, 0 1px 0 0 rgba(255,255,255,0.08) inset, 0 0 24px -4px rgba(255,255,255,0.06)",
              }}
            >
              Features
            </span>
            <span
              className="h-px w-14 rounded-full opacity-80"
              style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)" }}
              aria-hidden
            />
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-2">
            From upload to insights,{" "}
            <span
              className="text-white border-b-2 border-white/40 pb-0.5"
              style={{ fontFamily: "var(--font-display), ui-serif, Georgia, serif" }}
            >
              in seconds
            </span>
          </h2>
          <p className="text-base text-white/50 max-w-2xl mx-auto">
            Summaries, search, and chat, all powered by AI. Visura turns your PDFs and documents into answers you can use.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 md:grid-rows-2 gap-0">


          <div className={cn(panelClass, "p-4")}>
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
              <MapPin className="w-4 h-4 text-gray-500" />
              Visura Insights
            </div>
            <h3 className="text-lg font-normal text-white">
              See where your documents are in use.{" "}
              <span className="font-normal text-gray-400">Track uploads, summaries, and sharing across your workspace.</span>
            </h3>

            <div className="relative mt-2 min-h-[140px]">
              <div className="absolute top-8 left-1/2 -translate-x-1/2 z-10 px-3 py-1.5 bg-zinc-800 border border-gray-700 rounded-lg text-xs font-medium text-white flex items-center gap-2 shadow-lg">
                <span className="w-2 h-2 rounded-full bg-sky-400 shrink-0" />
                <span>🌍 Last summary · US workspace</span>
              </div>
              <Map />
            </div>
          </div>


          <div className={cn(panelClass, "flex flex-col gap-4 p-4")}>
            <div className="space-y-2">
              <span className="text-sm flex items-center gap-2 text-gray-400">
                <GalleryVerticalEnd className="w-4 h-4 text-gray-500" /> {featuredCaseStudy.tags}
              </span>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <h3 className="text-lg md:text-xl leading-snug text-white max-w-full">
                  <span className="font-bold">{featuredCaseStudy.title}</span>{" "}
                  <span className="font-normal text-white/90">{featuredCaseStudy.subtitle}</span>
                </h3>
              </div>
            </div>
            <div className="flex justify-center items-start w-full min-h-0 flex-1">
              <FeaturedActivityCard />
            </div>
          </div>


          <div className={cn(panelClass, "p-4 space-y-2")}>
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
              <Activity className="w-4 h-4" />
              Visura Processing
            </div>
            <h3 className="text-lg font-normal text-white">
              <span className="font-semibold">Real-time document processing for Visura.</span>{" "}
              <span className="font-normal text-gray-400">From upload to insights in under 30 seconds.</span>
            </h3>
            <MonitoringChart />
          </div>


          <div className={cn(panelClass, "grid sm:grid-cols-2 divide-x divide-gray-700")}>
            <FeatureCard
              icon={<Files className="w-4 h-4" />}
              title="Upload & summarize"
              subtitle="Any format"
              description="PDF, Word, or more. We extract key points and summaries in seconds."
              visual="summary"
            />
            <FeatureCard
              icon={<Flower className="w-4 h-4" />}
              title="Chat with your docs"
              subtitle="Ask anything"
              description="Get answers from your documents using AI-powered search and chat."
              visual="chat"
            />
          </div>
        </div>
      </div>
    </section>
  );
}


function SummaryPreview() {
  const lines = [
    "• Revenue up 24% YoY; margin stable",
    "• Key risks: supply chain, talent",
    "• Next: Q2 planning review",
  ]
  return (
    <div className="rounded-lg border border-gray-700 bg-zinc-800/90 flex flex-col p-3 flex-1 min-h-0 relative pr-12 pb-12">
      <span className="text-[10px] font-semibold text-white/70 uppercase tracking-wider mb-2">Summary</span>
      <div className="space-y-1.5">
        {lines.map((line, i) => (
          <p key={i} className="text-xs text-gray-400 leading-snug">{line}</p>
        ))}
      </div>
    </div>
  )
}

function ChatPreview() {
  return (
    <div className="rounded-lg border border-gray-700 bg-zinc-800/90 flex flex-col justify-end gap-2 p-3 flex-1 min-h-0 relative pr-12 pb-12">
      <div className="rounded-lg bg-sky-500/20 border border-sky-500/30 px-2.5 py-1.5 self-end max-w-[95%]">
        <p className="text-xs text-white/90">What were the main findings?</p>
      </div>
      <div className="rounded-lg bg-zinc-700/80 border border-gray-600 px-2.5 py-1.5 self-start max-w-[95%]">
        <p className="text-xs text-gray-300">3 key findings: growth, risks, next steps.</p>
      </div>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  subtitle,
  description,
  visual,
}: {
  icon: React.ReactNode
  title: string
  subtitle: string
  description: string
  visual?: 'summary' | 'chat'
}) {
  return (
    <div className="relative flex flex-col gap-3 p-4 min-h-[180px] bg-zinc-900/95">
      <div className="shrink-0">
        <span className="text-xs flex items-center gap-2 text-gray-500 mb-1">
          {icon}
          {title}
        </span>
        <h3 className="text-base font-normal text-white leading-snug mt-2">
          <span className="font-semibold">{subtitle}</span>{" "}
          <span className="font-normal text-gray-400 text-sm">{description}</span>
        </h3>
      </div>

      <div className="flex-1 min-h-[80px] relative mt-3">
        {visual === 'summary' && <SummaryPreview />}
        {visual === 'chat' && <ChatPreview />}
        {!visual && (
          <div className="absolute bottom-0 right-0 w-20 h-16 sm:w-28 sm:h-20 border border-gray-700 border-r-0 border-b-0 rounded-tl-lg bg-zinc-800/80" />
        )}
        <div className="absolute bottom-0 right-0 p-2 border border-gray-600 rounded-full bg-zinc-900 hover:bg-zinc-800 transition z-10">
          <ArrowRight className="w-3.5 h-3.5 text-gray-300" />
        </div>
      </div>
    </div>
  )
}


const map = new DottedMap({ height: 55, grid: 'diagonal' })
const points = map.getPoints()

const Map = () => (
  <svg viewBox="0 0 120 60" className="w-full h-auto text-gray-500">
    {points.map((point, i) => (
      <circle key={i} cx={point.x} cy={point.y} r={0.15} fill="currentColor" />
    ))}
  </svg>
)


const chartData = [
  { month: 'May', desktop: 56, mobile: 224 },
  { month: 'June', desktop: 90, mobile: 300 },
  { month: 'July', desktop: 126, mobile: 252 },
  { month: 'Aug', desktop: 205, mobile: 410 },
  { month: 'Sep', desktop: 200, mobile: 126 },
  { month: 'Oct', desktop: 400, mobile: 800 },
]

const chartConfig = {
  desktop: {
    label: 'Documents processed',
    color: '#2563eb',
  },
  mobile: {
    label: 'Summaries generated',
    color: '#60a5fa',
  },
} satisfies ChartConfig


function MonitoringChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; dataKey: string; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null
  const config: Record<string, string> = { desktop: 'Documents processed', mobile: 'Summaries generated' }
  return (
    <div className="rounded-lg border border-gray-600 bg-zinc-800/95 px-4 py-3 shadow-xl min-w-[11rem]">
      {label && (
        <div className="text-xs font-medium text-white/90 mb-2.5 pb-2 border-b border-white/10">
          {label}
        </div>
      )}
      <div className="grid gap-2.5">
        {payload.map((item) => (
          <div key={item.dataKey} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm text-white/90">
                {config[item.dataKey] ?? item.dataKey}
              </span>
            </div>
            <span className="text-sm font-semibold tabular-nums text-white">
              {typeof item.value === 'number' ? item.value.toLocaleString() : item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function MonitoringChart() {
  return (
    <ChartContainer className="h-44 aspect-auto" config={chartConfig}>
      <AreaChart data={chartData}>
        <defs>
          <linearGradient id="fillDesktop" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-desktop)" stopOpacity={0.8} />
            <stop offset="55%" stopColor="var(--color-desktop)" stopOpacity={0.1} />
          </linearGradient>
          <linearGradient id="fillMobile" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-mobile)" stopOpacity={0.8} />
            <stop offset="55%" stopColor="var(--color-mobile)" stopOpacity={0.1} />
          </linearGradient>
        </defs>
        <XAxis hide />
        <YAxis hide />
        <CartesianGrid vertical={false} horizontal={false} />
        <ChartTooltip cursor={false} content={<MonitoringChartTooltip />} />
        <Area strokeWidth={2} dataKey="mobile" type="monotone" fill="url(#fillMobile)" stroke="var(--color-mobile)" />
        <Area strokeWidth={2} dataKey="desktop" type="monotone" fill="url(#fillDesktop)" stroke="var(--color-desktop)" />
      </AreaChart>
    </ChartContainer>
  )
}


interface Message {
  title: string;
  time: string;
  content: string;
  color: string;
}

const activityMessages: Message[] = [
  {
    title: "Summary ready",
    time: "1m ago",
    content: "Your PDF summary is ready to view and share.",
    color: "from-pink-400 to-indigo-500",
  },
  {
    title: "New upload",
    time: "3m ago",
    content: "contract.pdf was added to your workspace.",
    color: "from-orange-500 to-pink-500",
  },
  {
    title: "Chat reply",
    time: "5m ago",
    content: "AI answered your question about the report.",
    color: "from-yellow-400 to-red-400",
  },
  {
    title: "Export complete",
    time: "10m ago",
    content: "Summary exported as Markdown to your device.",
    color: "from-sky-400 to-blue-700",
  },
];

const FeaturedActivityCard = () => {
  const displayMessages = activityMessages.slice(0, 4)
  return (
    <div className="w-full max-w-sm space-y-2">
      {displayMessages.map((msg, i) => (
        <div
          key={i}
          className="flex gap-3 items-start p-3 rounded-lg bg-slate-800/90 border border-transparent shadow-sm"
        >
          <div className={cn("w-8 h-8 min-w-[2rem] min-h-[2rem] rounded-lg bg-gradient-to-br shrink-0", msg.color)} />
          <div className="flex flex-col min-w-0 flex-1 pt-0.5">
            <div className="flex items-center gap-1.5 text-xs">
              <span className="font-bold text-white">{msg.title}</span>
              <span className="text-gray-500">•</span>
              <span className="text-xs font-normal text-gray-400 shrink-0">{msg.time}</span>
            </div>
            <p className="text-xs font-normal text-white/80 mt-0.5 line-clamp-1 leading-snug">
              {msg.content}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};



const THEMES = { light: "", dark: ".dark" } as const

export type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode
    icon?: React.ComponentType
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<keyof typeof THEMES, string> }
  )
}

type ChartContextProps = {
  config: ChartConfig
}

const ChartContext = React.createContext<ChartContextProps | null>(null)

function useChart() {
  const context = React.useContext(ChartContext)

  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />")
  }

  return context
}

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    config: ChartConfig
    children: React.ComponentProps<
      typeof RechartsPrimitive.ResponsiveContainer
    >["children"]
  }
>(({ id, className, children, config, ...props }, ref) => {
  const uniqueId = React.useId()
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-chart={chartId}
        ref={ref}
        className={cn(
          "flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-none [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-sector]:outline-none [&_.recharts-surface]:outline-none",
          className,
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer>
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  )
})
ChartContainer.displayName = "Chart"

const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  const colorConfig = Object.entries(config).filter(
    ([_, config]) => config.theme || config.color,
  )

  if (!colorConfig.length) {
    return null
  }

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(THEMES)
          .map(
            ([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${colorConfig
                .map(([key, itemConfig]) => {
                  const color =
                    itemConfig.theme?.[theme as keyof typeof itemConfig.theme] ||
                    itemConfig.color
                  return color ? `  --color-${key}: ${color};` : null
                })
                .join("\n")}
}
`,
          )
          .join("\n"),
      }}
    />
  )
}

const ChartTooltip = RechartsPrimitive.Tooltip as React.FC<RechartsPrimitive.TooltipProps<any, any>>

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  {
    active?: boolean
    payload?: Array<any>
    label?: React.ReactNode
    labelFormatter?: (label: any, payload: Array<any>) => React.ReactNode
    labelClassName?: string
    formatter?: (value: any, name: any, item: any, index: number, payload: any) => React.ReactNode
    color?: string
    hideLabel?: boolean
    hideIndicator?: boolean
    indicator?: "line" | "dot" | "dashed"
    nameKey?: string
    labelKey?: string
  } & React.ComponentProps<"div">
>(
  (
    {
      active,
      payload,
      className,
      indicator = "dot",
      hideLabel = false,
      hideIndicator = false,
      label,
      labelFormatter,
      labelClassName,
      formatter,
      color,
      nameKey,
      labelKey,
    },
    ref,
  ) => {
    const { config } = useChart()

    const tooltipLabel = React.useMemo(() => {
      if (hideLabel || !payload?.length) {
        return null
      }

      const [item] = payload
      const key = `${labelKey || item.dataKey || item.name || "value"}`
      const itemConfig = getPayloadConfigFromPayload(config, item, key)
      const value =
        !labelKey && typeof label === "string"
          ? config[label as keyof typeof config]?.label || label
          : itemConfig?.label

      if (labelFormatter) {
        return (
          <div className={cn("font-medium", labelClassName)}>
            {labelFormatter(value, payload)}
          </div>
        )
      }

      if (!value) {
        return null
      }

      return <div className={cn("font-medium", labelClassName)}>{value}</div>
    }, [
      label,
      labelFormatter,
      payload,
      hideLabel,
      labelClassName,
      config,
      labelKey,
    ])

    if (!active || !payload?.length) {
      return null
    }

    const nestLabel = payload.length === 1 && indicator !== "dot"

    return (
      <div
        ref={ref}
        className={cn(
          "grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl",
          className,
        )}
      >
        {!nestLabel ? tooltipLabel : null}
        <div className="grid gap-1.5">
          {payload.map((item, index) => {
            const key = `${nameKey || item.name || item.dataKey || "value"}`
            const itemConfig = getPayloadConfigFromPayload(config, item, key)
            const indicatorColor = color || item.payload.fill || item.color

            return (
              <div
                key={item.dataKey}
                className={cn(
                  "flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-muted-foreground",
                  indicator === "dot" && "items-center",
                )}
              >
                {formatter && item?.value !== undefined && item.name ? (
                  formatter(item.value, item.name, item, index, item.payload)
                ) : (
                  <>
                    {itemConfig?.icon ? (
                      <itemConfig.icon />
                    ) : (
                      !hideIndicator && (
                        <div
                          className={cn(
                            "shrink-0 rounded-[2px] border-[--color-border] bg-[--color-bg]",
                            {
                              "h-2.5 w-2.5": indicator === "dot",
                              "w-1": indicator === "line",
                              "w-0 border-[1.5px] border-dashed bg-transparent":
                                indicator === "dashed",
                              "my-0.5": nestLabel && indicator === "dashed",
                            },
                          )}
                          style={
                            {
                              "--color-bg": indicatorColor,
                              "--color-border": indicatorColor,
                            } as React.CSSProperties
                          }
                        />
                      )
                    )}
                    <div
                      className={cn(
                        "flex flex-1 justify-between leading-none",
                        nestLabel ? "items-end" : "items-center",
                      )}
                    >
                      <div className="grid gap-1.5">
                        {nestLabel ? tooltipLabel : null}
                        <span className="text-muted-foreground">
                          {itemConfig?.label || item.name}
                        </span>
                      </div>
                      {item.value && (
                        <span className="font-mono font-medium tabular-nums text-foreground">
                          {typeof item.value === 'number' ? item.value.toLocaleString() : item.value}
                        </span>
                      )}
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  },
)
ChartTooltipContent.displayName = "ChartTooltip"

const ChartLegend = RechartsPrimitive.Legend as unknown as React.FC<RechartsPrimitive.LegendProps>

const ChartLegendContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    payload?: Array<any>
    verticalAlign?: 'top' | 'middle' | 'bottom'
    hideIcon?: boolean
    nameKey?: string
  }
>(
  (
    { className, hideIcon = false, payload, verticalAlign = "bottom", nameKey },
    ref,
  ) => {
    const { config } = useChart()

    if (!payload?.length) {
      return null
    }

    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center justify-center gap-4",
          verticalAlign === "top" ? "pb-3" : "pt-3",
          className,
        )}
      >
        {payload.map((item) => {
          const key = `${nameKey || item.dataKey || "value"}`
          const itemConfig = getPayloadConfigFromPayload(config, item, key)

          return (
            <div
              key={item.value}
              className={cn(
                "flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:text-muted-foreground",
              )}
            >
              {itemConfig?.icon && !hideIcon ? (
                <itemConfig.icon />
              ) : (
                <div
                  className="h-2 w-2 shrink-0 rounded-[2px]"
                  style={{
                    backgroundColor: item.color,
                  }}
                />
              )}
              {itemConfig?.label}
            </div>
          )
        })}
      </div>
    )
  },
)
ChartLegendContent.displayName = "ChartLegend"


function getPayloadConfigFromPayload(
  config: ChartConfig,
  payload: unknown,
  key: string,
) {
  if (typeof payload !== "object" || payload === null) {
    return undefined
  }

  const payloadObj = payload as Record<string, unknown>

  const payloadPayload =
    "payload" in payloadObj &&
      typeof payloadObj.payload === "object" &&
      payloadObj.payload !== null
      ? payloadObj.payload as Record<string, unknown>
      : undefined

  let configLabelKey: string = key

  if (
    key in payloadObj &&
    typeof payloadObj[key] === "string"
  ) {
    configLabelKey = payloadObj[key] as string
  } else if (
    payloadPayload &&
    key in payloadPayload &&
    typeof payloadPayload[key] === "string"
  ) {
    configLabelKey = payloadPayload[key] as string
  }

  return configLabelKey in config
    ? config[configLabelKey]
    : config[key] as unknown as (typeof config)[keyof typeof config] | undefined
}

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartStyle,
}
