import React from 'react';
import { GavelIcon, ScaleIcon } from './Icons';

const About: React.FC = () => {
  return (
    <section className="bg-white dark:bg-slate-900 py-20">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className="lg:w-1/2 flex justify-center items-center gap-8">
             <ScaleIcon className="w-32 h-32 text-slate-200 dark:text-slate-700" />
             <GavelIcon className="w-32 h-32 text-slate-200 dark:text-slate-700" />
          </div>
          <div className="lg:w-1/2 text-center lg:text-right">
            <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white">درباره من</h2>
            <div className="mt-4 w-24 h-1 bg-blue-600 dark:bg-amber-400 mx-auto lg:mx-0 rounded"></div>
            <p className="mt-6 text-lg text-slate-600 dark:text-slate-300 leading-loose">
              امیرحسین بای، وکیل پایه‌یک دادگستری و مشاور حقوقی، با اتکا به دانش حقوقی و تجربه در رسیدگی به پرونده‌های متعدد، همواره کوشیده‌ام تا بهترین مسیر را برای دستیابی به حقوق قانونی موکلینم فراهم آورم. رویکرد من مبتنی بر صداقت، شفافیت و پیگیری مستمر است و باور دارم که دفاع شایسته، حق مسلم هر فردی در برابر قانون است.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;