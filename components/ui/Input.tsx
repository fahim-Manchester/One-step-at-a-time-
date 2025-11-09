
import React from 'react';

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
    as?: 'input';
    label: string;
    icon?: React.ReactNode;
};
  
type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
    as: 'textarea';
    label: string;
    icon?: React.ReactNode;
};

const Input: React.FC<InputProps | TextareaProps> = ({ label, id, icon, ...props }) => {
  const baseClasses = `w-full bg-slate-700/50 border border-slate-600 rounded-md py-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition duration-200`;
  const withIconClasses = icon ? 'pl-10' : 'px-4';
    
  return (
    <div className="w-full">
      <label htmlFor={id} className="block text-sm font-medium text-slate-400 mb-2">
        {label}
      </label>
      <div className="relative">
        {icon && (
            <div className="absolute top-3.5 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                {icon}
            </div>
        )}
        {props.as === 'textarea' ? (
            <textarea
                id={id}
                className={`${baseClasses} ${withIconClasses} min-h-[100px]`}
                {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
            />
        ) : (
            <input
                id={id}
                className={`${baseClasses} ${withIconClasses}`}
                {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
            />
        )}
      </div>
    </div>
  );
};

export default Input;
