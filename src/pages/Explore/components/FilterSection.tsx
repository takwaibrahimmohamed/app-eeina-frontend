import { useLanguage } from '@/contexts/LanguageContext';
import { useState } from 'react';

interface FilterSectionProps {
  title: string;
  items: any[];
  selected: string[];
  onChange: (value: string[]) => void;
  showImage?: boolean;
}

export const FilterSection = ({
  title,
  items,
  selected,
  onChange,
  showImage = false,
}: FilterSectionProps) => {
  const [showAll, setShowAll] = useState(false);
  const { language } = useLanguage();
  const visibleItems = showAll ? items : items.slice(0, 5);

  return (
    <div className="flex flex-col gap-3">
      <h3 className="font-normal text-[18px]">{title}</h3>

      <div className="flex items-center gap-2 flex-wrap">
        {visibleItems.map((item) => {
          const slug = item.slug.en;
          const active = selected.includes(slug);

          return (
            <div
              key={slug}
              className={`border rounded-full w-fit px-4 py-1 flex items-center gap-2 cursor-pointer transition-all ${
                active
                  ? 'border-primaryColor bg-primaryColor/5'
                  : 'border-[#E4E6EA] hover:border-primaryColor/30'
              }`}
              onClick={() => {
                if (active) {
                  onChange(selected.filter((s) => s !== slug));
                } else {
                  onChange([...selected, slug]);
                }
              }}
            >
              {showImage && item.image?.url && (
                <img
                  src={item.image.url}
                  alt={item.name[language]}
                  className="w-10 h-10 rounded-full object-cover"
                />
              )}
              <span
                className={`text-[15px] font-normal ${
                  active ? 'text-primaryColor font-medium' : 'text-gray-600'
                }`}
              >
                {item.name[language]}
              </span>
            </div>
          );
        })}

        {items.length > 5 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-[#8C8C8C] font-medium text-[14px]"
          >
            {showAll
              ? language === 'ar'
                ? 'عرض أقل'
                : 'Show Less'
              : language === 'ar'
                ? 'عرض المزيد'
                : 'Show More'}
          </button>
        )}
      </div>
    </div>
  );
};
