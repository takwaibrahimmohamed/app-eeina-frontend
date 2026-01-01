
import {
  Target,
  List,
  Calendar,
  ShoppingCart,
  SearchIcon,
} from 'lucide-react';
import { Link } from 'react-router-dom';

import type { User as AuthUser } from '@/types/Auth/Auth';
import { Capacitor } from '@capacitor/core';

// Types (assuming these are defined elsewhere as per your original code)

interface NavItem {
  name: string;
  path: string;
}
export const MobileTopBar: React.FC<{
  isRTL: boolean;
  t: any;
  currentUser: AuthUser | null;
  onSearchClick: () => void;
  getLocalizedPath: (path: string) => string;
  activeLink: string;
  setActiveLink: (path: string) => void;

  handleNavClick: (item: NavItem) => string;
  isMoreOpen: boolean;
  setIsMoreOpen: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({
  isRTL,
  t,
  onSearchClick,
  activeLink,
  setActiveLink,
  handleNavClick,
  isMoreOpen,
  setIsMoreOpen,
}) => {
    const navIcons: Record<string, React.ReactNode> = {
      [t.nav.planner]: <Calendar size={24} />,
      [t.nav.lists]: <ShoppingCart size={24} />,
      [t.nav.goals]: <Target size={24} />,
      More: <List size={24} />, // Changed from Plus to List icon for More menu
      المزيد: <List size={24} />, // Changed from Plus to List icon for More menu
    };
    const moreNavItems: NavItem[] = [ // Planner and other items go to More menu
      { name: t.nav.planner, path: '/planner' },
      { name: t.nav.lists, path: '/lists' },
      { name: t.nav.goals, path: '/goals-dashboard' },
    ];

    const isWeb = Capacitor.getPlatform() === 'web';
    return (
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 safe-area-inset-top bg-white shadow-sm">
        <div className={`flex items-center justify-center px-4 py-3 pt-0 flex-row-reverse`}>
          {/* Search Icon and Actions */}
          <div className={`flex items-center justify-center gap-3 flex-row-reverse`}>
            {/* Search Icon */}
            <button
              onClick={onSearchClick}
              className={`bg-white p-2 text-primaryColor hover:text-primary hover:bg-gray-50 rounded-lg transition-colors`}
              aria-label="Search"
            >
              <SearchIcon size={20} className="stroke-primaryColor" />
            </button>
            {/* More Menu Button */}
            <div className="relative flex-1 flex justify-center">
              <button
                onClick={() => setIsMoreOpen(!isMoreOpen)}
                className={`bg-white flex flex-col items-center justify-center w-full py-2 transition-all duration-200 ${isMoreOpen ? 'text-primaryColor' : 'text-primaryColor hover:text-primaryColor'
                  }`}
              >
                <div className={`flex items-center gap-3 flex-row`}>
                  {moreNavItems.map((item, index) => (
                    <Link
                      key={index}
                      to={handleNavClick(item)}
                      onClick={() => {
                        setIsMoreOpen(false);
                        setActiveLink(item.path);
                      }}
                      className={`flex items-center px-2 text-sm font-medium hover:bg-gray-50 transition-colors 
                    
                    ${isRTL ? 'flex-row-reverse !justify-end' : '!justify-start'
                        } ${activeLink === item.path ? 'text-primaryColor' : 'text-primaryColor'}`}
                    >
                      <div className="flex">
                        <span> {navIcons[item.name] || <List size={20} />}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };