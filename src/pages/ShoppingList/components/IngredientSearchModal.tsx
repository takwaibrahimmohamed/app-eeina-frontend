import { useState, useEffect } from 'react';
import { useGetAllIngredientQuery } from '@/redux/Features/Ingrediant/IngrediantApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Loader2, Plus } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/Dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { UNIT_OPTIONS } from '@/constants/shoppingListSmartFeatures';
import { IngredientSelectCard } from './IngredientSelectCard';
import { RecipiSkeleton } from '@/components/ui/skeletons/RecipiSkeleton';

interface IngredientSearchModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (item: any) => void;
    isLoading?: boolean;
}

export default function IngredientSearchModal({ isOpen, onClose, onAdd, isLoading }: IngredientSearchModalProps) {
    const { t, language } = useLanguage();
    const [query, setQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [quantity, setQuantity] = useState(1);
    const [unit, setUnit] = useState('kg');

    // Pagination state
    const [page, setPage] = useState(1);
    const [allIngredients, setAllIngredients] = useState<any[]>([]);

    // Debounce search
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedQuery(query);
        }, 400);
        return () => clearTimeout(handler);
    }, [query]);

    // Query
    const { data, isFetching } = useGetAllIngredientQuery({
        q: debouncedQuery,
        page,
        limit: 12,
    }, { skip: !isOpen });

    const newIngredients = data?.data?.docs || [];
    const totalIngredients = data?.data?.pagination?.totalCount || 0;
    const hasMore = allIngredients.length < totalIngredients;

    // Reset ingredients when query changes
    useEffect(() => {
        setPage(1);
        setAllIngredients([]);
        setSelectedItem(null);
    }, [debouncedQuery]);

    // Append new ingredients
    useEffect(() => {
        if (newIngredients.length) {
            if (page === 1) {
                setAllIngredients(newIngredients);
            } else {
                setAllIngredients((prev) => {
                    // filter duplicates just in case
                    const ids = new Set(prev.map(i => i._id));
                    const newUnique = newIngredients.filter((i: any) => !ids.has(i._id));
                    return [...prev, ...newUnique];
                });
            }
        }
    }, [newIngredients, page]);

    const handleLoadMore = () => {
        setPage((prev) => prev + 1);
    };

    const handleAdd = () => {
        if (!selectedItem) return;

        const payload = {
            item: selectedItem._id,
            itemType: 'Ingredient',
            quantity: Number(quantity),
            unit: { en: unit, ar: unit },
        };

        onAdd(payload);
        // Optional: Close on add or keep open? 
        // If keep open, show success feedback (handled by parent toast) and clear selection
        setSelectedItem(null);
        setQuantity(1);
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-4xl h-[85vh] flex flex-col p-0 gap-0 overflow-hidden">
                <DialogHeader className="px-6 py-4 border-b flex-shrink-0">
                    <DialogTitle>{t.shopping_list?.add_item || 'Add Item'}</DialogTitle>
                </DialogHeader>

                <div className="flex flex-col flex-1 min-h-0">
                    {/* Search Bar */}
                    <div className="p-4 border-b bg-gray-50/50">
                        <div className="relative">
                            <Input
                                placeholder={t.shopping_list?.search_ingredients || "Search for ingredients..."}
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                className="pl-10 bg-white"
                                autoFocus
                            />
                            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        </div>
                    </div>

                    {/* Results Grid */}
                    <div className="flex-1 overflow-y-auto p-4 min-h-0">
                        {isFetching && page === 1 ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {[...Array(8)].map((_, i) => (
                                    <RecipiSkeleton key={i} variant="grid" />
                                ))}
                            </div>
                        ) : allIngredients.length > 0 ? (
                            <>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-20"> {/* pb-20 for bottom bar space */}
                                    {allIngredients.map((ingredient) => (
                                        <IngredientSelectCard
                                            key={ingredient._id}
                                            ingredient={ingredient}
                                            isSelected={selectedItem?._id === ingredient._id}
                                            onSelect={() => setSelectedItem(ingredient)}
                                        />
                                    ))}
                                </div>
                                {hasMore && (
                                    <div className="flex justify-center mt-6 pb-20">
                                        <Button
                                            onClick={handleLoadMore}
                                            variant="outline"
                                            disabled={isFetching}
                                            className="min-w-[120px]"
                                        >
                                            {isFetching ? <Loader2 className="w-4 h-4 animate-spin" /> : (language === 'ar' ? 'تحميل المزيد' : 'Load More')}
                                        </Button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-12 flex flex-col items-center justify-center h-full">
                                <Search className="w-12 h-12 text-gray-200 mb-3" />
                                <p className="text-gray-500">{t.common?.no_results || "No ingredients found"}</p>
                            </div>
                        )}
                    </div>

                    {/* Bottom Action Bar */}
                    <div className={`absolute bottom-0 left-0 right-0 bg-white border-t p-4 shadow-lg transform transition-transform duration-300 ${selectedItem ? 'translate-y-0' : 'translate-y-full'}`}>
                        <div className="flex flex-col sm:flex-row items-center gap-4 max-w-4xl mx-auto">
                            {selectedItem && (
                                <div className="flex items-center gap-3 flex-1 min-w-0 w-full sm:w-auto">
                                    <img
                                        src={selectedItem.image?.url || '/ingredient.png'}
                                        alt=""
                                        className="w-10 h-10 rounded-md object-cover bg-gray-50 border"
                                    />
                                    <div className="min-w-0">
                                        <p className="font-semibold text-sm truncate">{selectedItem.name[language]}</p>
                                        <p className="text-xs text-gray-500 truncate">{selectedItem.category?.[language] || selectedItem.category?.en}</p>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                <div className="w-20">
                                    <Input
                                        type="number"
                                        min="0.1"
                                        step="0.1"
                                        value={quantity}
                                        onChange={(e) => setQuantity(Number(e.target.value))}
                                        className="h-10"
                                    />
                                </div>
                                <div className="w-24">
                                    <Select value={unit} onValueChange={setUnit}>
                                        <SelectTrigger className="h-10">
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
                                    className="bg-primaryColor hover:bg-green-700 text-white min-w-[100px] h-10"
                                >
                                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Plus className="w-4 h-4 mr-2" /> {t.shopping_list?.add || 'Add'}</>}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
