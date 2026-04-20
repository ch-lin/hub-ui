import React, { useState, useEffect, type ReactNode } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff } from 'lucide-react';

interface FieldProps {
  label: string;
  children: ReactNode;
  colSpan?: number;
}

export const Field = ({ label, children, colSpan = 1 }: FieldProps) => (
  <div className={`flex flex-col gap-1.5 ${colSpan === 2 ? 'md:col-span-2' : ''}`}>
    <Label className="text-sm font-semibold text-foreground">{label}</Label>
    {children}
  </div>
);

interface CheckboxFieldProps {
  label: string;
  children: ReactNode;
}

export const CheckboxField = ({ label, children }: CheckboxFieldProps) => (
  <div className="flex items-center gap-2 pt-6">
    {children}
    <Label className="text-sm font-medium text-foreground cursor-pointer">{label}</Label>
  </div>
);

export const SecretInput = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    const [show, setShow] = useState(false);

    return (
      <div className="relative">
        <Input 
          type={show ? "text" : "password"} 
          {...props} 
          ref={ref}
          className={`pr-10 ${className || ''}`} 
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute inset-y-0 right-0 px-3 flex items-center text-muted-foreground hover:text-foreground"
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    );
  }
);
SecretInput.displayName = 'SecretInput';
