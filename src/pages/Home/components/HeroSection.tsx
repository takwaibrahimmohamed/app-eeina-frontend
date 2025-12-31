/**
 * HeroSection Component
 *
 * Hero banner displayed for logged-out users
 * Contains call-to-action buttons for signup and exploration
 */
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export const HeroSection = () => {
  const { t, isRTL } = useLanguage();
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center lg:items-end  lg:px-0 my-8">
      <div className="flex flex-col-reverse lg:flex-row justify-between items-center lg:items-start relative w-full">
        {/* Background Line Decoration */}
        <img
          src="/assets/home/line.svg"
          alt="line"
          className={`absolute z-5 bottom-0 ${
            isRTL && "scale-x-[-1] translate-x-[20px]"
          } left-0 hidden lg:block`}
        />

        {/* Left Side: Text Content and CTA */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex-1 mt-2 mb-4 lg:mt-20 gap-6 lg:gap-10 flex flex-col items-center lg:items-start text-center lg:text-left z-10"
        >
          <h2 className="text-3xl lg:text-[36px] font-bold text-primaryColor">
            {t.home.heroHeader}
          </h2>
          <p className="text-start text-xl lg:text-[24px] font-normal text-[#2A2C32]">
            {t.home.heroText}
          </p>
          <div className="flex flex-col items-center lg:items-start gap-3 w-full sm:w-auto">
            <button
              type="button"
              className="bg-primaryColor hover:bg-primaryColor/90 text-white text-[16px] font-medium rounded-[10px] w-full sm:w-[226px] h-[58px] transition-all duration-300 shadow-lg shadow-primaryColor/25 hover:shadow-primaryColor/40 transform hover:-translate-y-1"
              onClick={() => navigate("/signup")}
            >
              {t.home.startFreeTrial}
            </button>
          </div>
        </motion.div>

        {/* Right Side: Hero Image and Stats Cards */}
        <div className="flex-1 flex flex-col justify-end items-center lg:items-end space-y-4 w-full mb-10 lg:mb-0">
          {/* Hero Image with Circle Background */}
          <div className="relative flex justify-center lg:justify-end w-full">
            <div
              className={`z-40 absolute ${
                isRTL ? "-left-3" : "-right-3"
              } top-1/2 -translate-y-1/2 z-10 hidden lg:block`}
            >
              <img
                src="/assets/home/circlimg.svg"
                alt=""
                className="w-full h-full"
              />
            </div>

            <img
              src="/assets/home/HeroImg.svg"
              alt="heroImg"
              className="relative z-10 max-w-full h-auto"
            />
          </div>

          {/* Stats Cards Container */}
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-nowrap justify-center lg:justify-end items-center lg:items-end rounded-sm gap-2 lg:gap-5 w-full"
          >
            {/* Total Reviews Card */}
            <div className="w-[230px] sm:w-72 h-[64px] sm:h-20 relative">
              <div className="w-72 h-20 absolute top-0 left-0 origin-top-left scale-[0.8] sm:scale-100 sm:static sm:origin-center">
                <div className="w-72 h-20 left-0 top-0 absolute bg-white shadow-[-5px_5px_60px_0px_rgba(0,0,0,0.06)]" />
                <div className="w-14 h-14 left-[20px] top-[13px] absolute bg-neutral-200 rounded-full" />
                <div className="w-11 h-11 left-[25px] top-[18px] absolute bg-neutral-200 rounded-full" />
                <div className="w-9 h-9 left-[30px] top-[23px] absolute bg-white rounded-full" />
                <div className="left-[87px] top-[17px] absolute justify-start text-slate-900 text-sm font-medium font-['Poppins'] capitalize leading-5">
                  {t.home.totalreviews}
                </div>
                <div className="left-[113px] top-[44px] absolute justify-start text-slate-900 text-sm font-normal font-['Poppins'] leading-5">
                  (4.5 k)
                </div>
                <img
                  className="w-3 h-3 left-[95px] top-[47px] absolute"
                  src="/assets/home/Star 1.svg"
                  alt="star"
                />
                <div className="w-6 h-2 left-[207px] top-[61px] absolute bg-orange-400" />
                <div className="left-[200px] top-[59px] absolute justify-start text-slate-900 text-[8px] font-medium font-['Poppins'] capitalize">
                  1
                </div>
                <div className="w-7 h-2 left-[207px] top-[49px] absolute bg-amber-400" />
                <div className="left-[199px] top-[47px] absolute justify-start text-slate-900 text-[8px] font-medium font-['Poppins'] capitalize">
                  2
                </div>
                <div className="w-10 h-2 left-[207px] top-[37px] absolute bg-yellow-300" />
                <div className="left-[199px] top-[35px] absolute justify-start text-slate-900 text-[8px] font-medium font-['Poppins'] capitalize">
                  3
                </div>
                <div className="w-16 h-2 left-[207px] top-[13px] absolute bg-green-500" />
                <div className="left-[199px] top-[11px] absolute justify-start text-slate-900 text-[8px] font-medium font-['Poppins'] capitalize">
                  5
                </div>
                <div className="w-12 h-2 left-[207px] top-[25px] absolute bg-lime-300" />
                <div className="left-[199px] top-[23px] absolute justify-start text-slate-900 text-[8px] font-medium font-['Poppins'] capitalize">
                  4
                </div>
                <img
                  className="w-7 h-5 left-[34px] top-[31px] absolute object-contain"
                  src="/assets/home/logo.png"
                  alt="logo"
                />
              </div>
            </div>

            {/* Trusted Clients Card */}
            <div className="w-[90px] sm:w-28 h-[64px] sm:h-20 relative">
              <div className="w-28 h-20 absolute top-0 left-0 origin-top-left scale-[0.8] sm:scale-100 sm:static sm:origin-center">
                <div className="w-28 h-20 left-0 top-0 absolute bg-white shadow-[-5px_5px_60px_0px_rgba(0,0,0,0.06)]" />
                <div className="left-[35px] top-[17px] absolute justify-start text-slate-900 text-lg font-semibold font-['Poppins'] capitalize">
                  450k+
                </div>
                <div className="left-[12px] top-[46px] absolute justify-start text-slate-900 text-xs font-normal font-['Poppins'] capitalize">
                  {t.home.Trustedclients}
                </div>
              </div>
            </div>

            {/* Google Play Store Card */}
            <div className="w-32 h-20 relative hidden lg:block">
              <div className="w-32 h-20 left-0 top-0 absolute bg-white shadow-[-5px_5px_60px_0px_rgba(0,0,0,0.06)]" />
              <div className="left-[35px] top-[17px] absolute justify-start text-slate-900 text-lg font-semibold font-['Poppins'] capitalize flex items-center gap-1">
                4.5{" "}
                <img
                  src="/assets/home/yellowStar.svg"
                  alt="star"
                  className="w-4 h-4"
                />
              </div>
              <div className="left-[12px] top-[46px] absolute justify-start text-slate-900 text-xs font-normal font-['Poppins'] capitalize">
                {t.home.GooglePlayStore}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
