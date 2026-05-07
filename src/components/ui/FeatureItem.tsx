import React from 'react';
import { FiCheckCircle } from 'react-icons/fi';
import { cn } from '@/lib/utils';

interface FeatureItemProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  className?: string;
}

export function FeatureItem({ title, description, icon, className }: FeatureItemProps) {
  return (
    <div className={cn("flex items-start gap-4", className)}>
      <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center shrink-0 border border-primary/10">
        {icon ? (
          <div className="text-primary text-xl">{icon}</div>
        ) : (
          <FiCheckCircle className="text-primary text-xl" />
        )}
      </div>
      <div>
        <h4 className="text-lg font-semibold text-foreground mb-1">{title}</h4>
        <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
      </div>
    </div>
  );
}