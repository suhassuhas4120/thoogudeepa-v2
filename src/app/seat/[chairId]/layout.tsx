import React from 'react';

export const dynamicParams = true;

export function generateStaticParams() {
  const seats: { chairId: string }[] = [];
  for (let i = 1; i <= 100; i++) {
    // Both 2-digit padded ('01', '02', '04', ...) and numeric string ('1', '2', '4', ...)
    seats.push({ chairId: String(i).padStart(2, '0') });
    seats.push({ chairId: String(i) });
  }
  return seats;
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
