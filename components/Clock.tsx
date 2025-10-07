import React, { useState, useEffect } from 'react';

const Clock: React.FC = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timerId = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timerId);
  }, []);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fa-IR-u-nu-latn', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('fa-IR-u-nu-latn', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  return (
    <div className="text-xs text-center text-slate-500 dark:text-slate-400 w-40">
      <div>{formatDate(time)}</div>
      <div className="font-mono tracking-wider" dir="ltr">{formatTime(time)}</div>
    </div>
  );
};

export default Clock;