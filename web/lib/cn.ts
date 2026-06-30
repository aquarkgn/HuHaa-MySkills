import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * 合并 Tailwind CSS 类名
 * 处理 Tailwind 类名冲突，确保后面的类名优先级更高
 * 
 * @example
 * cn('px-2 py-1', 'px-3') // => 'py-1 px-3'
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
