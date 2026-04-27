/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { ReactNode } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { cn } from '../../lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  className?: string;
  children?: React.ReactNode;
}

export function Button({ 
  variant = 'primary', 
  size = 'md', 
  className, 
  children, 
  ...props 
}: ButtonProps) {
  const variants = {
    primary: 'bg-brand-dark text-white hover:bg-black shadow-sm transition-all',
    secondary: 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition-all',
    outline: 'border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all',
    ghost: 'text-slate-600 hover:bg-slate-100 transition-all',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs font-bold',
    md: 'px-4 py-2 text-sm font-bold',
    lg: 'px-6 py-3 text-base font-bold',
    icon: 'p-2',
  };

  return (
    <button 
      {...props}
      className={cn(
        'inline-flex items-center justify-center rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </button>
  );
}

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-slate-400',
        className
      )}
      {...props}
    />
  );
}

export function Label({ children, className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label 
      className={cn('block text-[11px] font-bold text-slate-500 uppercase tracking-tight mb-1', className)}
      {...props}
    >
      {children}
    </label>
  );
}
