import React from 'react';

export interface ChartConfig {
  [key: string]: {
    label?: string;
    color?: string;
  };
}

interface ChartContainerProps {
  config: ChartConfig;
  children: React.ReactNode;
  className?: string;
}

export const ChartContainer: React.FC<ChartContainerProps> = ({
  config,
  children,
  className,
}) => {
  return <div className={className}>{children}</div>;
};

interface ChartTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

export const ChartTooltip: React.FC<ChartTooltipProps> = () => {
  return null;
};

export const ChartTooltipContent: React.FC<ChartTooltipProps> = ({
  active,
  payload,
  label,
}) => {
  if (!active || !payload) return null;

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-lg">
      {label && <p className="text-gray-300 text-sm mb-2">{label}</p>}
      {payload.map((entry: any, index: number) => (
        <p key={index} className="text-white text-sm">
          {entry.name}: {entry.value}
        </p>
      ))}
    </div>
  );
};
