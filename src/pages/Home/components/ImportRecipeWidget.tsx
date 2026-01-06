import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Input } from '@/components/ui/input';
import { useImportRecipeWithAIMutation } from '@/redux/Features/Recipe/RecipeApi';
import { toast } from 'sonner';
import GreenButton from '@/components/ui/GreenButton';
import { getLocalizedPath } from '@/lib/getLocalizedPath';
import { Importtikto, ImportUrl, ImportYoutupe } from '@/assets';
import { useAppDispatch, useAppSelector } from '@/hooks/hook';
import { openPremiumModal } from '@/redux/Features/Global/globalSlice';

// No props needed as it's self-contained now
const ImportRecipeWidget = () => {
    const { t, language } = useLanguage();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const user = useAppSelector((state) => state.auth.user);
    const isPremiumUser = user?.accountType === 'premium';

    const [recipeUrl, setRecipeUrl] = useState('');
    const [selectedSource, setSelectedSource] = useState<'website' | 'youtube' | 'tiktok'>('website');
    const [importRecipe, { isLoading: isImporting }] = useImportRecipeWithAIMutation();
    const lang = language === 'ar' ? 'Arabic' : 'English';

    const handleSourceSelect = (source: 'website' | 'youtube' | 'tiktok') => {
        if ((source === 'youtube' || source === 'tiktok') && !isPremiumUser) {
            dispatch(openPremiumModal());
            return;
        }
        setSelectedSource(source);
        setRecipeUrl(''); // Clear input when switching sources
    };

    const renderSourceIcon = (source: 'website' | 'youtube' | 'tiktok', Icon: any) => (
        <div
            onClick={() => handleSourceSelect(source)}
            className={`cursor-pointer p-2 rounded-xl transition-all duration-200 ${selectedSource === source ? 'bg-green-100 border-2 border-[#6AB240]' : 'hover:bg-gray-50 border border-transparent'}`}
        >
            <Icon className={`w-8 h-8 ${selectedSource === source ? 'opacity-100' : 'opacity-70 grayscale hover:grayscale-0'}`} />
        </div>
    );

    const getPlaceholder = () => {
        if (language === 'ar') {
            switch (selectedSource) {
                case 'youtube': return 'ضع رابط يوتيوب هنا';
                case 'tiktok': return 'ضع رابط تيك توك هنا';
                default: return 'ضع رابط الموقع هنا';
            }
        } else {
            switch (selectedSource) {
                case 'youtube': return 'Paste YouTube URL';
                case 'tiktok': return 'Paste TikTok URL';
                default: return 'Paste website URL';
            }
        }
    };

    const validateUrl = (url: string, source: 'website' | 'youtube' | 'tiktok') => {
        const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;

        if (!urlPattern.test(url)) return false;

        switch (source) {
            case 'youtube':
                return url.includes('youtube.com') || url.includes('youtu.be');
            case 'tiktok':
                return url.includes('tiktok.com');
            default:
                return true;
        }
    };

    const handleImport = async () => {
        if (!recipeUrl) {
            toast.error(language === 'ar' ? 'من فضلك أدخل رابط الوصفة.' : 'Please enter a recipe URL.');
            return;
        }

        if (!validateUrl(recipeUrl, selectedSource)) {
            let errorMsg = '';
            if (language === 'ar') {
                switch (selectedSource) {
                    case 'youtube': errorMsg = 'يرجى إدخال رابط يوتيوب صحيح'; break;
                    case 'tiktok': errorMsg = 'يرجى إدخال رابط تيك توك صحيح'; break;
                    default: errorMsg = 'يرجى إدخال رابط صحيح';
                }
            } else {
                switch (selectedSource) {
                    case 'youtube': errorMsg = 'Please enter a valid YouTube URL'; break;
                    case 'tiktok': errorMsg = 'Please enter a valid TikTok URL'; break;
                    default: errorMsg = 'Please enter a valid URL';
                }
            }
            toast.error(errorMsg);
            return;
        }

        try {
            const result = await importRecipe({ url: recipeUrl, lang }).unwrap();
            const recipe = result.recipe.data;

            toast.success(
                result?.message ||
                (language === 'ar' ? 'تم استيراد الوصفة بنجاح!' : 'Recipe imported successfully!'),
            );

            setRecipeUrl('');

            navigate(getLocalizedPath('/create-recipe', language), {
                state: {
                    importedRecipe: {
                        title: recipe.title || '',
                        description: recipe.description || '',
                        ingredients: recipe.ingredients || [],
                        instructions: recipe.instructions || [],
                        yields: recipe.yields || 2,
                        time: recipe.cook_time || 0,
                        thumbnail: recipe.image,
                        otherImages: recipe.otherImages || [],
                        videoUrl: recipe.url || '',
                    },
                },
            });
        } catch (err: any) {
            const msg = err?.data?.message || err?.error || 'Something went wrong!';
            toast.error(msg);
        }
    };

    return (
        <div className="flex flex-col gap-4 py-6 px-5 rounded-[24px] border-[#E1E1E1] border bg-white">
            <h2 className="font-bold text-[20px]">{t.home?.import_recipe || (language === 'ar' ? 'استيراد وصفة' : 'Import Recipe')}</h2>

            <div className="flex justify-start gap-4 items-center px-2">
                {renderSourceIcon('website', ImportUrl)}
                {renderSourceIcon('youtube', ImportYoutupe)}
                {renderSourceIcon('tiktok', Importtikto)}
            </div>

            <Input
                value={recipeUrl}
                onChange={(e) => setRecipeUrl(e.target.value)}
                className="!py-5 font-normal text-[12px] text-[#22212C66] rounded-[20px] focus:border-[#22ae4b] focus:ring-[#22ae4b]"
                placeholder={getPlaceholder()}
            />
            <GreenButton
                onClick={handleImport}
                className="font-normal text-[14px] w-full py-2 !rounded-[20px] bg-[#6AB240] text-white"
                disabled={isImporting}
            >
                {isImporting
                    ? language === 'ar'
                        ? 'وصفتك تطبخ الآن...'
                        : 'Your recipe is cooking...'
                    : language === 'ar'
                        ? 'استيراد'
                        : 'Import'}
            </GreenButton>
        </div>
    );
};

export default ImportRecipeWidget;
