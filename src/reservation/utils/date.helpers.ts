


import { parseISO, startOfDay } from 'date-fns';


export function stringToDateOnly(dateStr: string): Date {
  return startOfDay(parseISO(dateStr));
}


export function stringToTimeOnlyAsString(timeStr?: string): string {
  if (!timeStr) return '00:00:00';

  if (/^\d{2}:\d{2}$/.test(timeStr)) return `${timeStr}:00`;


  if (/^\d{2}:\d{2}:\d{2}$/.test(timeStr)) return timeStr;


  const d = new Date(timeStr);
  if (isNaN(d.getTime())) {
    throw new Error(`Invalid time format: ${timeStr}`);
  }
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  const ss = String(d.getSeconds()).padStart(2, '0');
  return `${hh}:${mm}:${ss}`;
}

