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
  return <>{children}</>;
}
