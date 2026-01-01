import { AccSetting, Bookmark, Dish, EditProfile, Goals } from '@/assets';
import { SectionProps } from '../types';

export const getProfileSections = (language: 'ar' | 'en', t: any): SectionProps[] => [
  {
    id: 'recipes',
    title: language === 'ar' ? 'وصفاتي' : 'My Recipes',
    icon: <Dish />,
    links: [
      {
        label: language === 'ar' ? 'منشور' : 'Published',
        to: '/Profile?status=published',
        status: 'published',
      },
      {
        label: language === 'ar' ? 'قيد الانتظار' : 'Pending',
        to: '/Profile?status=pending',
        status: 'pending',
      },
      {
        label: language === 'ar' ? 'مسودة' : 'Drafts',
        to: '/Profile?status=drafts',
        status: 'drafts',
      },
      {
        label: language === 'ar' ? 'مرفوض' : 'Rejected',
        to: '/Profile?status=rejected',
        status: 'rejected',
      },
    ],
  },
  {
    id: 'saved',
    title: `${t.nav.saved}`,
    icon: <Bookmark />,
    links: [{ label: `${t.recipe.Recipes}`, to: '/savedrecipes' }],
  },
  {
    id: 'goals',
    title: language === 'ar' ? 'أهدافي' : 'My Goals',
    icon: <Goals />,
    links: [{ label: 'View Goals', to: '/goals-dashboard' }],
  },
  {
    id: 'profile',
    title: `${t.profile.edit_profile}`,
    icon: <EditProfile />,
    links: [
      {
        label: `${language === 'ar' ? 'صور الملف الشخصي' : 'Profile Images'}`,
        to: '/edit/profile-images',
      },
      {
        label: `${language === 'ar' ? 'المعلومات الأساسية' : 'Basic Information'}`,
        to: '/edit/Basic-information',
      },
      { label: `${language === 'ar' ? ' التفضيلات' : 'Preferences'}`, to: '/edit/Preferencers' },
      {
        label: `${language === 'ar' ? 'روابط وسائل التواصل الاجتماعي' : 'Social Media Links'}`,
        to: '/edit/Social-Media',
      },
      { label: `${t.goals.health_profile}`, to: '/edit/Health-Profile' },
    ],
  },
  {
    id: 'settings',
    title: `${t.profile.account_settings}`,
    icon: <AccSetting />,
    links: [
      { label: 'Settings', to: '/account-settings' },
      { label: language === 'ar' ? 'الاشتراك' : 'Subscription', to: '/subscription' },
    ],
  },
];
