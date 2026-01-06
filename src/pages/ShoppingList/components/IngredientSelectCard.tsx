import { imageObject, localizedString } from '@/types/common';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Check } from 'lucide-react';

interface IngredientSelectCardProps {
    ingredient: {
        _id: string;
        name: { [key: string]: string };
        slug: localizedString;
        category: localizedString;
        image: imageObject;
    };
    isSelected: boolean;
    onSelect: () => void;
}

export const IngredientSelectCard = ({ ingredient, isSelected, onSelect }: IngredientSelectCardProps) => {
    const { language } = useLanguage();

    return (
        <Card
            className={`cursor-pointer transition-all duration-300 relative overflow-hidden group
        ${isSelected ? 'ring-2 ring-primaryColor border-primaryColor bg-green-50' : 'hover:shadow-md border-gray-100 bg-white'}
      `}
            onClick={onSelect}
        >
            {isSelected && (
                <div className="absolute top-2 right-2 z-10 bg-primaryColor text-white rounded-full p-1 shadow-sm">
                    <Check className="w-3 h-3" />
                </div>
            )}

            <CardContent className="p-3">
                {/* Image Section */}
                <div className="relative flex justify-center items-center h-24 mb-3">
                    <img
                        src={ingredient?.image?.url || '/ingredient.png'}
                        alt={ingredient?.name?.[language] || ingredient?.name?.en}
                        className="w-full h-full object-contain"
                    />
                </div>

                {/* Content Section */}
                <div className="text-center">
                    <h3 className={`font-semibold text-sm line-clamp-2 ${isSelected ? 'text-primaryColor' : 'text-gray-800'}`}>
                        {ingredient.name?.[language] || ingredient.name?.en}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1 capitalize">
                        {ingredient.category?.[language] || ingredient.category?.en || 'Ingredient'}
                    </p>
                </div>
            </CardContent>
        </Card>
    );
};
