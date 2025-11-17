import clsx, { type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import QRCode from 'qrcode';
import { format, formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

/**
 * Merge Tailwind class names safely using clsx and tailwind-merge.
 * Always prefer this helper over manual string concatenation.
 */
export const cn = (...inputs: ClassValue[]): string => {
  return twMerge(clsx(...inputs));
};

/**
 * Format a date in French locale.
 * Returns format: "22 décembre 2025"
 * 
 * @param date - Date string, Date object, or timestamp
 * @returns Formatted date string in French
 */
export function formatDate(date: string | Date): string {
  const dateObj = date instanceof Date ? date : new Date(date);

  if (Number.isNaN(dateObj.getTime())) {
    throw new Error('Invalid date value provided to formatDate');
  }

  return format(dateObj, 'd MMMM yyyy', { locale: fr });
}

/**
 * Format a date and time in French locale.
 * Returns format: "22 déc 2025 à 14:30"
 * 
 * @param date - Date string, Date object, or timestamp
 * @returns Formatted date and time string in French
 */
export function formatDateTime(date: string | Date): string {
  const dateObj = date instanceof Date ? date : new Date(date);

  if (Number.isNaN(dateObj.getTime())) {
    throw new Error('Invalid date value provided to formatDateTime');
  }

  return format(dateObj, "d MMM yyyy 'à' HH:mm", { locale: fr });
}

/**
 * Format relative time in French locale.
 * Returns format: "il y a 2 heures" or "il y a 3 jours"
 * 
 * @param date - Date string, Date object, or timestamp
 * @returns Relative time string in French
 */
export function formatRelativeTime(date: string | Date): string {
  const dateObj = date instanceof Date ? date : new Date(date);

  if (Number.isNaN(dateObj.getTime())) {
    throw new Error('Invalid date value provided to formatRelativeTime');
  }

  return formatDistanceToNow(dateObj, { addSuffix: true, locale: fr });
}

/**
 * Format a numeric value as Euro currency for French locale consumers.
 */
export const formatCurrency = (
  amount: number,
  options: Intl.NumberFormatOptions = { style: 'currency', currency: 'EUR', minimumFractionDigits: 2 }
): string => {
  if (typeof amount !== 'number' || Number.isNaN(amount)) {
    throw new Error('Invalid amount provided to formatCurrency');
  }

  return new Intl.NumberFormat('fr-FR', options).format(amount);
};

/**
 * Basic email validation helper. Trim input to avoid whitespace issues.
 */
export const validateEmail = (value: string): boolean => {
  if (typeof value !== 'string') {
    return false;
  }

  const email = value.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return emailRegex.test(email);
};

/**
 * Truncate text while preserving word boundaries when possible.
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (typeof text !== 'string') {
    throw new Error('Invalid text provided to truncateText');
  }

  if (!Number.isInteger(maxLength) || maxLength <= 0) {
    throw new Error('Invalid maxLength provided to truncateText');
  }

  if (text.length <= maxLength) {
    return text;
  }

  const truncated = text.slice(0, maxLength - 3).trimEnd();
  return `${truncated}...`;
};

/**
 * Generate QR code as data URL for use in img src.
 * 
 * @param url - The URL or text to encode in the QR code
 * @returns Promise resolving to data URL string
 * @throws Error if QR code generation fails
 */
export async function generateQRCode(url: string): Promise<string> {
  if (!url || typeof url !== 'string') {
    throw new Error('URL is required and must be a string');
  }

  try {
    const dataUrl = await QRCode.toDataURL(url, {
      width: 200,
      margin: 1,
      color: {
        dark: '#000000', // Black
        light: '#FFFFFF', // White
      },
    });

    return dataUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error(
      `Failed to generate QR code: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}
