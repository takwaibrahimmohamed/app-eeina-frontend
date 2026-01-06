import React, { JSX, useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLanguage } from '../../contexts/LanguageContext';
import { Button } from '../../components/ui/button';
import { Separator } from '../../components/ui/separator';
import { Eye, EyeOff } from 'lucide-react';
import { SignupFormData, signupSchema } from '../../schemas/auth/authSchema';
import { useSignupMutation } from '../../redux/Features/Auth/authApi';
import { toast } from 'sonner';
import { useAppSelector } from '../../hooks/hook';
import { useReferralsTrackMutation } from '@/redux/Features/referrals/referralApi';
import { analytics } from '@/utils/analytics';
import { getLocalizedPath } from '@/lib/getLocalizedPath';
import { trackIfAllowed } from '@/utils/analyticsHelper';
import { FacebookIcon, Google } from '@/assets';

// Get API URL from environment
const API_URL = import.meta.env.VITE_API_URL;

export const Signup = (): JSX.Element => {
  const { language, t, isRTL } = useLanguage();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [signUp] = useSignupMutation();
  const navigate = useNavigate();
  const [referralsTrack] = useReferralsTrackMutation();

  const user = useAppSelector((state) => state.auth.user);

  const [searchParams] = useSearchParams();
  const referralCode = searchParams.get('ref');

  useEffect(() => {
    if (!referralCode) return;

    referralsTrack({ referralCode })
      .unwrap()
      .then(() => localStorage.setItem('referral_code', referralCode));
  }, [referralCode]);

  useEffect(() => {
    if (user) {
      navigate(getLocalizedPath('/', language));
    }
  }, [user, navigate, language]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const password = watch('password');

  // calculate password strength
  React.useEffect(() => {
    let strength = 0;
    if (password?.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    setPasswordStrength(strength);
  }, [password]);

  const onSubmit = async (data: SignupFormData) => {
    console.log('Signup data:', data);
    try {
      const referralCode = localStorage.getItem('referral_code');
      const payload = referralCode ? { ...data, referralCode } : data;
      await signUp(payload).unwrap();
      toast.success(t.auth.signup_success);

      // Track successful signup
      trackIfAllowed(() => analytics.trackSignup('email'));

      navigate(getLocalizedPath('/verify-otp', language), {
        state: { email: data.email, redirectTo: '/goals-setup' },
      });
    } catch (error: any) {
      toast.error(error?.data?.message || t.auth.signup_failed);
      console.log('signup error', error);
    }
  };

  // OAuth handlers with tracking
  const handleGoogleSignup = () => {
    trackIfAllowed(() => analytics.trackSignup('google'));
    window.location.href = `${API_URL}/auth/google`;
  };

  const handleFacebookSignup = () => {
    trackIfAllowed(() => analytics.trackSignup('facebook'));
    window.location.href = `${API_URL}/auth/facebook`;
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 2) return 'bg-red-500';
    if (passwordStrength <= 4) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 2) return t.auth.password_weak;
    if (passwordStrength <= 4) return t.auth.password_medium;
    return t.auth.password_strong;
  };

  return (
    <div className="container min-h-screen ">
      <div className="flex flex-col lg:flex-row justify-between items-stretch gap-5 lg:gap-7 xl2:gap-16 pt-16">
        <div className="items-start w-full lg:flex-1 flex flex-col  px-0 lg:px-5 xl2:px-10">
          <div className="flex w-full flex-col gap-0 lg:gap-8 flex-1 lg:mt-28">
            <h2 className="leading-8 lg:leading-normal text-start font-semibold text-[18px] sm:text-[20px] lg:text-[24px] xl:text-[36px] xl2:text-[40px]">
              {t.auth.registerTitle}
            </h2>
            <div className=" bg-[#FBFCFC] lg:shadow  rounded-t-[32px] py-5 flex flex-col gap-5  flex-1  lg:px-8 lg:pt-16">
              <h3 className="text-[25px] lg:text-[36px] font-medium">{t.auth.create_account}</h3>
              <p className="text-[14px] font-medium text-[#3F4247] mb-1">
                {t.auth.already_have_account}
                <Link to={getLocalizedPath('/login', language)} className="hover:!text-[#1c9a40]">
                  {' '}
                  {t.auth.login}
                </Link>
              </p>
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-7  flex flex-col flex-1 lg:pb-5"
              >
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                  {/* Email Input */}
                  <div className="relative w-full col-span-12 lg:col-span-6">
                    <input
                      type="email"
                      placeholder={t.auth.placeholder_email}
                      {...register('email')}
                      className=" block h-12 w-full px-3 pb-2.5 pt-4 text-[14px] xl2:text-base text-gray-800 !bg-white rounded-xl border border-gray-300 appearance-none focus:outline-none focus:ring-1 focus:ring-[#DCDBDD] focus:border-[#DCDBDD] peer"
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
                      <span className="text-red-500 text-sm mt-1 block">
                        {errors.email.message}
                      </span>
                    )}
                  </div>
                  <div className="relative w-full col-span-12 lg:col-span-6">
                    <input
                      type="tel"
                      placeholder={t.auth.phone_number} // or enter_phone
                      {...register('phone')}
                      className=" block h-12 w-full px-3 pb-2.5 pt-4 text-[14px] xl2:text-base text-gray-800 !bg-white rounded-xl border border-gray-300 appearance-none focus:outline-none focus:ring-1 focus:ring-[#DCDBDD] focus:border-[#DCDBDD] peer"
                    />
                    <label
                      htmlFor="floating_outlined"
                      className="absolute text-[14px] md:text-[16px] text-[#84818A] duration-300 transform -translate-y-1/2 top-1/2 z-10 origin-[0] bg-[#FBFCFC] px-2 peer-focus:top-2 peer-focus:scale-75 
                        peer-focus:-translate-y-4 peer-focus:text-[#84818A] 
                        peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 
                         peer-valid:top-2 peer-valid:scale-75 peer-valid:-translate-y-4
                        start-3"
                    >
                      {t.auth.phone_number}
                    </label>
                    {errors.phone && (
                      <span className="text-red-500 text-sm mt-1 block">
                        {errors.phone.message}
                      </span>
                    )}
                  </div>
                  <div className="relative w-full col-span-12 lg:col-span-6">
                    <input
                      type="text"
                      placeholder={t.auth.first_name}
                      {...register('firstName')}
                      className=" block h-12 w-full px-3 pb-2.5 pt-4 text-[14px] xl2:text-base text-gray-800 !bg-white rounded-xl border border-gray-300 appearance-none focus:outline-none focus:ring-1 focus:ring-[#DCDBDD] focus:border-[#DCDBDD] peer"
                    />
                    <label
                      htmlFor="floating_outlined"
                      className="absolute text-[14px] md:text-[16px] text-[#84818A] duration-300 transform -translate-y-1/2 top-1/2 z-10 origin-[0] bg-[#FBFCFC] px-2 peer-focus:top-2 peer-focus:scale-75 
                        peer-focus:-translate-y-4 peer-focus:text-[#84818A] 
                        peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 
                         peer-valid:top-2 peer-valid:scale-75 peer-valid:-translate-y-4
                        start-3"
                    >
                      {t.auth.first_name}
                    </label>
                    {errors.firstName && (
                      <span className="text-red-500 text-sm mt-1 block">
                        {errors.firstName.message}
                      </span>
                    )}
                  </div>
                  <div className="relative w-full col-span-12 lg:col-span-6">
                    <input
                      type="text"
                      placeholder={t.auth.last_name}
                      {...register('lastName')}
                      className=" block h-12 w-full px-3 pb-2.5 pt-4 text-[14px] xl2:text-base text-gray-800 !bg-white rounded-xl border border-gray-300 appearance-none focus:outline-none focus:ring-1 focus:ring-[#DCDBDD] focus:border-[#DCDBDD] peer"
                    />
                    <label
                      htmlFor="floating_outlined"
                      className="absolute text-[14px] md:text-[16px] text-[#84818A] duration-300 transform -translate-y-1/2 top-1/2 z-10 origin-[0] bg-[#FBFCFC] px-2 peer-focus:top-2 peer-focus:scale-75 
                        peer-focus:-translate-y-4 peer-focus:text-[#84818A] 
                        peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 
                         peer-valid:top-2 peer-valid:scale-75 peer-valid:-translate-y-4
                        start-3"
                    >
                      {t.auth.last_name}
                    </label>
                    {errors.lastName && (
                      <span className="text-red-500 text-sm mt-1 block">
                        {errors.lastName.message}
                      </span>
                    )}
                  </div>

                  {/* Password Input */}
                  <div className=" col-span-12">
                    <div className="relative w-full">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder={t.auth.placeholder_password}
                        {...register('password')}
                        className="block h-12 w-full px-3 pb-2.5 pt-4 text-[14px] xl2:text-base text-gray-800 bg-white rounded-xl border border-gray-300 appearance-none focus:outline-none focus:ring-1 focus:ring-[#DCDBDD] focus:border-[#DCDBDD] peer"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className={`absolute top-1/2 transform -translate-y-1/2 hover:bg-transparent ${
                          isRTL ? 'left-3' : 'right-3'
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
                        {t.auth.placeholder_password}
                      </label>
                      {errors.password && (
                        <span className="text-red-500 text-sm mt-1 block">
                          {errors.password.message}
                        </span>
                      )}
                    </div>
                    {password && (
                      <div className="mt-2">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                            <div
                              className={`h-1.5 rounded-full transition-all duration-300 !bg-[#87B740] ${getPasswordStrengthColor()}`}
                              style={{
                                width: `${(passwordStrength / 5) * 100}%`,
                              }}
                            />
                          </div>
                          <span className="text-xs font-medium text-gray-600">
                            {getPasswordStrengthText()}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password Input */}
                  <div className="col-span-12">
                    <div className="relative w-full">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder={t.auth.confirm_password}
                        {...register('confirmPassword')}
                        className="block h-12 w-full px-3 pb-2.5 pt-4 text-[14px] xl2:text-base text-gray-800 bg-white rounded-xl border border-gray-300 appearance-none focus:outline-none focus:ring-1 focus:ring-[#DCDBDD] focus:border-[#DCDBDD] peer"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className={`absolute top-1/2 transform -translate-y-1/2 hover:bg-transparent ${
                          isRTL ? 'left-3' : 'right-3'
                        } text-gray-400 hover:text-gray-600`}
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
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
                        {t.auth.confirm_password}
                      </label>
                      {errors.confirmPassword && (
                        <span className="text-red-500 text-sm mt-1 block">
                          {errors.confirmPassword.message}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Terms */}
                <div className="flex items-start gap-3 pt-2">
                  <input
                    type="checkbox"
                    id="agreeToTerms"
                    {...register('agreeToTerms')}
                    className="w-4 h-4 mt-1 rounded border-gray-300 checked:bg-[#87B740] checked:border-[#87B740]  accent-[#5ea037] cursor-pointer"
                  />

                  <label htmlFor="agreeToTerms" className="text-sm text-[#84818A]">
                    {t.auth.i_agree_to}{' '}
                    <Link
                      to={getLocalizedPath('/Terms_Conditions', language)}
                      className="font-medium text-primaryColor hover:underline"
                    >
                      {t.footer.terms_conditions}
                    </Link>{' '}
                    &{' '}
                    <Link
                      to={getLocalizedPath('/privacy-policy', language)}
                      className="font-medium text-primaryColor hover:underline"
                    >
                      {t.auth.privacy_policy}
                    </Link>
                  </label>
                </div>
                {errors.agreeToTerms && (
                  <span className="text-red-500 text-sm -mt-4 block">
                    {errors.agreeToTerms.message}
                  </span>
                )}
                <Button
                  type="submit"
                  // disabled={isSubmitting}
                  className="w-full h-12 bg-[#87B740] hover:bg-primaryColor text-white font-semibold text-base rounded-xl"
                >
                  {isSubmitting ? t.auth.creating_account : t.auth.create_account}
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
                <div className=" flex justify-between items-center gap-4 lg:px-7 w-full">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1  flex-shrink-0  h-12 rounded-[12px] border-[#DCDBDD] text-[14px] font-medium"
                    onClick={handleGoogleSignup}
                  >
                    <div className="flex-shrink-0">
                      <Google />
                    </div>
                    {t.auth.continue_with_google}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 flex-shrink-0 h-12 rounded-[12px] border-[#DCDBDD] text-[14px] font-medium"
                    onClick={handleFacebookSignup}
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
