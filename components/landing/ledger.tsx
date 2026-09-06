import { cn } from "@/lib/utils";

export interface LedgerRow {
  k: string;
  v: React.ReactNode;
  prose?: boolean;
}

export function Ledger({ rows, className }: { rows: LedgerRow[]; className?: string }) {
  return (
    <div className={className}>
      {rows.map((row) => (
        <div key={row.k} className="vs-ledger-row">
          <span className="vs-key shrink-0">{row.k}</span>
          <span
            className={cn("vs-ledger-v", row.prose ? "vs-prose" : "vs-mono")}
            style={{ color: "var(--ink)" }}
          >
            {row.v}
          </span>
        </div>
      ))}
    </div>
  );
}
