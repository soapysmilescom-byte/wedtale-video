import React, { useMemo } from 'react';
import { Calendar, Clock, MapPin, Heart, Users, Sparkles, Download, CalendarCheck, Share2 } from 'lucide-react';
import { CoupleData } from '../types';
import { formatRomanticDate, downloadCalendarEvent, getGoogleCalendarUrl } from '../utils/calendarExport';

interface DateAndDetailsFormProps {
  couple: CoupleData;
  onChange: (updated: Partial<CoupleData>) => void;
  onOpenDownloadModal: () => void;
}

export const DateAndDetailsForm: React.FC<DateAndDetailsFormProps> = ({
  couple,
  onChange,
  onOpenDownloadModal,
}) => {
  // Calculate countdown
  const countdown = useMemo(() => {
    if (!couple.weddingDate) return null;
    const target = new Date(`${couple.weddingDate}T17:00:00`).getTime();
    const now = Date.now();
    const diff = target - now;
    if (diff <= 0) return { days: 0, hours: 0, passed: true };
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return { days, hours, passed: false };
  }, [couple.weddingDate]);

  return (
    <div className="bg-slate-900/90 backdrop-blur-md rounded-2xl border border-purple-900/40 p-5 shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-amber-400" />
            2. Wedding Date & Celebration Details
          </h2>
          <p className="text-xs text-purple-300/80">
            Set the special date, couple names, and venue displayed in Scene 4
          </p>
        </div>
      </div>

      {/* Live Countdown Banner */}
      {countdown && (
        <div className="p-3 rounded-xl bg-gradient-to-r from-amber-500/20 via-purple-500/20 to-pink-500/20 border border-amber-500/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
            <div>
              <span className="text-xs font-bold text-amber-200">
                {countdown.passed ? "The Big Day Has Arrived! 🎉" : "Countdown to Forever:"}
              </span>
              {!countdown.passed && (
                <div className="text-sm font-extrabold text-white">
                  {countdown.days} Days & {countdown.hours} Hours Left
                </div>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => downloadCalendarEvent(couple)}
            className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow transition"
            title="Download iCalendar file"
          >
            <Download className="w-3.5 h-3.5" />
            Save Date (.ics)
          </button>
        </div>
      )}

      {/* Date & Time Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-purple-200 mb-1.5 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            Wedding Date (Input Date)
          </label>
          <input
            type="date"
            value={couple.weddingDate}
            onChange={(e) => onChange({ weddingDate: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-purple-800/60 focus:border-amber-400 text-white text-sm outline-none transition"
          />
          <span className="text-[11px] text-amber-300/80 font-serif mt-1 block">
            {formatRomanticDate(couple.weddingDate)}
          </span>
        </div>

        <div>
          <label className="block text-xs font-semibold text-purple-200 mb-1.5 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-purple-400" />
            Ceremony Time
          </label>
          <input
            type="text"
            value={couple.weddingTime}
            onChange={(e) => onChange({ weddingTime: e.target.value })}
            placeholder="e.g. 5:00 PM onwards"
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-purple-800/60 focus:border-amber-400 text-white text-sm outline-none transition"
          />
          <span className="text-[11px] text-slate-400 mt-1 block">
            Appears on the wedding card
          </span>
        </div>
      </div>

      {/* Couple Names */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-pink-300 mb-1.5">
            👰 Bride's Name
          </label>
          <input
            type="text"
            value={couple.brideName}
            onChange={(e) => onChange({ brideName: e.target.value })}
            placeholder="Bride Name"
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-pink-800/50 focus:border-pink-400 text-white text-sm outline-none transition"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-indigo-300 mb-1.5">
            🤵 Groom's Name
          </label>
          <input
            type="text"
            value={couple.groomName}
            onChange={(e) => onChange({ groomName: e.target.value })}
            placeholder="Groom Name"
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-indigo-800/50 focus:border-indigo-400 text-white text-sm outline-none transition"
          />
        </div>
      </div>

      {/* Parents Names (for Traditional/Royal Card) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-purple-200 mb-1.5">
            Bride's Parents (D/o)
          </label>
          <input
            type="text"
            value={couple.parentsBride}
            onChange={(e) => onChange({ parentsBride: e.target.value })}
            placeholder="e.g. Anshal Mehta & Reema Mehta"
            className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-purple-800/40 text-white text-xs outline-none focus:border-purple-400 transition"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-purple-200 mb-1.5">
            Groom's Parents (S/o)
          </label>
          <input
            type="text"
            value={couple.parentsGroom}
            onChange={(e) => onChange({ parentsGroom: e.target.value })}
            placeholder="e.g. Rajesh Gupta & Kiran Gupta"
            className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-purple-800/40 text-white text-xs outline-none focus:border-purple-400 transition"
          />
        </div>
      </div>

      {/* Venue & City */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-purple-200 mb-1.5 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-rose-400" />
            Venue / Hotel
          </label>
          <input
            type="text"
            value={couple.venue}
            onChange={(e) => onChange({ venue: e.target.value })}
            placeholder="e.g. Hotel Ashriya International"
            className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-purple-800/40 text-white text-xs outline-none focus:border-purple-400 transition"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-purple-200 mb-1.5">
            City / Location
          </label>
          <input
            type="text"
            value={couple.city}
            onChange={(e) => onChange({ city: e.target.value })}
            placeholder="e.g. Delhi"
            className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-purple-800/40 text-white text-xs outline-none focus:border-purple-400 transition"
          />
        </div>
      </div>

      {/* Blessing & Ceremony Header */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        <div>
          <label className="block text-xs font-semibold text-purple-200 mb-1.5">
            Blessing / Card Header
          </label>
          <input
            type="text"
            value={couple.blessingHeader}
            onChange={(e) => onChange({ blessingHeader: e.target.value })}
            placeholder="e.g. || Shree Ganeshay Namah ||"
            className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-purple-800/40 text-white text-xs outline-none focus:border-purple-400 transition"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-purple-200 mb-1.5">
            Ceremony Type
          </label>
          <select
            value={couple.ceremonyType}
            onChange={(e) => onChange({ ceremonyType: e.target.value })}
            className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-purple-800/40 text-white text-xs outline-none focus:border-purple-400 transition"
          >
            <option value="Wedding Ceremony">Wedding Ceremony</option>
            <option value="Engagement Ceremony">Engagement Ceremony</option>
            <option value="Ring Ceremony & Sangeet">Ring Ceremony & Sangeet</option>
            <option value="Save The Date">Save The Date Announcement</option>
            <option value="Reception Celebration">Reception Celebration</option>
          </select>
        </div>
      </div>

      {/* Direct Calendar & Date Download Actions */}
      <div className="pt-2 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => downloadCalendarEvent(couple)}
          className="flex-1 py-2 px-3 rounded-xl bg-purple-950 hover:bg-purple-900 border border-purple-700/60 text-purple-200 font-semibold text-xs transition flex items-center justify-center gap-1.5"
        >
          <CalendarCheck className="w-4 h-4 text-purple-400" />
          Download .ICS Calendar Event
        </button>

        <a
          href={getGoogleCalendarUrl(couple)}
          target="_blank"
          rel="noopener noreferrer"
          className="py-2 px-3 rounded-xl bg-purple-950 hover:bg-purple-900 border border-purple-700/60 text-purple-200 font-semibold text-xs transition flex items-center justify-center gap-1.5"
        >
          <Share2 className="w-4 h-4 text-amber-400" />
          Add to Google Calendar
        </a>
      </div>
    </div>
  );
};
