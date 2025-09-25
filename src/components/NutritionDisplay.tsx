import { useState } from 'react';
import { Nutrition, hasUnknownItems, getUnknownItemsText } from '../utils/nutrition';

interface NutritionDisplayProps {
  total: Nutrition;
  unknown: string[];
  className?: string;
  showInfoIcon?: boolean; // controls rendering of the info icon
}

export function NutritionDisplay({ total, unknown, className = "", showInfoIcon = true }: NutritionDisplayProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const hasUnknown = hasUnknownItems(unknown);

  const formatNutrition = (n: Nutrition): string => {
    return `${Math.round(n.calories)} kcal • Protein ${Math.round(n.protein)}g • Carbs ${Math.round(n.carbs)}g • Fat ${Math.round(n.fat)}g per 100g`;
  };

  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center gap-1">
        <span className="text-xs text-slate-500">{formatNutrition(total)}</span>
        {showInfoIcon && hasUnknown && (
          <div className="relative">
            <button
              className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors duration-200 text-xs font-medium z-10"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              onClick={() => setShowTooltip(!showTooltip)}
              title="Nutrition information"
            >
              ⓘ
            </button>
            
            {showTooltip && (
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 bg-slate-800 text-white text-xs rounded-lg p-3 shadow-lg z-50">
                <div className="text-center">
                  <div className="font-medium mb-1">Nutrition Data Notice</div>
                  <div className="text-slate-300 text-xs leading-relaxed">
                    {getUnknownItemsText(unknown)}
                    <br /><br />
                    <span className="text-blue-300">
                      💡 <strong>Tip:</strong> We're constantly expanding our nutrition database. 
                      The values shown are for items with available data.
                    </span>
                  </div>
                </div>
                {/* Tooltip arrow */}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-800"></div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
