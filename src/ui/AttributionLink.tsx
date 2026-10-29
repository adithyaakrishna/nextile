"use client";

import type { ReactNode } from "react";
import { track } from "@/analytics/client";
import type { AttributionPlacement } from "@/config";

interface AttributionLinkProps {
  href: string;
  placement: AttributionPlacement;
  children: ReactNode;
  className?: string;
}

export function AttributionLink({ href, placement, children, className = "link" }: AttributionLinkProps) {
  const isExternal = href.startsWith("http");
  return (
    <a
      href={href}
      className={className}
      onClick={() => track({ name: "attribution_clicked", props: { placement } })}
      {...(isExternal ? { target: "_blank", rel: "noopener" } : {})}
    >
      {children}
    </a>
  );
}
