'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Home, Heart, ShoppingBag, User } from 'lucide-react';
import { useCart } from '../../lib/context/CartContext';

interface BottomNavProps {
  chairId: string;
  activeTab?: 'home' | 'likes' | 'cart' | 'profile';
  disabledTabs?: ('home' | 'likes' | 'cart' | 'profile')[];
  showIndicatorArrowOnProfile?: boolean;
}

export default function CustomerBottomNav({
  chairId,
  activeTab,
  disabledTabs = [],
  showIndicatorArrowOnProfile = false,
}: BottomNavProps) {
  const { totalItemCount, likedItems } = useCart();
  const likedCount = Object.values(likedItems).filter(Boolean).length;
  const [selectedTab, setSelectedTab] = useState<'home' | 'likes' | 'cart' | 'profile' | undefined>(
    activeTab
  );

  useEffect(() => {
    setSelectedTab(activeTab);
  }, [activeTab]);

  const current = selectedTab ?? activeTab;

  const navItems = [
    {
      id: 'home' as const,
      label: 'Home',
      icon: Home,
      href: `/seat/${chairId}/menu`,
    },
    {
      id: 'likes' as const,
      label: 'Likes',
      icon: Heart,
      href: `/seat/${chairId}/likes`,
      badge: likedCount > 0,
    },
    {
      id: 'cart' as const,
      label: 'Cart',
      icon: ShoppingBag,
      href: `/seat/${chairId}/cart`,
      badge: totalItemCount > 0,
    },
    {
      id: 'profile' as const,
      label: 'Profile',
      icon: User,
      href: `/seat/${chairId}/profile`,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 w-full max-w-md mx-auto bg-[#FAF7F0]/95 backdrop-blur-md h-16 select-none border-t border-[#EAE3D5] shadow-[0_-4px_24px_rgba(40,55,45,0.06)]">
      {/* Continuous horizontal baseline under all icons */}
      <div className="absolute left-0 right-0 bottom-[14px] h-[2px] bg-[#1E3A2F]/15 pointer-events-none" />

      <div className="relative w-full h-full grid grid-cols-4 items-center">
        {navItems.map((item) => {
          const isSelected = current === item.id;
          const isDisabled = disabledTabs.includes(item.id);
          const Icon = item.icon;

          const content = (
            <div className="relative w-full h-full flex items-center justify-center">
              {/* Downward indicator arrow pointing at profile icon as shown in sketch */}
              {item.id === 'profile' && showIndicatorArrowOnProfile && (
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none z-20 animate-bounce">
                  <div className="w-[5px] h-5 bg-[#C85A32]" />
                  <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[10px] border-t-[#C85A32] -mt-[1px]" />
                </div>
              )}

              {/* Arch line rising above ONLY the selected icon */}
              {isSelected && (
                <svg
                  width="78"
                  height="44"
                  viewBox="0 0 78 44"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="absolute bottom-[13px] left-1/2 -translate-x-1/2 pointer-events-none"
                >
                  <defs>
                    <radialGradient id="haloGlow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#C85A32" stopOpacity="0.45" />
                      <stop offset="60%" stopColor="#C85A32" stopOpacity="0.15" />
                      <stop offset="100%" stopColor="#FAF7F0" stopOpacity="0" />
                    </radialGradient>
                  </defs>
                  {/* Warm fill mask that clears the baseline directly under the dome */}
                  <path
                    d="M 0,42 C 16,42 24,2 39,2 C 54,2 62,42 78,42 L 78,46 L 0,46 Z"
                    fill="#FAF7F0"
                  />
                  {/* Prominent peach-coral radial glow filling the dome */}
                  <circle cx="39" cy="22" r="28" fill="url(#haloGlow)" />
                  {/* Curved arch line running over the selected icon in organic forest green */}
                  <path
                    d="M 0,42 C 16,42 24,2 39,2 C 54,2 62,42 78,42"
                    stroke="#1E3A2F"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </svg>
              )}

              {/* Pure Icon: Sitting on the baseline; framed under the arch when selected */}
              <div
                className={`relative z-10 flex items-center justify-center transition-all duration-200 ${
                  isDisabled ? 'opacity-25 grayscale pointer-events-none' : ''
                } ${
                  isSelected
                    ? 'bottom-[6px] p-2 text-[#1E3A2F]'
                    : 'bottom-[4px] p-1.5 text-[#8C7A6B] hover:text-[#1E3A2F] active:scale-95'
                }`}
              >
                {/* Luminous warm glow halo directly surrounding icon */}
                {isSelected && (
                  <span className="absolute -inset-2 rounded-full bg-[radial-gradient(circle,_rgba(200,90,50,0.38)_0%,_rgba(200,90,50,0.12)_50%,_transparent_75%)] pointer-events-none" />
                )}

                <Icon
                  className={`transition-all ${
                    isSelected ? 'w-5 h-5 stroke-[2.5]' : 'w-5 h-5 stroke-[1.8]'
                  }`}
                />

                {/* Live Indicator Dot for Cart / Likes with warm orange accent */}
                {item.badge && !isSelected && !isDisabled && (
                  <span className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-[#C85A32] border border-[#FFFEFC]" />
                )}
              </div>
            </div>
          );

          if (isDisabled) {
            return (
              <div
                key={item.id}
                className="w-full h-full flex items-center justify-center cursor-not-allowed select-none"
                aria-disabled="true"
              >
                {content}
              </div>
            );
          }

          if (item.href) {
            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => setSelectedTab(item.id)}
                className="w-full h-full flex items-center justify-center cursor-pointer"
                aria-label={item.label}
              >
                {content}
              </Link>
            );
          }

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setSelectedTab(item.id)}
              className="w-full h-full flex items-center justify-center cursor-pointer"
              aria-label={item.label}
            >
              {content}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
