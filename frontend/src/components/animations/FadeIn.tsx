
import React from 'react';
import { cn } from '@/lib/utils';

type FadeInProps = {
  children: React.ReactNode;
  delay?: 'none' | '75' | '100' | '150' | '200' | '300' | '400' | '500' | '700' | '1000';
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  fullWidth?: boolean;
  className?: string;
};

export const FadeIn: React.FC<FadeInProps> = ({
  children,
  delay = 'none',
  direction = 'up',
  fullWidth = false,
  className,
}) => {
  const directionMap = {
    up: 'animate-fade-in',
    down: 'animate-fade-in',
    left: 'animate-fade-left',
    right: 'animate-fade-right',
    none: 'animate-fade-in',
  };

  const delayClass = delay !== 'none' ? `delay-${delay}` : '';

  return (
    <div
      className={cn(
        'opacity-0',
        directionMap[direction],
        delayClass,
        fullWidth ? 'w-full' : '',
        className
      )}
    >
      {children}
    </div>
  );
};
