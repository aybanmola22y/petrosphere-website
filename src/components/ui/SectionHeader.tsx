import React from 'react';
import { cn } from '@/lib/utils';

interface SectionHeaderProps {
  title: React.ReactNode;
  eyebrow?: string;
  description?: string;
  className?: string;
  alignment?: 'left' | 'center';
}

export function SectionHeader({ title, eyebrow, description, className, alignment = 'left' }: SectionHeaderProps) {
  return (
    <div className={cn(
      "mb-12 md:mb-16", 
      alignment === 'center' ? 'mx-auto text-center items-center flex flex-col' : 'max-w-3xl',
      className
    )}>
      {eyebrow && (
        <div className="text-primary font-medium text-sm tracking-wide uppercase mb-4">
          {eyebrow}
        </div>
      )}
      <h2 className="text-display-3 text-foreground text-balance">
        {title}
      </h2>
      {description && (
        <p className="mt-6 text-lg text-muted-foreground leading-relaxed text-balance max-w-2xl">
          {description}
        </p>
      )}
    </div>
  );
}
