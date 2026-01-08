import { LogOut, X, User } from "lucide-react";
import { SearchSvg, Cart } from "@/assets";
import { useState, useRef, JSX } from "react";
import { Link } from "react-router-dom";

import { useLogOutMutation } from "@/redux/Features/Auth/authApi";
import { toast } from "sonner";
import Search from "./Search";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAppDispatch, useAppSelector } from "@/hooks/hook";
import { MobileTopBar } from "./TopBar";
import { MobileBottomNav } from "./BottomBar";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useClickOutside } from "./hook/useClickOutSide";
import { analytics } from "@/utils/analytics";
import { baseApi } from "@/redux/API/baseApi";
import { trackIfAllowed } from "@/utils/analyticsHelper";

// Types (assuming these are defined elsewhere as per your original code)

interface NavItem {
  name: string;
  path: string;
}

const MobileSearchOverlay: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  isRTL: boolean;
}> = ({ isOpen, onClose, isRTL }) => {
  if (!isOpen) return null;

  return (
    <div className="lg:hidden fixed inset-0 bg-white z-50 safe-area-inset-top">
      {/* Search Header */}
      <div
        className={`flex items-center justify-between px-4 py-3 border-b border-gray-200 ${
          isRTL ? "flex-row-reverse" : ""
        }`}
      >
        <button
          onClick={onClose}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Close search"
        >
          <X size={20} />
        </button>
        <span className="text-lg font-semibold text-gray-900">
          {isRTL ? "بحث" : "Search"}
        </span>
        <div className="w-8"></div> {/* Spacer for balance */}
      </div>

      {/* Search Component */}
      <div className="p-4">
        <Search onSearchComplete={onClose} />
      </div>
    </div>
  );
};

export const Header: React.FC = (): JSX.Element => {
  const { t, isRTL, language } = useLanguage();
  const currentUser = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const [logOut] = useLogOutMutation();
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const getCurrentPath = (): string => {
    const path = window.location.pathname;
    return path.startsWith("/ar") ? path.substring(3) || "/" : path;
  };
  const handleNavClick = (item: NavItem) => {
    if (
      (item.name === "Profile" || item.name === "الملف الشخصي") &&
      !currentUser
    ) {
      return getLocalizedPath("/login");
    }
    return getLocalizedPath(item.path);
  };
  const [activeLink, setActiveLink] = useState<string>(getCurrentPath());

  // Close dropdown or search when clicking outside

  useClickOutside(searchRef, () => setIsSearchOpen(false));
  useClickOutside(profileRef, () => setIsProfileDropdownOpen(false));
  const getLocalizedPath = (path: string): string => {
    if (path.startsWith("http")) return path;
    return language === "ar" ? `/ar${path === "/" ? "" : path}` : path;
  };

  const navItems: NavItem[] = [
    { name: t.nav.home, path: "/" },
    { name: t.nav.recipes, path: "/recipes" },
    {
      name: t.nav.Blog,
      path: `https://eeina.com/${language == "ar" ? "ar" : "en"}/blog`,
    },
    {
      name: `${language == "ar" ? "البرامج" : "Programs"}`,
      path: `https://eeina.com/${
        language == "ar" ? "ar" : "en"
      }/nutrition-program`,
    },
    { name: t.nav.planner, path: "/planner" },
    { name: t.nav.Packages, path: "/packages" },
    {
      name: `${language == "ar" ? "من نحن " : "About Us"}`,
      path: `https://eeina.com/${language == "ar" ? "ar" : "en"}/about`,
    },
  ];
  const handleLogout = async (): Promise<void> => {
    console.log("Attempting to log out...");
    try {
      // Track logout event before actually logging out
      trackIfAllowed(() => analytics.trackLogout());

      await logOut(undefined).unwrap();
      dispatch(baseApi.util.resetApiState());

      toast.success("User logged out successfully");
    } catch (error: any) {
      console.error("Logout error:", error);

      // If CSRF error, still clear local state and show message
      if (error?.data?.error === "CSRF_VALIDATION_FAILED") {
        toast.warning("Session expired. Please refresh the page.");
        // Still log out locally
        window.location.href = "/login";
      } else {
        toast.error(error?.data?.message || "Failed to logout");
      }
    }
  };

  return (
    <>
      {/* Desktop Header */}
      <header className="w-full h-20 bg-white shadow-header sticky -top-1 z-[50] hidden lg:flex">
        <div
          className={`container mx-auto max-w-6xl xl2:max-w-7xl px-6 flex items-center justify-between `}
        >
          {/* Logo */}
          <Link
            to={getLocalizedPath("/")}
            className="w-[95px] h-[71px] flex-shrink-0"
          >
            <img
              src="/EEINA_BBg-01.png"
              className="w-full h-full object-contain"
              alt="logo"
            />
          </Link>

          {/* Navigation */}
          <nav className={`flex items-center gap-4 lg:gap-5 xl:gap-7`}>
            {navItems.map((item, index) => (
              <Link
                key={index}
                to={getLocalizedPath(item.path)}
                onClick={() => setActiveLink(item.path)}
                className={`transition text-base xl:text-lg cursor-pointer ${
                  activeLink === item.path
                    ? "text-primaryColor font-bold"
                    : "text-gray-500 font-normal"
                } hover:text-primaryColor`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Right Controls */}
          <div className={`flex items-center  gap-4 lg:gap-5 `}>
            {/* Cart */}
            <Link to={getLocalizedPath("/lists")}>
              <Cart width="20" height="20" />
            </Link>

            {/* Search Icon */}
            <div className="relative" ref={searchRef}>
              <button onClick={() => setIsSearchOpen(!isSearchOpen)}>
                <SearchSvg width="20" height="20" />
              </button>

              {isSearchOpen && (
                <div
                  className={`absolute top-full mt-[26px] ${
                    isRTL ? "left-0" : "right-0"
                  } w-[700px] xl:w-[800px] h-[60px] xl:h-[70px] z-[9999]`}
                >
                  <Search onSearchComplete={() => setIsSearchOpen(false)} />
                </div>
              )}
            </div>

            {/* Language Switcher */}
            <div className="hidden md:block">
              <LanguageSwitcher />
            </div>

            {/* Auth or Profile */}
            {currentUser ? (
              <div className="relative profile-dropdown" ref={profileRef}>
                <button
                  onClick={() =>
                    setIsProfileDropdownOpen(!isProfileDropdownOpen)
                  }
                  className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full border-2 border-gray-200 overflow-hidden">
                    <img
                      src={
                        currentUser.image?.url ||
                        currentUser.profilePicture?.url ||
                        "/unnamed.jpg"
                      }
                      className="w-full h-full object-cover"
                      onError={(e) => (e.currentTarget.src = "/unnamed.jpg")}
                    />
                  </div>
                </button>

                {/* Dropdown */}
                {isProfileDropdownOpen && (
                  <div
                    className={`absolute mt-2 w-48 bg-white rounded-lg shadow-lg py-2 border border-gray-200 z-50 ${
                      isRTL ? "left-0" : "right-0"
                    }`}
                  >
                    <div className="px-4 py-3 border-b">
                      <p className="text-sm font-medium">
                        {currentUser.firstName} {currentUser.lastName}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {currentUser.email}
                      </p>
                    </div>

                    <Link
                      to={getLocalizedPath("/profile")}
                      onClick={() => setIsProfileDropdownOpen(false)}
                      className="flex items-center px-4 py-2 text-sm hover:bg-gray-50"
                    >
                      <User className="w-4 h-4 mr-2" />
                      {t.nav.profile || "Profile"}
                    </Link>

                    <button
                      onClick={() => {
                        handleLogout();
                        setIsProfileDropdownOpen(false);
                      }}
                      className=" flex w-full items-center px-4 py-2 text-sm hover:bg-gray-50"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      {language === "ar" ? "تسجيل الخروج" : "Logout"}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login">
                <button className="font-normal w-[117px] text-[14px] h-[50px] bg-greenShadeLight text-(--dark-color) rounded-[67px]">
                  {language === "ar" ? "دخول" : "Login"}
                </button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Top Bar */}
      <MobileTopBar
        getLocalizedPath={getLocalizedPath}
        activeLink={activeLink}
        setActiveLink={setActiveLink}
        isRTL={isRTL}
        t={t}
        currentUser={currentUser}
        onSearchClick={() => setIsMobileSearchOpen(true)}
        handleNavClick={handleNavClick}
        isMoreOpen={isMoreOpen}
        setIsMoreOpen={setIsMoreOpen}
      />

      {/* Mobile Search Overlay */}
      <MobileSearchOverlay
        isOpen={isMobileSearchOpen}
        onClose={() => setIsMobileSearchOpen(false)}
        isRTL={isRTL}
      />

      {/* Mobile Bottom Navigation */}
      {
        <MobileBottomNav
          getLocalizedPath={getLocalizedPath}
          activeLink={activeLink}
          setActiveLink={setActiveLink}
          isRTL={isRTL}
          t={t}
          currentUser={currentUser}
          handleNavClick={handleNavClick}
          setIsMoreOpen={setIsMoreOpen}
        />
      }
      {/* Add padding to main content to account for fixed elements */}
      <div className=" lg:hidden "></div>
    </>
  );
};
