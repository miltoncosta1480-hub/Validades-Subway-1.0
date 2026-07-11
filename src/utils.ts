import { ValidityItem } from './data';

export type LabelType = 'closed' | 'open' | 'frontline';

export function calculateExpiration(
  item: ValidityItem,
  type: LabelType,
  startDate: Date
): {
  expirationDate: Date | null;
  durationText: string;
  isCustom: boolean;
} {
  const date = new Date(startDate.getTime());
  let durationText = '';
  let isCustom = false;

  const rawText =
    type === 'closed'
      ? item.closedValidity
      : type === 'open'
      ? item.openValidity
      : item.frontlineValidity;

  if (!rawText || rawText === '-') {
    return { expirationDate: null, durationText: 'Não se aplica', isCustom: false };
  }

  durationText = rawText;

  if (rawText.toLowerCase().includes('embalagem')) {
    return { expirationDate: null, durationText: 'Conforme embalagem original', isCustom: true };
  }

  // Parse days
  const dayMatch = rawText.match(/^(\d+)\s*dia(s)?$/i);
  if (dayMatch) {
    const days = parseInt(dayMatch[1], 10);
    date.setDate(date.getDate() + days);
    return { expirationDate: date, durationText, isCustom: false };
  }

  // Parse hours
  const hourMatch = rawText.match(/^(\d+)\s*h(oras)?$/i);
  if (hourMatch) {
    const hours = parseInt(hourMatch[1], 10);
    date.setHours(date.getHours() + hours);
    return { expirationDate: date, durationText, isCustom: false };
  }

  // Parse months
  const monthMatch = rawText.match(/^(\d+)\s*mes(es)?$/i);
  if (monthMatch) {
    const months = parseInt(monthMatch[1], 10);
    date.setMonth(date.getMonth() + months);
    return { expirationDate: date, durationText, isCustom: false };
  }

  // Catch other forms
  return { expirationDate: null, durationText: rawText, isCustom: true };
}

export function formatDateToBr(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} às ${hours}:${minutes}`;
}

export function formatDateShort(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${day}/${month} - ${hours}:${minutes}h`;
}
