import type { ReactNode } from "react";
import Link from "next/link";

import { resolveRenderableHref } from "@/lib/security";
import { cn } from "@/lib/utils";

type SafeLinkProps = {
  href: string;
  className?: string;
  children: ReactNode;
};

/** Renders <Link> or external <a> only for validated hrefs; otherwise plain text wrapper. */
export function SafeLink({ href, className, children }: SafeLinkProps) {
  const resolved = resolveRenderableHref(href);

  if (!resolved) {
    return <span className={cn(className)}>{children}</span>;
  }

  if (resolved.kind === "external") {
    return (
      <a
        href={resolved.href}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(className)}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={resolved.href} className={cn(className)}>
      {children}
    </Link>
  );
}
