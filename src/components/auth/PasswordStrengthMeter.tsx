/**
 * Password Strength Meter Component
 * 
 * Visual indicator for password strength with detailed requirements
 */

import React from 'react';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PasswordStrengthMeterProps {
  password: string;
  className?: string;
}

interface PasswordRequirement {
  label: string;
  test: (password: string) => boolean;
}

const requirements: PasswordRequirement[] = [
  {
    label: 'At least 12 characters',
    test: (password) => password.length >= 12
  },
  {
    label: 'Contains a number',
    test: (password) => /[0-9]/.test(password)
  },
  {
    label: 'Contains a special character',
    test: (password) => /[^a-zA-Z0-9]/.test(password)
  },
  {
    label: 'Contains uppercase letter',
    test: (password) => /[A-Z]/.test(password)
  },
  {
    label: 'Contains lowercase letter',
    test: (password) => /[a-z]/.test(password)
  }
];

export const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({ 
  password, 
  className 
}) => {
  const metRequirements = requirements.filter(req => req.test(password));
  const strength = metRequirements.length;
  const strengthPercentage = (strength / requirements.length) * 100;

  const getStrengthColor = () => {
    if (strength <= 2) return 'bg-destructive';
    if (strength <= 3) return 'bg-amber-500';
    if (strength <= 4) return 'bg-blue-500';
    return 'bg-success';
  };

  const getStrengthLabel = () => {
    if (strength <= 2) return 'Weak';
    if (strength <= 3) return 'Fair';
    if (strength <= 4) return 'Good';
    return 'Strong';
  };

  if (!password) return null;

  return (
    <div className={cn('space-y-3', className)}>
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Password Strength</span>
          <span className={cn(
            'font-medium',
            strength <= 2 && 'text-destructive',
            strength === 3 && 'text-amber-500',
            strength === 4 && 'text-blue-500',
            strength === 5 && 'text-success'
          )}>
            {getStrengthLabel()}
          </span>
        </div>
        
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className={cn(
              'h-2 rounded-full transition-all duration-300',
              getStrengthColor()
            )}
            style={{ width: `${strengthPercentage}%` }}
          />
        </div>
      </div>

      {/* Requirements Checklist */}
      <div className="space-y-1">
        <p className="text-sm font-medium text-muted-foreground">Requirements:</p>
        {requirements.map((requirement, index) => {
          const isMet = requirement.test(password);
          return (
            <div 
              key={index}
              className="flex items-center gap-2 text-sm"
            >
              {isMet ? (
                <Check className="h-4 w-4 text-success" />
              ) : (
                <X className="h-4 w-4 text-muted-foreground" />
              )}
              <span className={cn(
                'transition-colors',
                isMet ? 'text-success' : 'text-muted-foreground'
              )}>
                {requirement.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};