"use client";

import Link from "next/link";
import { PlugZap, ArrowLeft } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function IntegrationNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] max-w-md mx-auto text-center px-4 animate-in fade-in zoom-in duration-500">
      <div className="relative mb-8 group">
        <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full transition-all group-hover:bg-primary/30 duration-700" />
        <div className="size-28 rounded-[2rem] bg-card border shadow-2xl flex items-center justify-center relative z-10 transition-transform group-hover:scale-105 duration-500">
          <div className="relative">
            <PlugZap className="size-12 text-muted-foreground stroke-[1.5]" />
            <div className="absolute -bottom-1 -right-1 size-5 bg-background rounded-full flex items-center justify-center">
              <div className="size-3 bg-destructive rounded-full animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      <h2 className="text-3xl font-bold tracking-tight text-foreground mb-3">
        Integration Not Found
      </h2>

      <p className="text-muted-foreground text-[15px] mb-8 leading-relaxed">
        We couldn&apos;t locate the integration you&apos;re searching for. It
        might have been removed, disconnected, or the URL might be incorrect.
      </p>

      <Link
        href="/integrations"
        className={cn(
          buttonVariants({ size: "lg" }),
          "gap-2 shadow-sm rounded-full px-8 transition-transform hover:scale-105 active:scale-95",
        )}
      >
        <ArrowLeft className="size-4" />
        Return to Integrations
      </Link>
    </div>
  );
}
