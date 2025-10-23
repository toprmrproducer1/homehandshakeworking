import React from 'react';

interface TestimonialsColumnProps {
  className?: string;
}

export const TestimonialsColumn: React.FC<TestimonialsColumnProps> = ({ className }) => {
  const testimonials = [
    {
      name: 'John Doe',
      role: 'Content Creator',
      content: 'This platform has transformed how I create content!',
    },
    {
      name: 'Jane Smith',
      role: 'Marketing Manager',
      content: 'Amazing AI tools that save hours of work.',
    },
  ];

  return (
    <div className={`grid gap-6 md:grid-cols-2 ${className || ''}`}>
      {testimonials.map((testimonial, index) => (
        <div
          key={index}
          className="bg-blue-900/20 border border-blue-500/20 rounded-xl p-6"
        >
          <p className="text-gray-300 mb-4">{testimonial.content}</p>
          <div>
            <p className="text-white font-semibold">{testimonial.name}</p>
            <p className="text-blue-300 text-sm">{testimonial.role}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
