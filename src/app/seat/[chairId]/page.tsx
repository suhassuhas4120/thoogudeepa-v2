'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import { useHardwareBack } from '../../../lib/hooks/useHardwareBack';

interface SeatPageProps {
  params: Promise<{
    chairId: string;
  }>;
}

export default function CustomerSeatPage({ params }: SeatPageProps) {
  const resolvedParams = use(params);
  const chairId = resolvedParams?.chairId || '12';

  // Prevent device back gestures from exiting the application on entrance screen
  useHardwareBack(`/seat/${chairId}`);

  const seatNumber = chairId.replace(/[^0-9]/g, '') || chairId;

  const [customerName, setCustomerName] = useState('');

  const targetMenuUrl = `/seat/${chairId}/menu${
    customerName.trim() ? `?name=${encodeURIComponent(customerName.trim())}` : ''
  }`;

  return (
    <div className="min-h-screen w-full bg-white text-black flex flex-col items-center justify-between px-6 py-12">
      {/* Upper area with enlarged circular logo */}
      <div className="w-full max-w-sm flex flex-col items-center pt-4 sm:pt-8">
        <div className="w-40 h-40 sm:w-44 sm:h-44 rounded-full border-2 border-black flex items-center justify-center shadow-xs">
          <span className="text-base font-bold">Logo</span>
        </div>
      </div>

      {/* Center area with Seat No and Name input */}
      <div className="w-full max-w-sm flex flex-col items-center gap-5 my-auto py-6">
        <div className="w-full text-center py-2.5 border border-black">
          <span className="text-lg font-bold">Seat No: {seatNumber}</span>
        </div>

        <div className="w-full flex flex-col gap-1.5">
          <label htmlFor="customerName" className="text-sm font-medium">
            Name
          </label>
          <input
            id="customerName"
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Enter Name"
            className="w-full border border-black px-3 py-2.5 text-base outline-none bg-white text-black rounded-none"
          />
        </div>
      </div>

      {/* Bottom area with Start Ordering button linking directly to Menu */}
      <div className="w-full max-w-sm pb-4 sm:pb-8">
        <Link
          href={targetMenuUrl}
          className="w-full block text-center border-2 border-black bg-black text-white py-3.5 text-base font-bold uppercase tracking-wider cursor-pointer active:opacity-80"
        >
          Start Ordering
        </Link>
      </div>
    </div>
  );
}
