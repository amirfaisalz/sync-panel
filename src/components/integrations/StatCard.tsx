import { Card, CardContent } from "@/components/ui/card";
import type { ReactNode } from "react";

export function StatCard({
  icon,
  label,
  value,
  subtext,
}: {
  icon: ReactNode;
  label: string;
  value: string | number;
  subtext?: string;
}) {
  return (
    <Card className="border-border/50">
      <CardContent className="px-6 py-2">
        <div className="flex items-center gap-2 text-muted-foreground mb-2">
          {icon}
          <span className="text-sm">{label}</span>
        </div>
        <p className="text-2xl font-bold tracking-tight">{value}</p>
        {subtext && (
          <p className="text-xs text-muted-foreground mt-1">{subtext}</p>
        )}
      </CardContent>
    </Card>
  );
}
