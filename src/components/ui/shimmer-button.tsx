import React from 'react';
import { cn } from '../../lib/utils';

interface ShimmerButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
}

export const ShimmerButton: React.FC<ShimmerButtonProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <button
      className={cn(
        'relative px-6 py-3 rounded-lg font-semibold text-white',
        'bg-gradient-to-r from-blue-600 to-blue-800',
        'hover:from-blue-700 hover:to-blue-900',
        'transition-all duration-200 shadow-lg hover:shadow-xl',
        'overflow-hidden',
        className
      )}
      {...props}
    >
      <span className="relative z-10">{children}</span>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
    </button>
  );
};
