import { CoupleData } from '../types';

/**
 * Generates and triggers download of an .ics iCalendar file for the wedding date
 */
export function downloadCalendarEvent(couple: CoupleData) {
  // Parse date
  const dateStr = couple.weddingDate || '2026-06-22';
  const cleanDate = dateStr.replace(/-/g, '');
  
  // Create start time and end time (default to 5 PM - 11 PM if not specified)
  const dtStart = `${cleanDate}T170000`;
  const dtEnd = `${cleanDate}T230000`;
  const nowStr = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  const summary = `${couple.ceremonyType || 'Wedding'}: ${couple.brideName} & ${couple.groomName}`;
  const description = `${couple.blessingHeader || 'Save the Date!'}\\n\\nWe are excited to celebrate our special day with you!\\n\\nCouple: ${couple.brideName} & ${couple.groomName}\\nDate: ${couple.weddingDate}\\nTime: ${couple.weddingTime}\\nVenue: ${couple.venue}, ${couple.city}\\n\\n${couple.coupleQuote || 'Two hearts, one love.'}`;
  const location = `${couple.venue}, ${couple.city}`;

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Pixar Wedding Video Studio//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:wedding-${Date.now()}@pixarweddingstudio.com`,
    `DTSTAMP:${nowStr}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${location}`,
    'STATUS:CONFIRMED',
    'BEGIN:VALARM',
    'TRIGGER:-P1D',
    'ACTION:DISPLAY',
    `DESCRIPTION:Reminder: ${summary} tomorrow!`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${couple.brideName}_and_${couple.groomName}_Wedding_Date.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generates Google Calendar web link
 */
export function getGoogleCalendarUrl(couple: CoupleData): string {
  const dateStr = couple.weddingDate || '2026-06-22';
  const cleanDate = dateStr.replace(/-/g, '');
  const dates = `${cleanDate}T170000/${cleanDate}T230000`;
  const title = encodeURIComponent(`${couple.ceremonyType || 'Wedding'}: ${couple.brideName} & ${couple.groomName}`);
  const details = encodeURIComponent(`You are cordially invited to celebrate the union of ${couple.brideName} and ${couple.groomName}.\n\nVenue: ${couple.venue}, ${couple.city}\nTime: ${couple.weddingTime}`);
  const location = encodeURIComponent(`${couple.venue}, ${couple.city}`);

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${location}`;
}

/**
 * Formats a date string into human readable romantic wedding date
 * e.g. "2026-06-22" -> "Monday, 22 June 2026" or "22nd of June, 2026"
 */
export function formatRomanticDate(dateStr: string): string {
  if (!dateStr) return '22 June 2026';
  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return `${dayNames[date.getDay()]}, ${day} ${monthNames[date.getMonth()]} ${year}`;
  } catch (e) {
    return dateStr;
  }
}
