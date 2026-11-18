import React from 'react';
import type { FoodId } from '../game/types';

interface FoodBadgeSvgProps {
  foodId: FoodId;
  className?: string;
}

export const FoodBadgeSvg: React.FC<FoodBadgeSvgProps> = ({ foodId, className = 'w-9 h-9' }) => {
  switch (foodId) {
    case 'apple':
      return (
        <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
          <path d="M24 14 C35 8, 41 24, 24 41 C7 24, 13 8, 24 14 Z" fill="#EF4444" stroke="#991B1B" strokeWidth="2.5" />
          <ellipse cx="18" cy="21" rx="3" ry="5.5" transform="rotate(-20 18 21)" fill="#FCA5A5" />
          <path d="M24 14 Q26 7 29 5" stroke="#78350F" strokeWidth="3" strokeLinecap="round" fill="none" />
          <ellipse cx="30" cy="10" rx="5.5" ry="2.8" transform="rotate(-25 30 10)" fill="#22C55E" stroke="#15803D" strokeWidth="1.5" />
        </svg>
      );
    case 'banana':
      return (
        <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
          <g transform="rotate(-12 24 24)">
            <path d="M8 19 Q24 44 40 16 Q27 29 8 19 Z" fill="#FACC15" stroke="#A16207" strokeWidth="2.5" strokeLinejoin="round" />
            <path d="M15 24 Q24 31 34 22" stroke="#FEF08A" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            <circle cx="8" cy="19" r="2" fill="#78350F" />
            <circle cx="40" cy="16" r="2" fill="#78350F" />
          </g>
        </svg>
      );
    case 'star':
      return (
        <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
          <polygon
            points="24,5 29.5,17 42.5,18.6 32.8,27.6 35.4,40.5 24,34 12.6,40.5 15.2,27.6 5.5,18.6 18.5,17"
            fill="#FACC15"
            stroke="#D97706"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <circle cx="20.5" cy="23" r="1.7" fill="#78350F" />
          <circle cx="27.5" cy="23" r="1.7" fill="#78350F" />
        </svg>
      );
    case 'orange':
      return (
        <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
          <circle cx="24" cy="26" r="15.5" fill="#F97316" stroke="#C2410C" strokeWidth="2.5" />
          <ellipse cx="18" cy="20" rx="3" ry="5" transform="rotate(-25 18 20)" fill="#FDBA74" />
          <ellipse cx="28" cy="10" rx="5.5" ry="2.8" transform="rotate(-20 28 10)" fill="#22C55E" stroke="#15803D" strokeWidth="1.5" />
        </svg>
      );
    case 'pear':
      return (
        <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
          <path
            d="M24 10 C32 10 33 21 37 27 C40 36 32 42 24 42 C16 42 8 36 11 27 C15 21 16 10 24 10 Z"
            fill="#84CC16"
            stroke="#4D7C0F"
            strokeWidth="2.5"
          />
          <ellipse cx="19" cy="29" rx="2.6" ry="4.5" transform="rotate(-12 19 29)" fill="#D9F99D" />
          <path d="M24 10 L26 5" stroke="#78350F" strokeWidth="3" strokeLinecap="round" />
        </svg>
      );
    case 'cookie':
      return (
        <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
          <circle cx="24" cy="24" r="16" fill="#F59E0B" stroke="#B45309" strokeWidth="2.5" />
          <circle cx="22" cy="22" r="11" fill="#FBBF24" />
          <circle cx="18" cy="18" r="2.2" fill="#78350F" />
          <circle cx="29" cy="19" r="2" fill="#78350F" />
          <circle cx="22" cy="26" r="2.4" fill="#78350F" />
          <circle cx="30" cy="28" r="2" fill="#78350F" />
          <circle cx="17" cy="30" r="1.8" fill="#78350F" />
        </svg>
      );
  }
};
