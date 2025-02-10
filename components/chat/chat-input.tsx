'use client'

import { forwardRef } from 'react'
import { Input } from '@/components/ui/input'
import type { InputProps } from '@/components/ui/input'

interface ChatInputProps extends Omit<InputProps, 'onChange'> {
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void
}

export const ChatInput = forwardRef<HTMLInputElement, ChatInputProps>(
  ({ value, onChange, onKeyDown, ...props }, ref) => {
    return (
      <Input
        ref={ref}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        {...props}
      />
    );
  }
);

ChatInput.displayName = 'ChatInput';