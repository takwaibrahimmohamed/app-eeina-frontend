import { useState } from 'react';
import { useGetAllIngredientQuery } from '@/redux/Features/Ingrediant/IngrediantApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, X, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { UNIT_OPTIONS } from '@/constants/shoppingListSmartFeatures';

interface IngredientSearchProps {
    onAdd: (item: any) => void;
    isLoading?: boolean;
}

export default function IngredientSearch({ onAdd, isLoading }: IngredientSearchProps) {
    const { t, language } = useLanguage();
    const [query, setQuery] = useState('');
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [quantity, setQuantity] = useState(1);
    const [unit, setUnit] = useState('kg');
    const [isSearching, setIsSearching] = useState(false);

    const { data: searchResults, isFetching } = useGetAllIngredientQuery(
        { q: query, limit: 5 },
        { skip: query.length < 2 }
    );

    const handleSelect = (item: any) => {
        setSelectedItem(item);
        setQuery('');
        setIsSearching(false);
    };

    const clearSelection = () => {
        setSelectedItem(null);
        setQuantity(1);
        setUnit('kg');
    };

    const handleAdd = () => {
        if (!selectedItem) return;

        const payload = {
            item: selectedItem._id,
            itemType: 'Ingredient',
            quantity: Number(quantity),
            unit: { en: unit, ar: unit }, // Assuming simple unit structure for now
        };

        onAdd(payload);
        clearSelection();
    };

    return (
        <div className="w-full space-y-3">
            {!selectedItem ? (
                <div className="relative">
                    <Input
                        placeholder={t.shopping_list?.search_ingredients || "Search ingredients..."} // Fallback if translation missing
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setIsSearching(true);
                        }}
                        className="pl-10"
                    />
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />

                    {isSearching && query.length >= 2 && (
                        <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg border border-gray-100 max-h-60 overflow-auto">
                            {isFetching ? (
                                <div className="p-4 text-center text-sm text-gray-500">
                                    <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                                </div>
                            ) : searchResults?.data?.length > 0 ? (
                                <ul>
                                    {searchResults.data.map((item: any) => (
                                        <li
                                            key={item._id}
                                            onClick={() => handleSelect(item)}
                                            className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer"
                                        >
                                            <img
                                                src={item.image?.url || '/ingredient.png'}
                                                alt={item.name[language]}
                                                className="w-8 h-8 rounded object-cover"
                                            />
                                            <span className="text-sm font-medium text-gray-700">
                                                {item.name[language]}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="p-3 text-sm text-gray-500 text-center">
                                    No ingredients found
                                </div>
                            )}
                        </div>
                    )}
                </div>
            ) : (
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <img
                                src={selectedItem.image?.url || '/ingredient.png'}
                                alt={selectedItem.name[language]}
                                className="w-8 h-8 rounded object-cover"
                            />
                            <span className="font-medium text-gray-900">
                                {selectedItem.name[language]}
                            </span>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearSelection}
                            className="h-8 w-8 p-0 text-gray-400 hover:text-red-500"
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    </div>

                    <div className="flex gap-2">
                        <div className="w-24">
                            <Input
                                type="number"
                                min="0.1"
                                step="0.1"
                                value={quantity}
                                onChange={(e) => setQuantity(Number(e.target.value))}
                                className="bg-white"
                            />
                        </div>
                        <div className="w-24">
                            <Select value={unit} onValueChange={setUnit}>
                                <SelectTrigger className="bg-white">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {UNIT_OPTIONS.map((opt) => (
                                        <SelectItem key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <Button
                            onClick={handleAdd}
                            disabled={isLoading}
                            className="flex-1 bg-primaryColor hover:bg-green-700 text-white"
                        >
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                            Add
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
