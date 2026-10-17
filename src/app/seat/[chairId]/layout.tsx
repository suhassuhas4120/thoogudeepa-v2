import React from 'react';

export function generateStaticParams() {
  // Pre-generate primary active seats for compact static deployment
  return ['12', '1', '2', '3', '4', '5'].map((chairId) => ({ chairId }));
}

export default function SeatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
