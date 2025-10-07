import React, { useState, useEffect } from 'react';
import { GavelIcon } from './Icons';

const LegalOpinion: React.FC = () => {
  const [opinion, setOpinion] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOpinions = async () => {
      try {
        const response = await fetch('/opinions.xml');
        if (!response.ok) {
          throw new Error(`خطا در بارگذاری: ${response.statusText}`);
        }
        const xmlText = await response.text();
        
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, "application/xml");
        
        const opinionNodes = xmlDoc.getElementsByTagName('opinion');
        if (opinionNodes.length === 0) {
            throw new Error('هیچ نظریه‌ای در فایل XML یافت نشد.');
        }

        const opinions = Array.from(opinionNodes).map(node => node.textContent || '');
        const randomIndex = Math.floor(Math.random() * opinions.length);
        setOpinion(opinions[randomIndex]);

      } catch (err) {
        console.error("Error fetching or parsing XML:", err);
        setError('امکان بارگذاری نظریه حقوقی وجود ندارد. لطفاً بعداً تلاش کنید.');
        setOpinion("در حال حاضر امکان نمایش نظریه حقوقی وجود ندارد.");
      } finally {
        setLoading(false);
      }
    };

    fetchOpinions();
  }, []);

  return (
    <section className="bg-slate-50 dark:bg-slate-800 py-20">
      <div className="container mx-auto px-6 text-center">
        <div className="inline-block bg-white dark:bg-slate-700 p-4 rounded-full shadow-md mb-6">
          <GavelIcon className="w-10 h-10 text-blue-600 dark:text-amber-400" />
        </div>
        <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white">نظریه حقوقی روز</h2>
        <div className="mt-4 w-24 h-1 bg-blue-600 dark:bg-amber-400 mx-auto rounded"></div>
        <div className="max-w-3xl mx-auto min-h-[150px] flex items-center justify-center">
          {loading ? (
             <p className="text-lg text-slate-500 dark:text-slate-400">در حال بارگذاری...</p>
          ) : (
            <p className={`text-lg text-slate-600 dark:text-slate-300 leading-loose italic transition-opacity duration-500 ${error ? 'text-red-500' : ''}`}>
              "{opinion}"
            </p>
          )}
        </div>
      </div>
    </section>
  );
};

export default LegalOpinion;