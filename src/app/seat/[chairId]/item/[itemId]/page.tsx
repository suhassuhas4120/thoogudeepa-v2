'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { ChevronLeft, ChevronRight, Heart, Minus, Plus } from 'lucide-react';
import { useCart } from '../../../../../lib/context/CartContext';
import { useHardwareBack } from '../../../../../lib/hooks/useHardwareBack';

export default function ItemCustomizationPage() {
  const router = useRouter();
  const params = useParams();
  const chairId = (params?.chairId as string) || '12';
  const itemId = (params?.itemId as string) || '1';

  // Device hardware back button & swipe back: return to menu
  useHardwareBack(`/seat/${chairId}/menu`);

  const { addItemWithDetails, toggleLike, isItemLiked } = useCart();

  const [quantity, setQuantity] = useState(1);
  const [selectedOption, setSelectedOption] = useState('Option 1');
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);

  // Multiple dish perspective visuals for wireframe presentation
  const dishImages = [
    {
      id: 1,
      renderIcon: () => (
        <svg viewBox="0 0 100 100" className="w-24 h-24 sm:w-28 sm:h-28 stroke-black fill-none stroke-[1.5]">
          <circle cx="50" cy="50" r="42" />
          <circle cx="50" cy="50" r="32" strokeDasharray="3 3" />
          <circle cx="50" cy="50" r="20" />
          <path d="M42 45 Q50 38 58 45 Q50 52 42 45" />
          <path d="M44 54 Q50 48 56 54 Q50 60 44 54" />
        </svg>
      ),
    },
    {
      id: 2,
      renderIcon: () => (
        <svg viewBox="0 0 100 100" className="w-24 h-24 sm:w-28 sm:h-28 stroke-black fill-none stroke-[1.5]">
          <circle cx="50" cy="50" r="42" />
          <circle cx="50" cy="50" r="28" />
          <circle cx="50" cy="50" r="14" strokeDasharray="2 2" />
          <circle cx="36" cy="36" r="6" />
          <circle cx="64" cy="64" r="7" />
        </svg>
      ),
    },
    {
      id: 3,
      renderIcon: () => (
        <svg viewBox="0 0 100 100" className="w-24 h-24 sm:w-28 sm:h-28 stroke-black fill-none stroke-[1.5]">
          <circle cx="42" cy="50" r="34" />
          <circle cx="74" cy="36" r="15" />
          <circle cx="74" cy="64" r="15" />
          <path d="M36 46 Q42 40 48 46" />
        </svg>
      ),
    },
    {
      id: 4,
      renderIcon: () => (
        <svg viewBox="0 0 100 100" className="w-24 h-24 sm:w-28 sm:h-28 stroke-black fill-none stroke-[1.5]">
          <path d="M28 36 H72 L66 74 H34 Z" />
          <ellipse cx="50" cy="36" rx="22" ry="7" />
          <path d="M42 22 Q46 16 46 22" strokeDasharray="2 2" />
          <path d="M50 20 Q54 14 54 20" strokeDasharray="2 2" />
          <path d="M58 22 Q62 16 62 22" strokeDasharray="2 2" />
        </svg>
      ),
    },
  ];

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchDeltaX, setTouchDeltaX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const totalImages = dishImages.length;

  const handlePrevImage = () => {
    setActiveImageIndex((prev) => (prev - 1 + totalImages) % totalImages);
  };

  const handleNextImage = () => {
    setActiveImageIndex((prev) => (prev + 1) % totalImages);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
    if (e.touches.length === 1) {
      setTouchStartX(e.touches[0].clientX);
      setTouchDeltaX(0);
      setIsDragging(true);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.stopPropagation();
    if (touchStartX !== null) {
      const delta = e.touches[0].clientX - touchStartX;
      setTouchDeltaX(delta);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.stopPropagation();
    if (touchStartX !== null) {
      if (touchDeltaX < -40) {
        handleNextImage();
      } else if (touchDeltaX > 40) {
        handlePrevImage();
      }
    }
    setTouchStartX(null);
    setTouchDeltaX(0);
    setIsDragging(false);
  };

  const toggleAddOn = (addon: string) => {
    setSelectedAddOns((prev) =>
      prev.includes(addon) ? prev.filter((a) => a !== addon) : [...prev, addon]
    );
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItemWithDetails(itemId, quantity, selectedOption, selectedAddOns);
    router.push(`/seat/${chairId}/menu`);
  };

  return (
    <div className="min-h-screen w-full bg-white text-black flex flex-col justify-between max-w-md mx-auto relative px-4 pt-4 pb-24 select-none">
      {/* Scrollable Content Container */}
      <div className="w-full flex flex-col gap-6">
        {/* Top Header */}
        <header className="w-full flex items-center justify-between py-2">
          {/* Back Button to Menu */}
          <Link
            href={`/seat/${chairId}/menu`}
            className="w-10 h-10 border border-black rounded-lg flex items-center justify-center cursor-pointer active:opacity-70"
            aria-label="Back to Menu"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>

          {/* Title Placeholder */}
          <div className="text-center font-bold text-sm uppercase tracking-wider">
            Details
          </div>

          {/* Favorite Action Button connected to global likes */}
          <button
            type="button"
            onClick={() => toggleLike(itemId)}
            className={`w-10 h-10 border border-black rounded-lg flex items-center justify-center cursor-pointer active:scale-95 transition-all ${
              isItemLiked(itemId) ? 'bg-black text-white' : 'bg-white text-black'
            }`}
            aria-label="Favorite"
          >
            <Heart className={`w-5 h-5 ${isItemLiked(itemId) ? 'fill-current' : ''}`} />
          </button>
        </header>

        {/* Hero Interactive Sliding Carousel Section */}
        <div className="w-full flex flex-col items-center gap-3 relative">
          {/* Carousel Viewport with touch swipe & arrow buttons */}
          <div className="w-full flex items-center justify-between gap-1 relative px-2">
            {/* Previous Image Button */}
            <button
              type="button"
              onClick={handlePrevImage}
              className="w-9 h-9 rounded-full border border-black flex items-center justify-center bg-white cursor-pointer active:scale-90 transition-transform z-10"
              aria-label="Previous"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Sliding Dish Circle Display */}
            <div
              className="relative overflow-hidden w-48 h-48 sm:w-56 sm:h-56 rounded-full border-2 border-black flex items-center justify-center bg-white cursor-grab active:cursor-grabbing touch-pan-y shadow-xs"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <div
                className="w-full h-full flex items-center transition-transform duration-300 ease-out"
                style={{
                  transform: `translateX(-${activeImageIndex * 100}%)`,
                }}
              >
                {dishImages.map((img) => (
                  <div
                    key={img.id}
                    className="w-full h-full flex-shrink-0 flex items-center justify-center p-3"
                  >
                    {img.renderIcon()}
                  </div>
                ))}
              </div>
            </div>

            {/* Next Image Button */}
            <button
              type="button"
              onClick={handleNextImage}
              className="w-9 h-9 rounded-full border border-black flex items-center justify-center bg-white cursor-pointer active:scale-90 transition-transform z-10"
              aria-label="Next"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Carousel Indicator Dots */}
          <div className="flex items-center gap-2 mt-1">
            {dishImages.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveImageIndex(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`transition-all rounded-full cursor-pointer ${
                  activeImageIndex === idx
                    ? 'w-4 h-2 bg-black'
                    : 'w-2 h-2 border border-black bg-white hover:bg-zinc-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Title & Price Section */}
        <div className="w-full flex items-center justify-between border-b border-black pb-4">
          <div className="flex flex-col gap-1">
            <div className="text-lg font-bold">
              Item Title {itemId}
            </div>
            <div className="text-xs text-zinc-600">
              Category Tag
            </div>
          </div>
          <div className="text-xl font-bold">
            ₹ ---
          </div>
        </div>

        {/* Description Section */}
        <div className="w-full flex flex-col gap-2">
          <span className="text-xs font-bold uppercase tracking-wider">
            Description
          </span>
          <div className="w-full flex flex-col gap-1.5">
            <div className="w-full h-3 bg-zinc-200 border border-zinc-300 rounded" />
            <div className="w-5/6 h-3 bg-zinc-200 border border-zinc-300 rounded" />
            <div className="w-4/6 h-3 bg-zinc-200 border border-zinc-300 rounded" />
          </div>
        </div>

        {/* Customization Options Section */}
        <div className="w-full flex flex-col gap-3 border-t border-black pt-4">
          <span className="text-xs font-bold uppercase tracking-wider">
            Customization Options
          </span>
          <div className="grid grid-cols-3 gap-2">
            {['Option 1', 'Option 2', 'Option 3'].map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setSelectedOption(opt)}
                className={`py-2 px-3 border text-xs font-bold rounded-lg cursor-pointer transition-all ${
                  selectedOption === opt
                    ? 'border-black bg-black text-white'
                    : 'border-black bg-white text-black'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Add-ons Options Section */}
        <div className="w-full flex flex-col gap-2.5 border-t border-black pt-4">
          <span className="text-xs font-bold uppercase tracking-wider">
            Add-ons Options
          </span>
          <div className="flex flex-col gap-2">
            {['Add-on 1', 'Add-on 2', 'Add-on 3'].map((addon) => (
              <label
                key={addon}
                className="flex items-center justify-between border border-black p-2.5 rounded-lg cursor-pointer bg-white"
              >
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={selectedAddOns.includes(addon)}
                    onChange={() => toggleAddOn(addon)}
                    className="w-4 h-4 accent-black"
                  />
                  <span className="text-xs font-semibold">{addon}</span>
                </div>
                <span className="text-xs font-bold">+ ₹ ---</span>
              </label>
            ))}
          </div>
        </div>

        {/* Quantity Stepper Section */}
        <div className="w-full flex items-center justify-between border-t border-black pt-4">
          <span className="text-xs font-bold uppercase tracking-wider">
            Quantity
          </span>
          <div className="flex items-center border border-black">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="w-9 h-9 flex items-center justify-center border-r border-black cursor-pointer active:bg-zinc-200"
              aria-label="Decrease quantity"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-10 text-center font-bold text-sm">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity((q) => q + 1)}
              className="w-9 h-9 flex items-center justify-center border-l border-black cursor-pointer active:bg-zinc-200"
              aria-label="Increase quantity"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Sticky Action Bar */}
      <div className="sticky bottom-0 z-30 w-full max-w-md bg-white border-t-2 border-black pt-3 pb-2 mt-8 flex items-center justify-between gap-3">
        <div className="flex flex-col">
          <span className="text-[10px] text-zinc-500 uppercase">Total</span>
          <span className="text-base font-bold">₹ ---</span>
        </div>
        <button
          type="button"
          onClick={handleAddToCart}
          className="flex-1 border-2 border-black bg-black text-white py-3 px-4 text-sm font-bold uppercase tracking-wider cursor-pointer active:opacity-80 transition-opacity"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}
