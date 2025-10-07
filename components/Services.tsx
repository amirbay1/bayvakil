import React from 'react';
import { FamilyIcon, ContractIcon, CriminalIcon, PropertyIcon, AdminIcon, ConsultIcon } from './Icons';
import type { Service } from '../types';


const services: Service[] = [
  {
    icon: <FamilyIcon className="w-12 h-12 text-blue-600 dark:text-amber-400" />,
    title: 'دعاوی خانواده',
    description: 'طلاق، مهریه، نفقه، حضانت، استرداد جهییزیه و سایر اختلافات خانوادگی.',
    highlight: true,
  },
  {
    icon: <ContractIcon className="w-12 h-12 text-blue-600 dark:text-amber-400" />,
    title: 'دعاوی حقوقی',
    description: 'تنظیم و بررسی قراردادها، مطالبه وجه، چک، سفته، الزام به تنظیم سند.',
    highlight: true,
  },
  {
    icon: <CriminalIcon className="w-12 h-12 text-blue-600 dark:text-amber-400" />,
    title: 'دعاوی کیفری',
    description: 'کلاهبرداری، سرقت، خیانت در امانت، ضرب و جرح، توهین و افترا.',
    highlight: false,
  },
  {
    icon: <PropertyIcon className="w-12 h-12 text-blue-600 dark:text-amber-400" />,
    title: 'دعاوی ملکی',
    description: 'تخلیه ید، خلع ید، تصرف عدوانی، تقسیم و افراز املاک مشاع.',
    highlight: false,
  },
  {
    icon: <AdminIcon className="w-12 h-12 text-blue-600 dark:text-amber-400" />,
    title: 'دعاوی ثبتی و اداری',
    description: 'امور مربوط به ثبت اسناد و املاک، دعاوی علیه ادارات و نهادهای دولتی.',
    highlight: false,
  },
  {
    icon: <ConsultIcon className="w-12 h-12 text-blue-600 dark:text-amber-400" />,
    title: 'مشاوره حقوقی',
    description: 'ارائه مشاوره تخصصی حضوری و غیرحضوری در کلیه زمینه‌های حقوقی.',
    highlight: false,
  },
];

const ServiceCard: React.FC<Service> = ({ icon, title, description, highlight }) => (
  <div
    className={`bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg hover:shadow-2xl dark:shadow-black/20 dark:hover:shadow-lg dark:hover:shadow-black/30 transition-all duration-300 transform hover:-translate-y-2 border-t-4 ${
      highlight ? 'border-blue-600 dark:border-amber-400' : 'border-slate-300 dark:border-slate-600'
    }`}
  >
    <div className="mb-4">{icon}</div>
    <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-3">{title}</h3>
    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{description}</p>
  </div>
);

const Services: React.FC = () => {
  return (
    <section className="py-20 bg-slate-50 dark:bg-slate-900">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white">حوزه‌های فعالیت</h2>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
            ارائه خدمات حقوقی جامع و تخصصی در زمینه‌های گوناگون
          </p>
          <div className="mt-4 w-24 h-1 bg-blue-600 dark:bg-amber-400 mx-auto rounded"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => (
            <ServiceCard key={service.title} {...service} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;