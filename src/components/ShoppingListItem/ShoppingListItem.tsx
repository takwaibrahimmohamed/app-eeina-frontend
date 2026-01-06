import { Check, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';

/**
 * Props interface for the ShoppingItem component
 */
interface ShoppingItemProps {
  /** The shopping list item object */
  item: any;
  /** Current language for localization */
  language: string;
  /** Function to toggle the purchase status of an item */
  toggleItem: (id: string) => void;
  /** Function to remove an item from the shopping list */
  removeItem: (id: string) => void;
  /** Whether this is a custom user-added item */
  isCustom?: boolean;
  /** Whether this component is being rendered for PDF export */
  isPdf?: boolean;
}

/**
 * ShoppingItem component displays individual shopping list items
 * Supports toggling purchase status, removing items, and linking to ingredient details
 * Handles both recipe-generated items and custom user items
 */
export const ShoppingItem = ({
  item,
  language,
  toggleItem,
  removeItem,
  isCustom = false,
  isPdf = false,
}: ShoppingItemProps) => {
  // Check if the item has been purchased
  const purchased = item?.status === 'purchased';
  console.log('it', item);
  return (
    <div
      key={item?._id}
      className={`group flex items-center gap-3 p-2 rounded-lg border transition-all duration-200 mb-2 ${purchased
        ? 'bg-gray-50/50 border-gray-100 opacity-75'
        : 'bg-white border-gray-200 shadow-sm hover:shadow-md hover:border-primaryColor/30'
        }`}
    >
      {/* Purchase status toggle checkbox */}
      <div
        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all flex-shrink-0 ml-1 ${purchased
          ? 'bg-primaryColor border-primaryColor scale-100'
          : 'border-gray-300 hover:border-primaryColor hover:scale-105 active:scale-95'
          }`}
        onClick={() => toggleItem(item._id)}
      >
        <Check className={`w-3 h-3 text-white transition-opacity ${purchased ? 'opacity-100' : 'opacity-0'}`} />
      </div>

      {/* Image (Left side now) */}
      {!isCustom && (
        <img
          src={item?.item?.image?.url || '/ingrediant.png'}
          alt={item?.item?.name?.[language]}
          className={`w-10 h-10 rounded-md object-cover border border-gray-100 flex-shrink-0 ${purchased ? 'grayscale opacity-50' : ''}`}
        />
      )}

      {/* Item details section */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-col justify-center">
          <span
            className={`text-sm font-medium break-words leading-tight ${purchased && !isPdf ? 'line-through text-gray-400' : 'text-gray-900'
              }`}
          >
            {
              isCustom
                ? item?.name[language]
                : (item?.item?.name[language] || item?.item?.name?.en || item?.name?.en).replace(/-/g, ' ')
            }
          </span>

          {/* Quantity Badge - Subtle and below text if needed, or inline? Let's keep inline for compactness or below for clarity? 
                 Let's stay inline or just below if long. Actually, let's put it next to text if space, or allow wrap.
             */}
          {(item?.quantity || item?.unit) && (
            <span className={`text-xs mt-0.5 text-gray-500`}>
              {item.quantity} {item.unit?.en || item.unit?.[language] || ''}
            </span>
          )}
        </div>
      </div>

      {/* Action buttons (Trash) - Only show on hover for desktop to clean up UI, always on mobile */}
      <div className="flex items-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => removeItem(item._id)}
          className="text-gray-400 hover:text-red-600 w-8 h-8 rounded-full hover:bg-red-50"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
