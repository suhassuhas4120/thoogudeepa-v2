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

          {/* Title Space */}
          <div className="text-center font-black text-sm uppercase tracking-wider">
            Dish Details
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
            <div className="relative overflow-hidden w-48 h-48 sm:w-56 sm:h-56 rounded-full border-2 border-black flex items-center justify-center bg-[#fbf9f5] shadow-md p-1">
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
              className="w-9 h-9 rounded-full border border-black flex items-center justify-center bg-white cursor-pointer active:scale-90 transition-transform z-10"
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
                    ? 'w-4 h-2 bg-black'
                    : 'w-2 h-2 border border-black bg-white hover:bg-zinc-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Title & Price Section */}
        <div className="w-full flex items-center justify-between border-b border-black pb-4">
          <div className="flex flex-col gap-1 max-w-[70%]">
            <div className="text-lg font-black leading-tight">
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
              <span className="text-xs font-bold text-zinc-600 uppercase tracking-wide">
                {categoryName}
              </span>
              {dish.isSignature && (
                <span className="text-[10px] font-black uppercase text-amber-700 bg-amber-50 px-2 py-0.5 rounded-sm border border-amber-300">
                  Chef Choice
                </span>
              )}
            </div>
          </div>
          <div className="text-2xl font-black text-right">
            ₹ {dish.price}
          </div>
        </div>

        {/* Authentic Description Section */}
        <div className="w-full flex flex-col gap-1.5">
          <span className="text-xs font-black uppercase tracking-wider text-zinc-800">
            Heritage Recipe
          </span>
          <p className="text-xs text-zinc-700 leading-relaxed">
            {dish.description}
          </p>
        </div>

        {/* Customization Options Section */}
        {dish.options && dish.options.length > 0 && (
          <div className="w-full flex flex-col gap-3 border-t border-black pt-4">
            <span className="text-xs font-black uppercase tracking-wider">
              Spice & Preparation
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {dish.options.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setSelectedOption(opt)}
                  className={`py-2 px-3 border text-xs font-bold rounded-lg cursor-pointer transition-all ${
                    selectedOption === opt
                      ? 'border-black bg-black text-white'
                      : 'border-black bg-white text-black hover:bg-zinc-100'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Add-ons Options Section */}
        <div className="w-full flex flex-col gap-2.5 border-t border-black pt-4">
          <span className="text-xs font-black uppercase tracking-wider">
            Authentic Accompaniments
          </span>
          <div className="flex flex-col gap-2">
            {availableAddOns.map((addon) => {
              const isChecked = selectedAddOns.includes(addon.name);
              return (
                <label
                  key={addon.name}
                  className={`flex items-center justify-between border p-2.5 rounded-lg cursor-pointer transition-all ${
                    isChecked
                      ? 'border-black bg-zinc-50'
                      : 'border-black bg-white hover:bg-zinc-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleAddOn(addon.name)}
                      className="w-4 h-4 accent-black cursor-pointer"
                    />
                    <span className="text-xs font-semibold">{addon.name}</span>
                  </div>
                  <span className="text-xs font-black">+ ₹ {addon.price}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Quantity Stepper Section */}
        <div className="w-full flex items-center justify-between border-t border-black pt-4">
          <span className="text-xs font-black uppercase tracking-wider">
            Quantity
          </span>
          <div className="flex items-center border-2 border-black rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="w-10 h-10 flex items-center justify-center border-r border-black cursor-pointer active:bg-zinc-200"
              aria-label="Decrease quantity"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-12 text-center font-black text-sm">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity((q) => q + 1)}
              className="w-10 h-10 flex items-center justify-center border-l border-black cursor-pointer active:bg-zinc-200"
              aria-label="Increase quantity"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Sticky Action Bar */}
      <div className="sticky bottom-0 z-30 w-full max-w-md bg-white border-t-2 border-black pt-3 pb-2 mt-8 flex items-center justify-between gap-4">
        <div className="flex flex-col">
          <span className="text-[10px] text-zinc-500 uppercase font-bold">Total</span>
          <span className="text-xl font-black">₹ {calculatedGrandTotal}</span>
        </div>
        <button
          type="button"
          onClick={handleAddToCart}
          className="flex-1 border-2 border-black bg-black text-white py-3 px-4 text-sm font-black uppercase tracking-wider cursor-pointer active:opacity-80 transition-opacity rounded-xl"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}
