import { useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ShoppingCart,
  Download,
  Trash2,
  Share2,
  Plus,
  ShoppingCartIcon,
  Search,
  CalendarDays,
  ArrowRightLeft,
} from 'lucide-react';
import {
  useAddCustomItemMutation,
  useAddItemMutation,
  useClearPurchasedItemsMutation,
  useDeleteUserItemMutation,
  useGetSingleListQuery,
  useUpdateItemStatusMutation,
} from '@/redux/Features/Shopping List/ShoppingListApi';
import Loader from '@/components/ui/Loader';
import { toast } from 'sonner';
import { ShoppingItem } from '@/components/ShoppingListItem/ShoppingListItem';
import { exportPDF } from '@/lib/pdfExport';
import { ShareListModal } from './components/ShareListModal';
import { Input } from '@/components/ui/input';
import { useAppSelector } from '@/hooks/hook';
import { FormattedListItem, RawListItem } from '@/types/listDetails.types';
import LocationModal from './components/LocationModal';
import ChooseStoreModal from './components/ChooseStoreModal';
import { useEditProfileMutation } from '@/redux/Features/User/userApi';
import { LocationType } from '@/schemas/auth/Loaction.validtion';
import GroupingSelect from '@/components/ShoppingListItem/GroupingSelect';
import { getLocalizedPath } from '@/lib/getLocalizedPath';
import { CATEGORY_KEYWORDS, SUGGESTED_ITEMS } from '@/constants/shoppingListSmartFeatures';
import IngredientSearchModal from './components/IngredientSearchModal';
import { useAddItemtoSpecificListMutation } from '@/redux/Features/Shopping List/ShoppingListApi';

import { CircularProgress } from '@/components/ui/CircularProgress';
import ImportFromMealPlanModal from './components/ImportFromMealPlanModal';

export const ListDetails = (): JSX.Element => {
  const { id: listId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t, isRTL, language } = useLanguage();
  const token = searchParams.get('token');
  const user = useAppSelector((state) => state.auth.user);
  console.log('user', user);
  const [newItemText, setNewItemText] = useState('');
  const pdfRef = useRef<HTMLDivElement>(null);
  const [isPdf, setIsPdf] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isLoccationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isChoseStoreModalOpen, setIsChooseStoreModalOpen] = useState(false);
  const [isIngredientModalOpen, setIsIngredientModalOpen] = useState(false);
  const [isImportMealPlanModalOpen, setIsImportMealPlanModalOpen] = useState(false);
  const [editProfile] = useEditProfileMutation();
  const [groupBy, setGroupBy] = useState<'aisle' | 'recipe'>('recipe');
  const [activeTab, setActiveTab] = useState<'pending' | 'purchased'>('pending');
  const [swapItem, setSwapItem] = useState<any>(null); // State to track item being swapped
  const [unitSystem, setUnitSystem] = useState<'metric' | 'imperial'>('metric');

  const { data, isLoading } = useGetSingleListQuery({
    id: listId!,
    token: token || undefined,
  });
  const [deleteItem] = useDeleteUserItemMutation();
  const [updateItemStatus] = useUpdateItemStatusMutation();
  const [addCustomItem] = useAddCustomItemMutation();
  const [clearPurchasedItems] = useClearPurchasedItemsMutation();
  const [importList] = useAddItemMutation();
  const [addItemToSpecificList, { isLoading: isAddingIngredient }] =
    useAddItemtoSpecificListMutation();

  const listData = data?.data || {};
  const userListsItems = listData.items || [];
  const userListsCustomItems = listData.customItems || [];

  const pendingItems = [
    ...userListsItems.filter((item: any) => item.status !== 'purchased'),
    ...userListsCustomItems.filter((item: any) => item.status !== 'purchased'),
  ];
  const RecipeItems = [...userListsItems.filter((item: any) => item.status !== 'purchased')];
  const CustomItems = [...userListsCustomItems.filter((item: any) => item.status !== 'purchased')];

  const purchasedItems = [
    ...userListsItems.filter((item: any) => item.status === 'purchased'),
    ...userListsCustomItems.filter((item: any) => item.status === 'purchased'),
  ];

  const totalCount = userListsItems.length + userListsCustomItems.length;
  const purchasedCount = purchasedItems.length;
  const completionPercentage = totalCount > 0 ? (purchasedCount / totalCount) * 100 : 0;

  const handleDownloadPDF = async () => {
    if (!pdfRef.current) return;
    setIsPdf(true);
    const header = document.createElement('h3');
    header.textContent = t?.shopping_list?.your_items || 'Your Items';
    header.className = 'text-lg sm:text-xl font-bold text-gray-900 mb-4';
    pdfRef.current.insertBefore(header, pdfRef.current.firstChild);

    const imgs = pdfRef.current.querySelectorAll('img');
    await Promise.all(
      Array.from(imgs).map(
        (img) =>
          new Promise<void>((resolve) => {
            if (img.complete) resolve();
            else img.onload = () => resolve();
            img.onerror = () => resolve();
          }),
      ),
    );

    await exportPDF(pdfRef.current, `${listData.name || 'Shopping-List'}.pdf`);
    header.remove();
    setIsPdf(false);
  };

  const toggleItem = async (id: string) => {
    try {
      const allItems = [...userListsItems, ...userListsCustomItems];
      const currentItem = allItems.find((item) => item._id === id);
      const newStatus = currentItem?.status === 'purchased' ? 'pending' : 'purchased';
      updateItemStatus({
        listId,
        itemId: id,
        status: newStatus,
        token: token || undefined,
      }).unwrap();
    } catch {
      console.log('Error updating item status');
    }
  };

  const removeItem = async (id: string) => {
    if (!id) return;
    if (!window.confirm(t?.shopping_list?.confirm_delete_item || 'Delete this item?')) return;

    try {
      await deleteItem({ listId, itemId: id, token: token || undefined }).unwrap();
      toast.success(t?.shopping_list?.item_deleted_success || 'Item deleted successfully');
    } catch (error: any) {
      toast.error(
        error?.data?.message || t?.shopping_list?.delete_item_failed || 'Failed to delete item',
      );
    }
  };

  const addNewItem = async () => {
    if (!newItemText.trim()) {
      toast.error(t?.shopping_list?.enter_item_text || 'Please enter item text');
      return;
    }
    // Simple duplicate check for custom items
    const customExists = userListsCustomItems.some(
      (i: any) =>
        i.name?.en?.toLowerCase() === newItemText?.toLowerCase() ||
        i.name?.ar?.toLowerCase() === newItemText?.toLowerCase(),
    );

    if (customExists) {
      toast.info(t?.shopping_list?.item_already_exists || 'Item might already exist in your list');
    }

    try {
      const body = {
        name: { en: newItemText, ar: newItemText },
        listId,
        token: token || undefined,
      };
      const res = await addCustomItem(body).unwrap();
      toast.success(res.message);
      setNewItemText('');
    } catch (error: any) {
      toast.error(error?.data?.message || t?.shopping_list?.add_item_failed);
    }
  };

  const handleAddIngredient = async (payload: any) => {
    try {
      // If we are swapping, delete the old item first
      if (swapItem) {
        await deleteItem({ listId, itemId: swapItem._id, token: token || undefined }).unwrap();
      }

      await addItemToSpecificList({
        listId,
        token: token || undefined,
        items: [payload],
      }).unwrap();

      toast.success(
        swapItem
          ? t?.shopping_list?.item_swapped_success || 'Item swapped successfully'
          : t?.shopping_list?.item_added_success || 'Item added successfully',
      );

      // Close modal and reset swap item
      setIsIngredientModalOpen(false);
      setSwapItem(null);
    } catch (error: any) {
      toast.error(
        error?.data?.message || t?.shopping_list?.add_item_failed || 'Failed to add item',
      );
    }
  };

  const handleInitiateSwap = (item: any) => {
    setSwapItem(item);
    setIsIngredientModalOpen(true);
  };

  const handleSuggestedAdd = (suggestion: string) => {
    setNewItemText(suggestion);
    // Optionally auto-add:
    // addNewItem();
    // But strictly modifying state to let user confirm is safer, or we can just call the api directly:
    const body = {
      name: { en: suggestion, ar: suggestion },
      listId,
      token: token || undefined,
    };
    addCustomItem(body)
      .unwrap()
      .then((res) => toast.success(res.message))
      .catch((err) => toast.error(err?.data?.message || 'Failed'));
  };

  const handleClearPurchasedItems = async () => {
    if (purchasedItems.length === 0) {
      toast.info(t?.shopping_list?.no_purchased_to_clear || 'No purchased items to clear');
      return;
    }

    if (
      !window.confirm(
        (t?.shopping_list?.confirm_clear_purchased || 'Clear {count} items?').replace(
          '{count}',
          purchasedItems.length.toString(),
        ),
      )
    )
      return;

    try {
      await clearPurchasedItems({ listId, token: token || undefined }).unwrap();
      toast.success(t?.shopping_list?.purchased_cleared_success || 'Cleared purchased items');
    } catch (error: any) {
      toast.error(
        error?.data?.message || t?.shopping_list?.clear_purchased_failed || 'Failed to clear items',
      );
    }
  };

  const handleClearAll = async () => {
    const allItems = [...userListsItems, ...userListsCustomItems];
    if (allItems.length === 0) {
      toast.info(t?.shopping_list?.no_items_found || 'No items found');
      return;
    }

    if (
      !window.confirm(
        t?.shopping_list?.confirm_clear_all || 'Area you sure you want to clear all items?',
      )
    )
      return;

    try {
      // Since there is no bulk delete API, we delete items one by one
      // We can use Promise.all to do it in parallel
      const promises = allItems.map((item: any) =>
        deleteItem({ listId, itemId: item._id, token: token || undefined }).unwrap(),
      );

      await Promise.all(promises);
      toast.success(t?.shopping_list?.all_items_cleared_success || 'All items cleared');
    } catch (error: any) {
      toast.error(
        error?.data?.message || t?.shopping_list?.clear_all_failed || 'Failed to clear all',
      );
    }
  };
  const getItemCategory = (item: any, language: string) => {
    // Try to get category from item
    let category =
      item.item?.category?.[language] || item.item?.category?.en || item.item?.category?.ar;

    // If no category and it's a custom item, try to guess from name
    if (!category || category === 'Uncategorized') {
      const name = String(item.name?.en || item.item?.name?.en || '').toLowerCase();
      for (const key in CATEGORY_KEYWORDS) {
        if (name.includes(key)) {
          category = CATEGORY_KEYWORDS[key];
          break;
        }
      }
    }

    return category || t?.shopping_list?.uncategorized || 'Uncategorized';
  };
  const getCategoryStats = () => {
    const allItems = [...userListsItems, ...userListsCustomItems];
    const stats: Record<string, { total: number; completed: number }> = {};
    allItems.forEach((item: any) => {
      const category = getItemCategory(item, language);
      if (!stats[category]) stats[category] = { total: 0, completed: 0 };
      stats[category].total++;
      if (item.status === 'purchased') stats[category].completed++;
    });
    return stats;
  };

  const categoryStats = getCategoryStats();

  function formatItemsForImport(data: RawListItem[]) {
    const items: FormattedListItem[] = data.map((entry) => ({
      item: entry.item._id,
      itemType: entry.itemType,
      quantity: entry.quantity,
      unit: entry.unit,
      recipe: entry.recipe?._id,
      fruit: entry.fruit?._id,
      status: 'pending',
    }));

    return { items };
  }

  const handleImportList = async () => {
    const payload = formatItemsForImport(data?.data.items || []);
    console.log(payload);
    try {
      await importList(payload).unwrap();
      toast.success(t?.shopping_list?.list_imported_success || 'List imported');
      navigate(getLocalizedPath('/lists', language));
    } catch (error) {
      // if 401 unauthorized, navigate to login
      if (error && (error as any).status === 401) {
        navigate(getLocalizedPath('/login', language));
      }
    }
  };

  // handle checkout

  const handleCheckout = () => {
    // check if user has lcocation
    // if not open location modal
    if (purchasedItems.length > 0) {
      if (!user?.location) {
        setIsLocationModalOpen(true);
      }

      // or open choose store modal
      else {
        setIsChooseStoreModalOpen(true);
      }
    } else {
      toast.error(t?.shopping_list?.no_items_in_list || 'No items in list');
    }
  };

  const handleChooseStore = (storeUrl: string) => {
    navigate(storeUrl);
  };

  const handleLocationSubmit = async (data: LocationType) => {
    // update user profile with location data
    try {
      const updatedData = {
        location: {
          country: data.location?.country,
          zip: data.location?.zip,
        },
      };
      const response = await editProfile(updatedData).unwrap();

      toast.success(response.message);
      // close location modal and open choose store modal
      setIsLocationModalOpen(false);
      setIsChooseStoreModalOpen(true);
    } catch (error: any) {
      toast.error(error?.data?.message || t?.common?.error_occurred || 'An error occurred');
      console.log('err', error);
    }
    // then navigate to checkout page
  };

  if (isLoading) return <Loader />;
  console.log('categoryStats', categoryStats);
  // group by category with aggregation
  const groupItemsByCategory = (items: any[]) => {
    const grouped: Record<string, any[]> = {};
    const itemMap = new Map<string, any>();

    items.forEach((item) => {
      // Create a unique key for aggregation: Normalized Name + Normalized Unit
      // This ensures "Oil" and "oil", or "Tbsp" and "tbsp" are merged.

      const nameObj = item.item?.name || item.name;
      // Fallback to slug or ID if name is missing, but prioritize name for visual merging
      const rawName =
        nameObj?.[language] || nameObj?.en || nameObj?.ar || item.item?.slug?.en || 'unknown_item';
      const normalizedName = String(rawName).toLowerCase().trim();

      const unitObj = item.unit;
      const rawUnit = unitObj?.[language] || unitObj?.en || unitObj?.ar || 'unit';
      const normalizedUnit = String(rawUnit).toLowerCase().trim();

      const key = `${normalizedName}-${normalizedUnit}`;

      if (itemMap.has(key)) {
        const existing = itemMap.get(key);
        // Sum quantities
        existing.quantity = (existing.quantity || 0) + (item.quantity || 0);
      } else {
        // Shallow copy item to safely mutate quantity for display
        itemMap.set(key, { ...item });
      }
    });

    const aggregatedItems = Array.from(itemMap.values());

    aggregatedItems.forEach((item) => {
      const category = getItemCategory(item, language);
      if (!grouped[category]) grouped[category] = [];
      grouped[category].push(item);
    });

    // Sort alphabetically within categories
    Object.keys(grouped).forEach((category) => {
      grouped[category].sort((a, b) => {
        const nameA = String(a.item?.name?.[language] || a.name?.[language] || '').toLowerCase();
        const nameB = String(b.item?.name?.[language] || b.name?.[language] || '').toLowerCase();
        return nameA.localeCompare(nameB);
      });
    });

    return grouped;
  };
  // groupItemsByRecipe
  const groupItemsByRecipe = (items: any[]) => {
    const grouped: Record<string, any[]> = {};
    const recipeNames: Record<string, string> = {};

    items.forEach((item) => {
      const recipeId = item.recipe?._id;
      const recipeName = item.recipe?.title?.[language] || item.recipe?.title?.en;

      if (!grouped[recipeId]) grouped[recipeId] = [];
      grouped[recipeId].push(item);

      recipeNames[recipeId] = recipeName;
    });

    return { grouped, recipeNames };
  };
  const { grouped, recipeNames } = groupItemsByRecipe(RecipeItems);

  console.log('groupItemsByRecipe', groupItemsByRecipe(RecipeItems));
  const renderShoppingItems = (items: any[]) =>
    items.map((item: any) => (
      <ShoppingItem
        key={item._id}
        item={item}
        language={language}
        toggleItem={toggleItem}
        removeItem={removeItem}
        onSwap={handleInitiateSwap}
        isCustom={!userListsItems.some((ri: any) => ri._id === item._id)}
        isPdf={isPdf}
        unitSystem={unitSystem}
        // displayName={getItemDisplayName(item)}
        // quantityDisplay={getQuantityDisplay(item)}
        // recipeName={item.recipe?._id ? (item.recipe?.title?.[language] || item.recipe?.title?.en) : undefined}
      />
    ));

  return (
    <>
      <div className="max-w-6xl xl2:max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8 mb-[5rem] lg:mb-0">
        {/* Smart Dashboard Header */}
        <div className="mb-8 mt-4 sm:mt-0">
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                    <ShoppingCart className="w-6 h-6 text-white" />
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-white">
                    {listData.name || t?.shopping_list?.title || 'Shopping List'}
                  </h1>
                </div>
                <p className="text-gray-300 max-w-md">
                  {t?.shopping_list?.ingredients_in_list || 'Ingredients in your shopping list'}
                </p>

                <div className="flex gap-6 mt-6">
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">
                      {t?.shopping_list?.total_items || 'Total Items'}
                    </p>
                    <p className="text-2xl font-bold">{totalCount}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">
                      {t?.shopping_list?.completed || 'Completed'}
                    </p>
                    <p className="text-2xl font-bold text-green-400">{purchasedCount}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">
                      {t?.shopping_list?.remaining || 'Remaining'}
                    </p>
                    <p className="text-2xl font-bold text-orange-400">
                      {totalCount - purchasedCount}
                    </p>
                  </div>
                </div>
              </div>

              {/* Circular Progress */}
              <div className="flex items-center gap-4 bg-white/10 p-4 rounded-xl backdrop-blur-sm">
                <div className="text-right mr-2 hidden sm:block">
                  <p className="text-sm text-gray-300">
                    {t?.shopping_list?.shopping_progress || 'Your Progress'}
                  </p>
                  <p className="text-xs text-gray-400">
                    {purchasedCount} {t?.shopping_list?.of || 'of'} {totalCount} items
                  </p>
                </div>
                <CircularProgress
                  value={completionPercentage}
                  size={80}
                  strokeWidth={8}
                  textColor="text-white"
                  circleColor="text-gray-600"
                  progressColor="text-primaryColor"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Smart Command Bar */}
        <div className="mb-8 relative z-20 -mt-12 mx-4 sm:mx-8">
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-2 flex flex-col sm:flex-row gap-2">
            <Button
              onClick={() => setIsImportMealPlanModalOpen(true)}
              variant="ghost"
              className="flex-initial justify-start h-12 text-gray-700 hover:text-primaryColor hover:bg-green-50 px-4 border-r-0 sm:border-r border-gray-100 rounded-none sm:rounded-l-lg"
            >
              <CalendarDays className="w-5 h-5 mr-3" />
              <span className="text-base font-medium">
                {language === 'ar' ? 'استيراد وجبات' : 'Import Meals'}
              </span>
            </Button>

            <Button
              onClick={() => {
                setSwapItem(null);
                setIsIngredientModalOpen(true);
              }}
              variant="ghost"
              className="flex-1 justify-start h-12 text-gray-500 hover:text-primaryColor hover:bg-green-50"
            >
              <Search className="w-5 h-5 mr-3" />
              <span className="text-base font-normal">
                {t?.shopping_list?.search_ingredients || 'Search Database...'}
              </span>
            </Button>
            <div className="w-px bg-gray-200 my-2 hidden sm:block"></div>
            <div className="flex-1 flex items-center px-2">
              <Input
                placeholder={t?.shopping_list?.add_custom_item_placeholder || 'Add custom item...'}
                className="border-0 shadow-none focus-visible:ring-0 text-base h-10 bg-transparent flex-1"
                value={newItemText}
                onChange={(e) => setNewItemText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addNewItem()}
              />
              <Button
                onClick={addNewItem}
                size="sm"
                className="bg-primaryColor hover:bg-[#1c9a40] text-white ml-2 rounded-lg"
                disabled={!newItemText.trim()}
              >
                <Plus className="w-5 h-5" />
              </Button>
            </div>
          </div>
          {/* Quick Suggestions Chips */}
          <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start px-2">
            {SUGGESTED_ITEMS.slice(0, 5).map((item) => (
              <button
                key={item}
                onClick={() => handleSuggestedAdd(item)}
                className="text-xs font-medium bg-white/50 hover:bg-white text-gray-600 hover:text-primaryColor px-3 py-1.5 rounded-full border border-gray-200 transition-all shadow-sm"
              >
                + {item}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Items */}
          <div className="lg:col-span-8">
            <Card>
              <CardContent className="p-4 sm:p-6">
                <div
                  className={`flex flex-col sm:flex-row ${
                    isRTL ? 'items-start' : 'items-start'
                  }  sm:items-center justify-between mb-6`}
                >
                  {/* Smart Tabs */}
                  <div className="flex items-center p-1 bg-gray-100 rounded-lg mb-4 sm:mb-0">
                    <button
                      onClick={() => setActiveTab('pending')}
                      className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                        activeTab === 'pending'
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-500 hover:text-gray-900'
                      }`}
                    >
                      {t?.shopping_list?.pending_items || 'Pending'} ({pendingItems.length})
                    </button>
                    <button
                      onClick={() => setActiveTab('purchased')}
                      className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                        activeTab === 'purchased'
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-500 hover:text-gray-900'
                      }`}
                    >
                      {t?.shopping_list?.purchased_items || 'Purchased'} ({purchasedItems.length})
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="secondary" onClick={handleCheckout}>
                      <span className="hidden sm:inline-block">
                        {t?.shopping_list?.checkout || 'Checkout'}
                      </span>
                      <ShoppingCartIcon className="w-4 h-4 sm:ml-2" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setUnitSystem((prev) => (prev === 'metric' ? 'imperial' : 'metric'))
                      }
                      className="min-w-[80px]"
                    >
                      <ArrowRightLeft className="w-4 h-4 mr-2" />
                      {unitSystem === 'metric' ? 'Metric' : 'Imperial'}
                    </Button>
                    <Button onClick={handleDownloadPDF} variant="outline" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => setIsShareModalOpen(true)}
                      size="sm"
                      className="bg-primaryColor hover:bg-[#1c9a40] text-white"
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                    {activeTab === 'purchased' && purchasedItems.length > 0 && (
                      <Button
                        onClick={handleClearPurchasedItems}
                        size="sm"
                        variant="destructive"
                        className="bg-red-500 text-white"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        {t?.shopping_list?.clear_purchased || 'Clear Purchased'}
                      </Button>
                    )}
                    {activeTab === 'pending' && pendingItems.length > 0 && (
                      <Button
                        onClick={handleClearAll}
                        size="sm"
                        variant="destructive"
                        className="bg-red-100 text-red-600 hover:bg-red-200 border-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>

                <div ref={pdfRef}>
                  {activeTab === 'pending' && (
                    <>
                      {pendingItems.length > 0 ? (
                        <>
                          <div className="flex items-center justify-end mb-4">
                            <GroupingSelect groupBy={groupBy} setGroupBy={setGroupBy} />
                          </div>

                          {groupBy === 'aisle' ? (
                            Object.entries(groupItemsByCategory(pendingItems)).map(
                              ([category, items]) => (
                                <div key={category} className="mb-6">
                                  <div className="flex items-center gap-2 mb-3">
                                    <div className="h-6 w-1 bg-primaryColor rounded-full"></div>
                                    <h5 className="text-sm font-bold text-gray-800 uppercase tracking-wide">
                                      {category}
                                    </h5>
                                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                                      {items.length}
                                    </span>
                                  </div>
                                  {renderShoppingItems(items)}
                                </div>
                              ),
                            )
                          ) : (
                            <>
                              {Object.entries(grouped).map(([recipeId, items]) => (
                                <div key={recipeId} className="mb-6">
                                  <h5 className="text-md font-bold text-gray-800 border-b border-gray-100 pb-2 mb-3">
                                    {recipeNames[recipeId] || t?.shopping_list?.other || 'Other'}
                                  </h5>
                                  {renderShoppingItems(items)}
                                </div>
                              ))}
                              {CustomItems.length > 0 && (
                                <div className="mb-6">
                                  <h5 className="text-md font-bold text-gray-800 border-b border-gray-100 pb-2 mb-3">
                                    {t?.shopping_list?.other || 'Other'}
                                  </h5>
                                  {renderShoppingItems(CustomItems)}
                                </div>
                              )}
                            </>
                          )}
                        </>
                      ) : (
                        <div className="text-center py-12">
                          <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <ShoppingCart className="w-8 h-8 text-gray-300" />
                          </div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            {t?.shopping_list?.no_items_found || 'No items found'}
                          </h3>
                          <p className="text-gray-500 max-w-xs mx-auto text-sm leading-relaxed">
                            {t?.shopping_list?.add_ingredients_msg ||
                              'Add some ingredients to get started'}
                          </p>
                          <Button
                            variant="link"
                            onClick={() => setIsIngredientModalOpen(true)}
                            className="mt-4 text-primaryColor font-medium"
                          >
                            Browse Ingredients
                          </Button>
                        </div>
                      )}
                    </>
                  )}

                  {activeTab === 'purchased' && (
                    <div className="space-y-4">
                      {purchasedItems.length > 0 ? (
                        renderShoppingItems(purchasedItems)
                      ) : (
                        <div className="text-center py-12 text-gray-400">
                          <p>{t?.shopping_list?.no_purchased_to_clear || 'No purchased items'}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar + Stats */}
          {/* (unchanged for brevity) */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 space-y-6">
              {/* Categories Overview Card */}
              <Card>
                <CardContent className="p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4">
                    {t?.shopping_list?.categories || 'Categories'}
                  </h3>
                  <div className="space-y-3">
                    {Object.entries(categoryStats).map(([category, stats]) => (
                      <div key={category} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{category}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">
                            {stats.completed}/{stats.total}
                          </span>
                          <div className="w-12 h-2 bg-gray-200 rounded-full">
                            <div
                              className="h-2 bg-primaryColor rounded-full transition-all"
                              style={{
                                width: `${
                                  stats.total > 0 ? (stats.completed / stats.total) * 100 : 0
                                }%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Empty state for categories */}
                    {Object.keys(categoryStats).length === 0 && (
                      <p className="text-sm text-gray-500 text-center py-2">
                        {t?.shopping_list?.no_categories || 'No categories'}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      <ShareListModal
        listId={listId!}
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />
      {/* Location Modal */}
      <LocationModal
        isOpen={isLoccationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        onSubmit={handleLocationSubmit}
      />
      {/* Choose Store Modal */}
      <ChooseStoreModal
        isOpen={isChoseStoreModalOpen}
        onClose={() => setIsChooseStoreModalOpen(false)}
        onSubmit={handleChooseStore}
      />

      <IngredientSearchModal
        isOpen={isIngredientModalOpen}
        // If canceling swap, clear swap item
        onClose={() => {
          setIsIngredientModalOpen(false);
          setSwapItem(null);
        }}
        onAdd={handleAddIngredient}
        isLoading={isAddingIngredient}
        title={swapItem ? t?.shopping_list?.swap_item || 'Swap Item' : undefined}
        confirmLabel={swapItem ? t?.shopping_list?.swap || 'Swap' : undefined}
        initialQuery={
          swapItem
            ? swapItem.name?.[language] ||
              swapItem.name?.en ||
              swapItem.item?.name?.[language] ||
              swapItem.item?.name?.en ||
              ''
            : ''
        }
      />

      <ImportFromMealPlanModal
        isOpen={isImportMealPlanModalOpen}
        onClose={() => setIsImportMealPlanModalOpen(false)}
      />
    </>
  );
};
