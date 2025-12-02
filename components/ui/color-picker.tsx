'use client';

import { cn } from '@/lib/design-system';
import { PLAYER_COLOR_LIST, type PlayerColorId, getPlayerColor } from '@/lib/design-system/tokens/colors';

export interface ColorPickerProps {
  value: PlayerColorId;
  onChange: (color: PlayerColorId) => void;
  disabledColors?: PlayerColorId[];
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeStyles = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
};

export function ColorPicker({
  value,
  onChange,
  disabledColors = [],
  label,
  size = 'md',
}: ColorPickerProps) {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="text-sm font-medium text-gray-300">
          {label}
        </label>
      )}

      <div className="flex flex-wrap gap-2">
        {PLAYER_COLOR_LIST.map((color) => {
          const isSelected = value === color.id;
          const isDisabled = disabledColors.includes(color.id);

          return (
            <button
              key={color.id}
              type="button"
              onClick={() => !isDisabled && onChange(color.id)}
              disabled={isDisabled}
              className={cn(
                // Base
                'rounded-full transition-all duration-200 flex items-center justify-center font-medium',
                color.bg,
                color.text,
                sizeStyles[size],
                // States
                isSelected && 'ring-2 ring-offset-2 ring-offset-gray-900 ring-white scale-110',
                !isSelected && !isDisabled && 'opacity-60 hover:opacity-100 hover:scale-105',
                isDisabled && 'opacity-30 cursor-not-allowed grayscale',
              )}
              title={color.name}
            >
              {isSelected && (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
