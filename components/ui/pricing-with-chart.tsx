"use client";

import { Button } from "@/components/ui/button";
import { CheckCircleIcon } from "lucide-react";
import { CartesianGrid, Line, LineChart, XAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

export function PricingWithChart() {
  return (
    <div className="mx-auto max-w-6xl">
      <div className="mx-auto mb-10 max-w-2xl text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-white lg:text-5xl">
          Pricing that Scales with You
        </h1>
        <p className="mt-4 text-sm text-zinc-400 md:text-base">
          From AI summaries and document chat to team workspaces and analytics - pick the plan that fits your document workflow.
        </p>
      </div>

      <div className="grid rounded-2xl border border-white/10 bg-zinc-900/95 shadow-xl shadow-black/20 md:grid-cols-6">
        <div className="flex flex-col justify-between border-b border-white/10 p-6 md:col-span-2 md:border-b-0 md:border-r">
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold text-white">
                Free
              </h2>
              <span className="my-3 block text-3xl font-bold text-primary">
                $0
              </span>
              <p className="text-sm text-zinc-400">
                Best for trying document intelligence
              </p>
            </div>

            <p className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-center text-sm text-zinc-400">
              Default plan - no sign-up required
            </p>

            <div className="my-6 h-px w-full bg-white/10" />

            <ul className="space-y-3 text-sm text-zinc-300">
              {[
                "Document upload & AI summaries (limited)",
                "Basic analytics dashboard",
                "Email support",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <CheckCircleIcon className="h-4 w-4 shrink-0 text-primary" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="z-10 grid gap-8 overflow-hidden p-6 md:col-span-4 lg:grid-cols-2">
          <div className="flex flex-col justify-between space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-white">Pro Monthly Package</h2>
              <span className="my-3 block text-3xl font-bold text-primary">
                $20
              </span>
              <p className="text-sm text-zinc-400">
                Perfect for small businesses & startups
              </p>
            </div>
            <div className="h-fit w-full rounded-lg border border-white/10 bg-zinc-800/50 p-2">
              <InterestChart />
            </div>
          </div>

          <div className="relative w-full">
            <div className="text-sm font-medium text-white">Everything in Free plus:</div>
            <ul className="mt-4 space-y-3 text-sm text-zinc-300">
              {[
                "Unlimited document processing",
                "Priority customer support",
                "Advanced analytics & metrics dashboard",
                "Team workspaces & real-time collaboration",
                "Expanded cloud storage for documents",
                "Custom document types & processing rules",
                "API access & third-party integrations",
                "Role-based access control (Owner, Admin, Member, Viewer)",
                "Higher processing limits & priority queue",
                "Early access to new features & updates",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <CheckCircleIcon className="h-4 w-4 shrink-0 text-primary" />
                  {item}
                </li>
              ))}
            </ul>

            <div className="mt-10">
              <Button
                asChild
                className="w-full bg-primary text-primary-foreground shadow-lg hover:opacity-90 hover:text-primary-foreground"
              >
                <a href="/checkout">Get Started</a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InterestChart() {
  const chartData = [
    { month: "January", interest: 120 },
    { month: "February", interest: 180 },
    { month: "March", interest: 150 },
    { month: "April", interest: 210 },
    { month: "May", interest: 250 },
    { month: "June", interest: 300 },
    { month: "July", interest: 280 },
    { month: "August", interest: 320 },
    { month: "September", interest: 340 },
    { month: "October", interest: 390 },
    { month: "November", interest: 420 },
    { month: "December", interest: 500 },
  ];

  const chartConfig = {
    interest: {
      label: "Interest",
      color: "var(--primary)",
    },
  } satisfies ChartConfig;

  return (
    <Card className="border-white/10 bg-zinc-800/40">
      <CardHeader className="space-y-0 border-b border-white/10 p-3">
        <CardTitle className="text-lg text-white">Plan Popularity</CardTitle>
        <CardDescription className="text-xs text-zinc-400">
          Monthly trend of people considering this plan.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-3">
        <ChartContainer
          config={chartConfig}
          className="[&_.recharts-cartesian-axis-tick_text]:fill-zinc-400 [&_.recharts-cartesian-grid_line]:stroke-white/10"
        >
          <LineChart data={chartData} margin={{ left: 12, right: 12 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => String(value).slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  className="border-white/20 bg-zinc-800 text-zinc-100 shadow-xl [&_.text-muted-foreground]:!text-zinc-400 [&_.text-foreground]:!text-white"
                />
              }
            />
            <Line
              dataKey="interest"
              type="monotone"
              stroke="var(--color-interest)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

