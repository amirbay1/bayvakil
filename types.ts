import React from 'react';

export interface Service {
  icon: React.ReactNode;
  title: string;
  description: string;
  highlight: boolean;
}

export interface FAQItem {
  question: string;
  answer: string;
}
