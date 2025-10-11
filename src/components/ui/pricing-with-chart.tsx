import React from 'react';
import { Check } from 'lucide-react';

interface PricingWithChartProps {
  className?: string;
}

export const PricingWithChart: React.FC<PricingWithChartProps> = ({ className }) => {
  const plans = [
    {
      name: 'Starter',
      price: '$9',
      features: ['5 Videos/month', 'Basic AI Tools', 'Email Support'],
    },
    {
      name: 'Pro',
      price: '$29',
      features: ['Unlimited Videos', 'Advanced AI', 'Priority Support', 'Custom Branding'],
      popular: true,
    },
    {
      name: 'Enterprise',
      price: '$99',
      features: ['Everything in Pro', 'API Access', 'Dedicated Support', 'Custom Integration'],
    },
  ];

  return (
    <div className={`grid gap-6 md:grid-cols-3 ${className || ''}`}>
      {plans.map((plan, index) => (
        <div
          key={index}
          className={`bg-blue-900/20 border ${
            plan.popular ? 'border-blue-500' : 'border-blue-500/20'
          } rounded-xl p-6 ${plan.popular ? 'scale-105' : ''}`}
        >
          {plan.popular && (
            <span className="inline-block px-3 py-1 bg-blue-600 text-white text-xs rounded-full mb-4">
              Most Popular
            </span>
          )}
          <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
          <p className="text-4xl font-bold text-blue-400 mb-6">
            {plan.price}
            <span className="text-lg text-gray-400">/month</span>
          </p>
          <ul className="space-y-3">
            {plan.features.map((feature, idx) => (
              <li key={idx} className="flex items-center text-gray-300">
                <Check className="h-5 w-5 text-green-500 mr-2" />
                {feature}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};
