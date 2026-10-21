import React from 'react';

export const dynamicParams = true;

export function generateStaticParams() {
  // Pre-generate primary demo seats; all remaining seats 01-100 render on-demand via dynamicParams
  return [
    { chairId: '01' },
    { chairId: '02' },
    { chairId: '03' },
    { chairId: '04' },
    { chairId: '05' },
    { chairId: '10' },
    { chairId: '12' },
  ];
}

export default function SeatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#FAF7F0] via-[#F7F2EA] to-[#F3ECE1] text-[#1A2621]">
      {children}
    </div>
  );
}
