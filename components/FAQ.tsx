import React, { useState } from 'react';
import { FAQItem } from '../types';

const faqData: FAQItem[] = [
  {
    question: 'چگونه می‌توانم مشاوره حقوقی دریافت کنم؟',
    answer: 'شما می‌توانید از طریق تماس با شماره 09113797376 یا ارسال پیام در واتساپ، سوالات خود را مطرح نمایید. مشاوره اولیه از طریق واتساپ همیشه رایگان است. برای مشاوره حضوری، لطفاً در ساعات کاری تماس گرفته و وقت قبلی رزرو کنید.',
  },
  {
    question: 'ساعت کاری دفتر شما به چه صورت است؟',
    answer: 'دفتر وکالت از روز شنبه تا چهارشنبه، از ساعت ۱۷:۰۰ الی ۲۱:۰۰ برای مراجعه حضوری (با هماهنگی قبلی) باز است. در خارج از این ساعات، می‌توانید از طریق واتساپ پیام خود را ارسال فرمایید.',
  },
    {
    question: 'آدرس دقیق دفتر وکالت کجاست؟',
    answer: 'دفتر ما در استان گلستان، شهر گنبد کاووس، خیابان دارایی، مجتمع بردی‌پور، واحد ۴ واقع شده است. شما می‌توانید موقعیت دقیق دفتر را بر روی نقشه در بخش «تماس با ما» مشاهده کنید.',
  },
  {
    question: 'آیا قبول پرونده به صورت تضمینی انجام می‌دهید؟',
    answer: 'خیر. دادن هرگونه تضمین در خصوص نتیجه پرونده از سوی وکیل، خلاف مقررات و سوگند وکالت است. اما ما به شما اطمینان می‌دهیم که با استفاده از تمام دانش و تجربه خود، تمام تلاشمان را برای دستیابی به بهترین نتیجه ممکن و دفاع از حقوق شما به کار خواهیم گرفت.',
  },
  {
    question: 'هزینه‌های وکالت چگونه محاسبه می‌شود؟',
    answer: 'حق‌الوکاله بر اساس تعرفه مصوب کانون وکلای دادگستری و با توجه به پیچیدگی، نوع پرونده و میزان کار مورد نیاز تعیین می‌شود. در جلسه مشاوره اولیه، کلیه جزئیات مالی به صورت شفاف به شما توضیح داده خواهد شد.',
  }
];

const FAQItemComponent: React.FC<{ item: FAQItem; isOpen: boolean; onClick: () => void }> = ({ item, isOpen, onClick }) => {
  return (
    <div className="border-b border-slate-200 dark:border-slate-700">
      <h3>
        <button
          onClick={onClick}
          className="flex justify-between items-center w-full py-5 text-right font-semibold text-slate-800 dark:text-slate-100"
          aria-expanded={isOpen}
        >
          <span>{item.question}</span>
          <svg className={`w-4 h-4 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </button>
      </h3>
      <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-screen' : 'max-h-0'}`}>
        <div className="pb-5 pr-4">
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{item.answer}</p>
        </div>
      </div>
    </div>
  );
};


const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const handleClick = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="bg-slate-50 dark:bg-slate-900 py-20">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white">سوالات متداول</h2>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
            پاسخ به برخی از پرسش‌های رایج حقوقی شما
          </p>
          <div className="mt-4 w-24 h-1 bg-blue-600 dark:bg-amber-400 mx-auto rounded"></div>
        </div>
        <div className="max-w-3xl mx-auto bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg">
          {faqData.map((item, index) => (
            <FAQItemComponent
              key={index}
              item={item}
              isOpen={openIndex === index}
              onClick={() => handleClick(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;