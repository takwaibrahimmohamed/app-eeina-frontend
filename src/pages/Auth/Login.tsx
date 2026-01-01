import { JSX, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "../../contexts/LanguageContext";
import { Button } from "../../components/ui/button";
import { Separator } from "../../components/ui/separator";
import {
  Eye,
  EyeOff,
  ArrowRight,
} from "lucide-react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginFormData, loginSchema } from "../../schemas/auth/authSchema";
import { useLoginMutation } from "../../redux/Features/Auth/authApi";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/hooks/hook";
import { setAccessToken } from "@/redux/Features/Auth/authSlice";
import { analytics } from "@/utils/analytics";
import { getLocalizedPath } from "@/lib/getLocalizedPath";
import { trackIfAllowed } from "@/utils/analyticsHelper";
import { FacebookIcon, Google } from "@/assets";

// Get API URL from environment
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5050/api/v1";

// Zod validation schema

export const Login = (): JSX.Element => {
  const { t, isRTL, language } = useLanguage();
  const [showPassword, setShowPassword] = useState(false);
  const [login] = useLoginMutation();
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();

  if (user) {
    navigate(getLocalizedPath("/", language));
  }

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onChange", // validate on input change
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const res = await login(data).unwrap();
      dispatch(setAccessToken(res?.data?.accessToken));
      toast.success(t.auth.login_success);

      // Track successful login
      trackIfAllowed(() => analytics.trackLogin("email"));

      navigate(getLocalizedPath("/", language));
    } catch (error: any) {
      toast.error(error?.data?.message || t.auth.login_failed);
    }
  };

  // OAuth handlers
  const handleGoogleLogin = () => {
    trackIfAllowed(() => analytics.trackLogin("google"));
    window.location.href = `${API_URL}/auth/google`;
  };

  const handleFacebookLogin = () => {
    trackIfAllowed(() => analytics.trackLogin("facebook"));
    window.location.href = `${API_URL}/auth/facebook`;
  };

  return (
    <div className="container min-h-screen ">
      <div className="flex flex-col lg:flex-row justify-between items-stretch gap-5 lg:gap-7 xl2:gap-16 pt-16">
        <div className="items-start w-full lg:flex-1 flex flex-col  px-0 lg:px-5 xl2:px-10">
          <div className="flex w-full flex-col gap-0 lg:gap-8 flex-1 lg:mt-28">
            <h2 className="leading-8 lg:leading-normal text-start font-semibold text-[20px] lg:text-[24px] xl:text-[36px] xl2:text-[40px]">
              {t.auth.loginTitle}
            </h2>
            <div className=" bg-[#FBFCFC] lg:shadow  rounded-t-[32px] py-5 flex flex-col gap-5  flex-1  lg:px-8 lg:pt-16">
              <h3 className="text-[25px] lg:text-[36px] font-medium">
                {t.auth.sign_in}
              </h3>
              <p className="text-[14px] font-medium text-[#3F4247] mb-1">
                {t.auth.Newuser}
                <Link to={getLocalizedPath("/signup", language)}>
                 {" "} {t.auth.create_account}
                </Link>
              </p>
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-7  flex flex-col flex-1"
              >
                {/* Email Input */}
                <div className="relative w-full ">
                  <input
                    type="email"
                    placeholder={t.auth.placeholder_email}
                    {...register("email")}
                    className=" block h-12 w-full px-3 pb-2.5 pt-4 text-base text-gray-800 !bg-white rounded-xl border border-gray-300 appearance-none focus:outline-none focus:ring-1 focus:ring-[#DCDBDD] focus:border-[#DCDBDD] peer"
                  />
                  <label
                    htmlFor="floating_outlined"
                    className="absolute text-[14px] md:text-[16px] text-[#84818A] duration-300 transform -translate-y-1/2 top-1/2 z-10 origin-[0] bg-[#FBFCFC] px-2 peer-focus:top-2 peer-focus:scale-75 
                    peer-focus:-translate-y-4 peer-focus:text-[#84818A] 
                    peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 
                     peer-valid:top-2 peer-valid:scale-75 peer-valid:-translate-y-4
                    start-3"
                  >
                    {t.auth.email}
                  </label>
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.email.message}
                    </p>
                  )}
                </div>
                {/* Password Input */}
                <div className="relative w-full ">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder={t.auth.placeholder_password}
                    {...register("password")}
                    className="block h-12 w-full px-3 pb-2.5 pt-4 text-base text-gray-800 bg-white rounded-xl border border-gray-300 appearance-none focus:outline-none focus:ring-1 focus:ring-[#DCDBDD] focus:border-[#DCDBDD] peer"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className={`absolute top-1/2 transform -translate-y-1/2 hover:bg-transparent ${
                      isRTL ? "left-3" : "right-3"
                    } text-gray-400 hover:text-gray-600`}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5 text-[#84818A]" />
                    ) : (
                      <Eye className="w-5 h-5 text-[#84818A]" />
                    )}
                  </Button>
                  <label
                    htmlFor="floating_outlined"
                    className="absolute text-[14px] md:text-[16px] text-[#84818A] duration-300 transform -translate-y-1/2 top-1/2 z-10 origin-[0] bg-[#FBFCFC] px-2 peer-focus:top-2 peer-focus:scale-75 
                    peer-focus:-translate-y-4 peer-focus:text-[#84818A] 
                    peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 
                     peer-valid:top-2 peer-valid:scale-75 peer-valid:-translate-y-4
                    start-3"
                  >
                    {t.auth.password}
                  </label>
                  {errors.password && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-primaryColor border-gray-300 rounded focus:ring-primaryColor"
                      {...register("rememberMe")}
                    />
                    <span className="text-[12px] text-[#47464A]">
                      {t.auth.remember_me}
                    </span>
                  </label>
                  <Link
                    to={getLocalizedPath("/forgot-password", language)}
                    className="text-[12px] text-[#47464A] hover:text-[#1c9a40] font-normal"
                  >
                    {t.auth.forgot_password}
                  </Link>
                </div>

                {/* Login Button */}
                <Button
                  type="submit"
                  disabled={isSubmitting || !isValid}
                  className="w-full h-12 bg-[#87B740] hover:bg-primaryColor text-white font-semibold text-base rounded-xl"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>{t.auth.signing_in}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span>{t.auth.sign_in}</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  )}
                </Button>

                {/* Divider */}
                <div className="relative py-3">
                  <Separator />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="bg-[#FBFCFC] px-4 text-sm text-[#84818A] text-[14px] font-normal">
                      {t.auth.or}
                    </span>
                  </div>
                </div>

                {/* Social Login */}
                <div className=" flex justify-between items-center gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 w-full h-12 rounded-[12px] border-[#DCDBDD] text-[14px] font-medium"
                    onClick={handleGoogleLogin}
                  >
                    <Google />
                    {t.auth.continue_with_google}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 w-full h-12 rounded-[12px] border-[#DCDBDD] text-[14px] font-medium"
                    onClick={handleFacebookLogin}
                  >
                    <div className="flex-shrink-0 w-[15px] h-[15px] p-3  bg-[#1977F3] rounded-full  flex items-center justify-center">
                      <FacebookIcon className="text-white" />
                    </div>
                    {t.auth.continue_with_facebook}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
        <div className="flex-1 pb-16   hidden lg:flex ">
          <img
            src="/Calculate my needs.svg"
            alt="goalinfo"
            className="rounded-[32px] h-full w-full object-cover "
          />
        </div>
      </div>
    </div>
  );
};
