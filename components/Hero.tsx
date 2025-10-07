import React from 'react';
import { PhoneIcon, WhatsAppIcon, InstagramIcon } from './Icons';

const Hero: React.FC = () => {
  return (
    <section className="bg-slate-100 dark:bg-slate-800 py-20 md:py-32">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center gap-12">
          <div className="md:w-1/2 text-center md:text-right">
            <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white leading-tight">
              <span className="text-blue-600 dark:text-amber-400">وکیل امیرحسین بای</span>
            </h2>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
              ارائه خدمات وکالت و مشاوره حقوقی تخصصی. وکیل پایه‌یک دادگستری، متعهد به احقاق حق شما.
            </p>
            <div className="mt-8 flex flex-wrap gap-4 justify-center md:justify-start">
              <a
                href="tel:09113797376"
                className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-amber-500 dark:hover:bg-amber-600 text-white font-bold rounded-lg shadow-lg transition-transform transform hover:scale-105"
              >
                <PhoneIcon className="w-5 h-5" />
                <span>تماس فوری</span>
              </a>
              <a
                href="https://wa.me/989113797376"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-700 hover:bg-slate-600 dark:bg-slate-600 dark:hover:bg-slate-500 text-white font-bold rounded-lg shadow-lg transition-transform transform hover:scale-105"
              >
                <WhatsAppIcon className="w-5 h-5" />
                <span>مشاوره واتساپ</span>
              </a>
               <a
                href="https://instagram.com/vakilbay"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 hover:opacity-90 text-white font-bold rounded-lg shadow-lg transition-transform transform hover:scale-105"
              >
                <InstagramIcon className="w-5 h-5" />
                <span>اینستاگرام</span>
              </a>
            </div>
             <p className="mt-4 text-sm text-green-600 dark:text-green-400 font-semibold text-center md:text-right">
              مشاوره اولیه از طریق واتساپ همیشه رایگان است.
            </p>
          </div>
          <div className="md:w-1/2 flex justify-center">
            <div className="w-64 h-64 md:w-80 md:h-80 rounded-full overflow-hidden shadow-2xl border-4 border-blue-600 dark:border-amber-400">
              <img
                src="https://i.ibb.co/JR5yz4CF/Gemini-Generated-Image-kmhhcukmhhcukmhh.png"
                alt="امیرحسین بای، وکیل پایه‌یک دادگستری"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;