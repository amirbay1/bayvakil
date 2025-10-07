import React from 'react';
import { PhoneIcon, WhatsAppIcon, LocationIcon, ClockIcon, InstagramIcon } from './Icons';

const Contact: React.FC = () => {
  return (
    <section className="bg-white dark:bg-slate-900 py-20" id="contact">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white">ارتباط با ما</h2>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
            برای مشاوره حقوقی یا تعیین وقت حضوری، از راه‌های زیر با ما در تماس باشید.
          </p>
          <div className="mt-4 w-24 h-1 bg-blue-600 dark:bg-amber-400 mx-auto rounded"></div>
        </div>
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Contact Info */}
          <div className="lg:w-1/2 bg-slate-50 dark:bg-slate-800 p-8 rounded-xl shadow-lg">
            <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6">اطلاعات تماس</h3>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <LocationIcon className="w-6 h-6 text-blue-600 dark:text-amber-400 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-slate-700 dark:text-slate-200">آدرس دفتر</h4>
                  <p className="text-slate-600 dark:text-slate-300">گنبد کاووس، خیابان دارایی، مجتمع بردی‌پور، واحد ۴</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <ClockIcon className="w-6 h-6 text-blue-600 dark:text-amber-400 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-slate-700 dark:text-slate-200">ساعت کاری</h4>
                  <p className="text-slate-600 dark:text-slate-300">شنبه تا چهارشنبه از ساعت ۱۷:۰۰ الی ۲۱:۰۰</p>
                  <p className="text-sm text-green-600 dark:text-green-400 mt-1">مشاوره از طریق واتساپ همیشه رایگان است.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <PhoneIcon className="w-6 h-6 text-blue-600 dark:text-amber-400 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-slate-700 dark:text-slate-200">تلفن تماس</h4>
                  <a href="tel:09113797376" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-amber-400 transition-colors" dir="ltr">0911 379 7376</a>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <WhatsAppIcon className="w-6 h-6 text-blue-600 dark:text-amber-400 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-slate-700 dark:text-slate-200">واتساپ</h4>
                   <a href="https://wa.me/989113797376" target="_blank" rel="noopener noreferrer" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-amber-400 transition-colors" dir="ltr">0911 379 7376</a>
                </div>
              </div>
               <div className="flex items-start gap-4">
                <InstagramIcon className="w-6 h-6 text-blue-600 dark:text-amber-400 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-slate-700 dark:text-slate-200">اینستاگرام</h4>
                   <a href="https://instagram.com/vakilbay" target="_blank" rel="noopener noreferrer" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-amber-400 transition-colors" dir="ltr">@vakilbay</a>
                </div>
              </div>
            </div>
            <div className="mt-8">
              <iframe
                src="https://maps.google.com/maps?q=37.25331174361873,55.165675084415156&t=&z=17&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="250"
                style={{ border: 0 }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="rounded-lg grayscale-[50%] hover:grayscale-0 dark:grayscale-[70%] dark:hover:grayscale-[50%] transition-all duration-300"
                title="موقعیت دفتر وکالت امیرحسین بای"
              ></iframe>
            </div>
          </div>
          {/* Contact Form */}
          <div className="lg:w-1/2 bg-slate-50 dark:bg-slate-800 p-8 rounded-xl shadow-lg">
             <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6">ارسال پیام</h4>
             <form action="https://formspree.io/f/your_form_id" method="POST" className="space-y-6">
                <div>
                    <label htmlFor="name" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">نام کامل</label>
                    <input type="text" id="name" name="name" required className="w-full px-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md text-slate-800 dark:text-slate-200 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-amber-500 dark:focus:border-amber-500 transition"/>
                </div>
                 <div>
                    <label htmlFor="phone" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">شماره تماس</label>
                    <input type="tel" id="phone" name="phone" required className="w-full px-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md text-slate-800 dark:text-slate-200 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-amber-500 dark:focus:border-amber-500 transition"/>
                </div>
                 <div>
                    <label htmlFor="message" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">پیام شما</label>
                    <textarea id="message" name="message" rows={5} required className="w-full px-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md text-slate-800 dark:text-slate-200 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-amber-500 dark:focus:border-amber-500 transition"></textarea>
                </div>
                <div>
                    <button type="submit" className="w-full px-8 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-amber-500 dark:hover:bg-amber-600 text-white font-bold rounded-lg shadow-lg transition-transform transform hover:scale-105">
                        ارسال
                    </button>
                    <p className="text-xs text-center mt-2 text-slate-500 dark:text-slate-400">برای اتصال فرم، action آن را در کد ویرایش کنید.</p>
                </div>
             </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;