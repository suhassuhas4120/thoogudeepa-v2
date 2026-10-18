'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { ChevronLeft, ChevronRight, Heart, Minus, Plus } from 'lucide-react';
import { useCart } from '../../../../../lib/context/CartContext';
import { useHardwareBack } from '../../../../../lib/hooks/useHardwareBack';
import { getMenuItemById, MENU_CATEGORIES } from '../../../../../lib/data/menuData';
import { realtimeBridge } from '../../../../../lib/supabase';
import { getDeviceToken, isDeviceLockedToDifferentSeat } from '../../../../../lib/session/diningSession';

export default function ItemCustomizationPage() {
  const router = useRouter();
  const params = useParams();
  const chairId = (params?.chairId as string) || '12';
  const itemId = (params?.itemId as string) || '1';

  // Anti-Cheat & Seat Occupancy Guard
  useEffect(() => {
    const lock = isDeviceLockedToDifferentSeat(chairId);
    if (lock.isLocked && lock.activeSeatId) {
      router.replace(`/seat/${lock.activeSeatId}/tracking`);
      return;
    }

    async function checkOccupancy() {
      const token = getDeviceToken();
      const occ = await realtimeBridge.getSeatOccupancy(chairId, token);
      if (occ.isOccupied && !occ.isOwner) {
        router.replace(`/seat/${chairId}`);
      }
    }
    checkOccupancy();
  }, [chairId, router]);

  // Device hardware back button & swipe back: return to menu
  useHardwareBack(`/seat/${chairId}/menu`);

  const { addItemWithDetails, toggleLike, isItemLiked } = useCart();

  // Retrieve authentic item data
  const dish = useMemo(() => getMenuItemById(itemId), [itemId]);
  const categoryName = useMemo(() => {
    return (
      MENU_CATEGORIES.find((cat) => cat.id === dish.categoryId)?.title ||
      'Donne Biryani'
    );
  }, [dish]);

  const [quantity, setQuantity] = useState(1);
  const [selectedOption, setSelectedOption] = useState<string>(
    dish.options && dish.options.length > 0 ? dish.options[0] : 'Standard'
  );
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);

  // Add-on options with authentic pricing
  const availableAddOns = useMemo(() => {
    return (
      dish.addOns || [
        { name: 'Extra Salna Cup', price: 30 },
        { name: 'Boiled Egg (1 pc)', price: 25 },
        { name: 'Double Raita Bowl', price: 20 },
      ]
    );
  }, [dish]);

  // Compute add-ons surcharge
  const addOnsCost = useMemo(() => {
    return selectedAddOns.reduce((sum, addonName) => {
      const match = availableAddOns.find((a) => a.name === addonName);
      return sum + (match?.price || 0);
    }, 0);
  }, [selectedAddOns, availableAddOns]);

  const itemUnitPrice = dish.price + addOnsCost;
  const calculatedGrandTotal = itemUnitPrice * quantity;

  // Multiple presentation visuals for the interactive carousel
  const dishVisuals = useMemo(() => [
    {
      id: 1,
      url: dish.imageUrl,
      alt: `${dish.title} - Main View`,
    },
    {
      id: 2,
      url: '/images/dishes/chicken-kabab.jpg',
      alt: `Authentic Kebab Starter Pairing`,
    },
    {
      id: 3,
      url: '/images/dishes/donne-khushka.jpg',
      alt: `Seeraga Samba Herbal Rice`,
    },
  ], [dish]);

  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const handlePrevImage = () => {
    setActiveImageIndex((prev) => (prev - 1 + dishVisuals.length) % dishVisuals.length);
  };

  const handleNextImage = () => {
    setActiveImageIndex((prev) => (prev + 1) % dishVisuals.length);
  };

  const toggleAddOn = (addonName: string) => {
    setSelectedAddOns((prev) =>
      prev.includes(addonName)
        ? prev.filter((a) => a !== addonName)
        : [...prev, addonName]
    );
  };

  const handleAddToCart = () => {
    addItemWithDetails(itemId, quantity, selectedOption, selectedAddOns);
    router.push(`/seat/${chairId}/menu`);
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-between max-w-md mx-auto relative px-4 pt-4 pb-24 select-none text-[#1A2621]">
      {/* Scrollable Content Container */}
      <div className="w-full flex flex-col gap-6">
        {/* Top Header */}
        <header className="w-full flex items-center justify-between py-2">
          {/* Back Button to Menu */}
          <Link
            href={`/seat/${chairId}/menu`}
            className="w-10 h-10 border border-[rgba(220,226,222,0.8)] rounded-xl flex items-center justify-center cursor-pointer active:opacity-70 bg-[#FFFEFC] text-[#1A2621] shadow-2xs"
            aria-label="Back to Menu"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>

          {/* Title Space */}
          <div className="text-center font-black text-sm uppercase tracking-wider text-[#1A2621]">
            Dish Details
          </div>

          {/* Favorite Action Button connected to global likes */}
          <button
            type="button"
            onClick={() => toggleLike(itemId)}
            className={`w-10 h-10 border rounded-xl flex items-center justify-center cursor-pointer active:scale-95 transition-all ${
              isItemLiked(itemId)
                ? 'border-[#DD6B28] bg-[#DD6B28] text-white shadow-xs'
                : 'border-[rgba(220,226,222,0.8)] bg-[#FFFEFC] text-[#5A6860] hover:text-[#DD6B28]'
            }`}
            aria-label="Favorite"
          >
            <Heart className={`w-5 h-5 ${isItemLiked(itemId) ? 'fill-current' : ''}`} />
          </button>
        </header>

        {/* Hero Interactive Sliding Carousel Section */}
        <div className="w-full flex flex-col items-center gap-3 relative">
          <div className="w-full flex items-center justify-between gap-1 relative px-2">
            {/* Previous Image Button */}
            <button
              type="button"
              onClick={handlePrevImage}
              className="w-9 h-9 rounded-full border border-[rgba(220,226,222,0.8)] flex items-center justify-center bg-[#FFFEFC] text-[#1A2621] cursor-pointer active:scale-90 transition-transform z-10 shadow-xs"
              aria-label="Previous"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Sliding Dish Circle Display */}
            <div className="relative overflow-hidden w-48 h-48 sm:w-56 sm:h-56 rounded-full border border-[rgba(220,226,222,0.9)] flex items-center justify-center bg-[#fbf9f5] shadow-[0_8px_30px_rgb(0,0,0,0.08)] p-1">
              <img
                src={dishVisuals[activeImageIndex].url}
                alt={dishVisuals[activeImageIndex].alt}
                className="w-full h-full object-cover object-center rounded-full transition-opacity duration-300"
              />
            </div>

            {/* Next Image Button */}
            <button
              type="button"
              onClick={handleNextImage}
              className="w-9 h-9 rounded-full border border-[rgba(220,226,222,0.8)] flex items-center justify-center bg-[#FFFEFC] text-[#1A2621] cursor-pointer active:scale-90 transition-transform z-10 shadow-xs"
              aria-label="Next"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Carousel Indicator Dots */}
          <div className="flex items-center gap-2 mt-1">
            {dishVisuals.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveImageIndex(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`transition-all rounded-full cursor-pointer ${
                  activeImageIndex === idx
                    ? 'w-4 h-2 bg-[#244436]'
                    : 'w-2 h-2 border border-[rgba(220,226,222,0.8)] bg-[#FFFEFC] hover:bg-[#F9F8F5]'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Title & Price Section */}
        <div className="w-full flex items-center justify-between border-b border-[rgba(220,226,222,0.8)] pb-4">
          <div className="flex flex-col gap-1 max-w-[70%]">
            <div className="text-lg font-black leading-tight text-[#1A2621]">
              {dish.title}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span
                className={`inline-block w-2.5 h-2.5 rounded-full border ${
                  dish.isVegetarian
                    ? 'bg-emerald-600 border-emerald-700'
                    : 'bg-red-600 border-red-700'
                }`}
              />
              <span className="text-xs font-bold text-[#5A6860] uppercase tracking-wide">
                {categoryName}
              </span>
              {dish.isSignature && (
                <span className="text-[10px] font-black uppercase text-[#DD6B28] bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                  Chef Choice
                </span>
              )}
            </div>
          </div>
          <div className="text-2xl font-black text-right text-[#244436]">
            ₹ {dish.price}
          </div>
        </div>

        {/* Authentic Description Section */}
        <div className="w-full flex flex-col gap-1.5 bg-[#FFFEFC] border border-[rgba(220,226,222,0.7)] p-4 rounded-2xl shadow-[0_4px_16px_-4px_rgba(36,68,54,0.05)]">
          <span className="text-xs font-black uppercase tracking-wider text-[#244436]">
            Heritage Recipe
          </span>
          <p className="text-xs text-[#5A6860] leading-relaxed">
            {dish.description}
          </p>
        </div>

        {/* Customization Options Section */}
        {dish.options && dish.options.length > 0 && (
          <div className="w-full flex flex-col gap-3 border-t border-[rgba(220,226,222,0.8)] pt-4">
            <span className="text-xs font-black uppercase tracking-wider text-[#1A2621]">
              Spice & Preparation
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {dish.options.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setSelectedOption(opt)}
                  className={`py-2 px-3 border text-xs font-bold rounded-xl cursor-pointer transition-all ${
                    selectedOption === opt
                      ? 'border-[#244436] bg-[#244436] text-[#FFFEFC] shadow-2xs'
                      : 'border-[rgba(220,226,222,0.8)] bg-[#FFFEFC] text-[#5A6860] hover:text-[#1A2621] hover:border-[#244436]/40'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Add-ons Options Section */}
        <div className="w-full flex flex-col gap-2.5 border-t border-[rgba(220,226,222,0.8)] pt-4">
          <span className="text-xs font-black uppercase tracking-wider text-[#1A2621]">
            Authentic Accompaniments
          </span>
          <div className="flex flex-col gap-2">
            {availableAddOns.map((addon) => {
              const isChecked = selectedAddOns.includes(addon.name);
              return (
                <label
                  key={addon.name}
                  className={`flex items-center justify-between border p-3 rounded-xl cursor-pointer transition-all ${
                    isChecked
                      ? 'border-[#244436] bg-emerald-50/60 shadow-2xs'
                      : 'border-[rgba(220,226,222,0.8)] bg-[#FFFEFC] hover:bg-[#F9F8F5]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleAddOn(addon.name)}
                      className="w-4 h-4 accent-[#244436] cursor-pointer"
                    />
                    <span className="text-xs font-semibold text-[#1A2621]">{addon.name}</span>
                  </div>
                  <span className="text-xs font-black text-[#244436]">+ ₹ {addon.price}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Quantity Stepper Section */}
        <div className="w-full flex items-center justify-between border-t border-[rgba(220,226,222,0.8)] pt-4">
          <span className="text-xs font-black uppercase tracking-wider text-[#1A2621]">
            Quantity
          </span>
          <div className="flex items-center border border-[#244436] rounded-xl overflow-hidden bg-[#244436] text-white shadow-2xs">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="w-10 h-10 flex items-center justify-center cursor-pointer active:opacity-75"
              aria-label="Decrease quantity"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-10 text-center font-black text-sm">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity((q) => q + 1)}
              className="w-10 h-10 flex items-center justify-center cursor-pointer active:opacity-75"
              aria-label="Increase quantity"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Sticky Action Bar */}
      <div className="sticky bottom-0 z-30 w-full max-w-md bg-[#FFFEFC]/95 backdrop-blur-md border-t border-[rgba(220,226,222,0.8)] pt-3 pb-2 mt-8 flex items-center justify-between gap-4">
        <div className="flex flex-col">
          <span className="text-[10px] text-[#5A6860] uppercase font-bold">Total</span>
          <span className="text-xl font-black text-[#244436]">₹ {calculatedGrandTotal}</span>
        </div>
        <button
          type="button"
          onClick={handleAddToCart}
          className="flex-1 bg-gradient-to-r from-[#244436] via-[#2d5242] to-[#DD6B28] text-white py-3.5 px-4 text-sm font-black uppercase tracking-wider cursor-pointer active:opacity-90 transition-all rounded-xl shadow-md hover:shadow-lg"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}
