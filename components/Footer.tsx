import React from 'react';
import { InstagramIcon } from './Icons';

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center md:text-right">
          <div className="md:col-span-2">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">دفتر وکالت امیرحسین بای</h3>
            <p className="text-sm">متعهد به دفاع از حقوق شما با دانش و تجربه.</p>
            <div className="flex justify-center md:justify-start mt-4">
                <a href="https://instagram.com/vakilbay" target="_blank" rel="noopener noreferrer" aria-label="اینستاگرام" className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-amber-400">
                    <InstagramIcon className="w-6 h-6" />
                </a>
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">لینک‌های مفید</h3>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-blue-600 dark:hover:text-amber-400 transition-colors">سیاست حریم خصوصی</a></li>
              <li><a href="#" className="hover:text-blue-600 dark:hover:text-amber-400 transition-colors">شرایط استفاده</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">تماس با ما</h3>
            <p className="text-sm">آدرس: گنبد کاووس، خ دارایی، مجتمع بردی‌پور، واحد ۴</p>
            <p className="text-sm mt-2" dir="ltr">تلفن: <a href="tel:09113797376" className="hover:text-blue-600 dark:hover:text-amber-400">0911 379 7376</a></p>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            © {new Date().getFullYear()} دفتر وکالت امیرحسین بای – کلیه حقوق محفوظ است.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;