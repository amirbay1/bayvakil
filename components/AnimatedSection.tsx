import React, { useEffect, useRef, useState, forwardRef } from 'react';

interface Props {
  children: React.ReactNode;
  className?: string;
}

const AnimatedSection = forwardRef<HTMLDivElement, Props>(({ children, className }, ref) => {
  const [isVisible, setIsVisible] = useState(false);
  const internalRef = useRef<HTMLDivElement>(null);
  const targetRef = ref || internalRef;


  useEffect(() => {
    const currentRef = (targetRef as React.RefObject<HTMLDivElement>)?.current;
    if (!currentRef) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      {
        root: null,
        rootMargin: '0px',
        threshold: 0.1,
      }
    );

    observer.observe(currentRef);

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [targetRef]);

  return (
    <div
      ref={targetRef}
      className={`${className} transition-all duration-1000 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      {children}
    </div>
  );
});

export default AnimatedSection;
