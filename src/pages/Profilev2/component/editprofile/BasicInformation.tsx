import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import FloatingInput from '@/components/ui/FloatingInput';
import FloatingSelect from '@/components/ui/FloatingSelect';
import FloatingTextarea from '@/components/ui/FloatingTextarea';
import { useLanguage } from '@/contexts/LanguageContext';
import { EditProfileType } from '@/schemas/auth/User.Validation';
import { useFormContext } from 'react-hook-form';
import { useState, useEffect } from 'react';
import { countries } from '@/data/countries';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select';
const BasicInformation = () => {
  const { language } = useLanguage();
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<EditProfileType>();

  const currentPhone = watch('phone');
  const [selectedCountry, setSelectedCountry] = useState(countries.find(c => c.code === "SA") || countries[0]);
  const [localPhone, setLocalPhone] = useState("");

  // Sync state from form value (e.g. on initial load or reset)
  useEffect(() => {
    if (currentPhone) {
      // Check if currentPhone matches our current local state construction to avoid loops
      const currentConstruction = selectedCountry.dialCode + localPhone;
      // Also handle case where backend might not have '+' 
      const normalizedPhone = currentPhone.startsWith('+') ? currentPhone : `+${currentPhone}`;
      const normalizedConstruction = currentConstruction.startsWith('+') ? currentConstruction : `+${currentConstruction}`;

      if (normalizedPhone !== normalizedConstruction && normalizedPhone !== currentConstruction) {
        // Need to parse
        // Try to match dial codes. Sort countries by dial code length desc to match most specific first
        const matchingCountry = [...countries]
          .sort((a, b) => b.dialCode.length - a.dialCode.length)
          .find(c => normalizedPhone.startsWith(c.dialCode));

        if (matchingCountry) {
          setSelectedCountry(matchingCountry);
          // slice off the dial code
          setLocalPhone(normalizedPhone.slice(matchingCountry.dialCode.length));
        } else {
          // Fallback: assume no prefix or unknown
          setLocalPhone(currentPhone);
        }
      }
    } else if (currentPhone === "" && localPhone !== "") {
      // Form cleared externally?
      setLocalPhone("");
    }
  }, [currentPhone]);

  const updatePhoneValue = (countryCode: string, number: string) => {
    const combined = `${countryCode}${number}`;
    setValue('phone', combined, { shouldDirty: true, shouldValidate: true });
  };

  return (
    <Card className="mt-2">
      <CardContent className="px-4 py-6 lg:p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          {language === 'ar' ? 'المعلومات الأساسية' : 'Basic Information'}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FloatingInput
            label={language === 'ar' ? 'الاسم الأول' : 'First Name'}
            register={register('firstName')}
            error={errors.firstName?.message}
          />
          <FloatingInput
            label={language === 'ar' ? 'اسم العائلة' : 'Last Name'}
            register={register('lastName')}
            error={errors.lastName?.message}
          />

          <FloatingSelect
            label={language === 'ar' ? 'النوع' : 'Gender'}
            register={register('gender')}
            error={errors.gender}
            options={[
              { value: 'male', label: language === 'ar' ? 'ذكر' : 'Male' },
              { value: 'female', label: language === 'ar' ? 'أنثى' : 'Female' },
              { value: 'other', label: language === 'ar' ? 'آخر' : 'Other' },
            ]}
          />
          <FloatingInput
            label={language === 'ar' ? ' تاريخ الميلاد' : 'Date of Birth'}
            register={register('dob')}
            error={errors.dob?.message}
            type="date"
          />
          <div className="relative w-full">
            <div className="relative flex items-center h-[56px] w-full rounded-xl border border-gray-200 bg-white focus-within:ring-2 focus-within:ring-black focus-within:border-transparent overflow-hidden transition-all duration-200">
              <div className="h-full border-r border-gray-200 bg-gray-50/50">
                <Select
                  value={selectedCountry.code}
                  onValueChange={(value) => {
                    const country = countries.find((c) => c.code === value);
                    if (country) {
                      setSelectedCountry(country);
                      updatePhoneValue(country.dialCode, localPhone);
                    }
                  }}
                >
                  <SelectTrigger className="h-full border-none bg-transparent rounded-none px-3 w-[100px] focus:ring-0 hover:bg-transparent shadow-none">
                    {/* Render selected value manually */}
                    <div className="flex items-center gap-1">
                      <span className="mr-1 text-lg leading-none">{selectedCountry.flag}</span>
                      <span className="text-gray-600 font-medium text-sm">
                        {selectedCountry.dialCode}
                      </span>
                    </div>
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {countries.map((country) => (
                      <SelectItem key={country.code} value={country.code}>
                        <span className="mr-2 text-lg leading-none">{country.flag}</span>
                        <span className="mr-2 text-gray-500">
                          ({country.dialCode})
                        </span>
                        {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="relative flex-1 h-full">
                <input
                  type="tel"
                  id="phone-input"
                  value={localPhone}
                  maxLength={15}
                  className="block h-full w-full px-4 pt-5 pb-2 text-base text-gray-900 bg-transparent border-none outline-none focus:ring-0 placeholder-transparent peer"
                  placeholder=" "
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, '');
                    setLocalPhone(val);
                    updatePhoneValue(selectedCountry.dialCode, val);
                  }}
                />
                <label
                  htmlFor="phone-input"
                  className="absolute text-sm text-gray-500 duration-200 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] start-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3 cursor-text"
                >
                  {language === 'ar' ? 'رقم الهاتف' : 'Phone'}
                </label>
              </div>
            </div>
            {errors.phone && (
              <span className="text-red-500 text-xs mt-1 block px-1">
                {errors.phone.message}
              </span>
            )}
          </div>
          <FloatingInput
            label={language === 'ar' ? 'العنوان' : 'Street Address'}
            register={register('location.streetAddress')}
            error={errors?.location?.streetAddress?.message}
          />
          <FloatingInput
            label={language === 'ar' ? 'المدينة' : 'City'}
            register={register('location.city')}
            error={errors?.location?.city?.message}
          />
          <FloatingInput
            label={language === 'ar' ? 'الرمز البريدي' : 'ZIP Code'}
            register={register('location.zip')}
            error={errors?.location?.zip?.message}
          />
          <FloatingInput
            label={language === 'ar' ? 'الدولة' : 'Country'}
            register={register('location.country')}
            error={errors?.location?.country?.message}
          />
          <FloatingInput
            label={language === 'ar' ? 'الموقع الإلكتروني' : 'Website'}
            register={register('website')}
            error={errors.website?.message}
          />
        </div>

        <div className="mt-6">
          <FloatingTextarea label="Bio" register={register('bio')} error={errors.bio} />
        </div>
        <Button
          type="submit"
          form="edit-profile-form"
          className="flex lg:hidden w-full mt-4 bg-primaryColor hover:bg-[#1c9a40] text-white px-4 sm:px-8 rounded-[12px] py-3 h-12  sm:w-auto"
        >
          {language === 'ar' ? 'حفظ التعديلات' : 'Save Changes'}
        </Button>
      </CardContent>

    </Card>
  );
};

export default BasicInformation;
