import { Link } from 'react-router-dom';
import { useLanguage } from '../../../contexts/LanguageContext';
import { Button } from '../../../components/ui/button';
import { getLocalizedPath } from '../../../lib/getLocalizedPath';
import ImportRecipeWidget from './ImportRecipeWidget';

const Fastprocedures = () => {
  const { t, language } = useLanguage();

  return (
    <>
      <div className="flex flex-col gap-3 py-5 px-5  rounded-[24px] border-[#E1E1E1] border">
        <h2 className=" font-bold text-[20px] ">{t.profile.Fastprocedures}</h2>
        <div className="flex flex-col gap-2 justify-center items-center">
          <Link to={getLocalizedPath('/create-recipe', language)} className="w-full">
            <Button
              variant={'outline'}
              className="h-[43px] font-normal text-[14px] w-full border-[#E1E1E1] border rounded-[20px]"
            >
              {t.profile.Addrecipe}
            </Button>
          </Link>
          <Link to={getLocalizedPath('/lists', language)} className="w-full">
            <Button
              variant={'outline'}
              className="h-[43px] font-normal text-[14px] w-full border-[#E1E1E1] border rounded-[20px]"
            >
              {t.profile.Shoppinglist}
            </Button>
          </Link>
        </div>
      </div>


      <ImportRecipeWidget />
    </>
  );
};

export default Fastprocedures;
