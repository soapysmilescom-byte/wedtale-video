import React, { useState } from 'react';
import {
  X,
  Download,
  Calendar,
  Film,
  CalendarCheck,
  Share2,
  Copy,
  Check,
  Sparkles,
  Loader2,
  FileImage,
} from 'lucide-react';
import { CoupleData, SceneItem, AspectRatioType } from '../types';
import { downloadCalendarEvent, getGoogleCalendarUrl, formatRomanticDate } from '../utils/calendarExport';
import { VideoRenderer } from '../utils/videoRenderer';

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  couple: CoupleData;
  scenes: SceneItem[];
  aspectRatio: AspectRatioType;
  defaultTab?: 'date' | 'video';
}

export const DownloadModal: React.FC<DownloadModalProps> = ({
  isOpen,
  onClose,
  couple,
  scenes,
  aspectRatio,
  defaultTab = 'date',
}) => {
  const [activeTab, setActiveTab] = useState<'date' | 'video'>(defaultTab);
  const [isExportingVideo, setIsExportingVideo] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<number>(0);
  const [copiedInvite, setCopiedInvite] = useState<boolean>(false);
  const [downloadedCardUrl, setDownloadedCardUrl] = useState<string | null>(null);

  if (!isOpen) return null;

  const formattedDate = formatRomanticDate(couple.weddingDate);

  // Generate and download High-Res Save The Date Card Image
  const handleDownloadDateCard = () => {
    try {
      const offscreenCanvas = document.createElement('canvas');
      const renderer = new VideoRenderer(offscreenCanvas);
      const scene4 = scenes.find((s) => s.tag === 'scene4') || scenes[scenes.length - 1];
      renderer.preloadImages(scenes).then(() => {
        const dataUrl = renderer.exportInvitationCardDataUrl(couple, aspectRatio, scene4);
        setDownloadedCardUrl(dataUrl);

        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = `${couple.brideName}_and_${couple.groomName}_Save_The_Date_Card.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });
    } catch (e) {
      console.error('Failed to export date card image:', e);
    }
  };

  // Record and download Full Video
  const handleExportVideo = async () => {
    setIsExportingVideo(true);
    setExportProgress(0);

    try {
      const offscreenCanvas = document.createElement('canvas');
      const renderer = new VideoRenderer(offscreenCanvas);

      const videoBlob = await renderer.exportVideo(
        scenes,
        couple,
        aspectRatio,
        (pct) => setExportProgress(pct)
      );

      const videoUrl = URL.createObjectURL(videoBlob);
      const link = document.createElement('a');
      link.href = videoUrl;
      link.download = `${couple.brideName}_and_${couple.groomName}_Pixar_Wedding_Video.webm`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(videoUrl);
    } catch (e) {
      console.error('Failed to export video:', e);
      alert('Video export error. Please check browser media recording permissions.');
    } finally {
      setIsExportingVideo(false);
      setExportProgress(0);
    }
  };

  const handleCopyInviteText = () => {
    const text = `💍 WEDDING INVITATION 💍\n\n${couple.blessingHeader}\n\nYou are cordially invited to celebrate the marriage ceremony of\n${couple.brideName} & ${couple.groomName}\n\n🗓️ Date: ${formattedDate}\n⏰ Time: ${couple.weddingTime}\n📍 Venue: ${couple.venue}, ${couple.city}\n\n"From this day forward, you shall not walk alone."\n\nSave our date! ✨`;
    navigator.clipboard.writeText(text);
    setCopiedInvite(true);
    setTimeout(() => setCopiedInvite(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-purple-800/60 shadow-2xl p-6 text-white overflow-hidden">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-950/80 hover:bg-purple-950 text-slate-400 hover:text-white transition"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-5">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-amber-500 mb-2 shadow-lg shadow-purple-900/40">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-xl font-bold text-white font-cinzel">Download Center</h3>
          <p className="text-xs text-purple-300/80 mt-0.5">
            Download your wedding date card, calendar invite, and 3D Pixar video
          </p>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-2 p-1 rounded-xl bg-slate-950 border border-purple-900/50 mb-5">
          <button
            type="button"
            onClick={() => setActiveTab('date')}
            className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'date'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Download Date & Invites
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('video')}
            className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'video'
                ? 'bg-purple-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Film className="w-4 h-4" />
            Download 3D Video
          </button>
        </div>

        {/* Tab 1: Download Date & Invitations */}
        {activeTab === 'date' && (
          <div className="space-y-4">
            {/* Highlighted Date Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/70 via-slate-950 to-amber-950/60 border border-amber-500/40 text-center space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-widest text-amber-300">
                Auspicious Wedding Date
              </span>
              <div className="text-xl font-bold text-white font-cinzel tracking-wide">
                {formattedDate}
              </div>
              <div className="text-xs text-purple-200">
                {couple.weddingTime} • {couple.venue}, {couple.city}
              </div>
            </div>

            {/* Actions Grid */}
            <div className="space-y-2.5">
              {/* Download Save The Date Card Image */}
              <button
                type="button"
                onClick={handleDownloadDateCard}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-pink-600 hover:from-amber-400 hover:to-pink-500 text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-between shadow-lg shadow-amber-950/40 transition"
              >
                <div className="flex items-center gap-2.5">
                  <FileImage className="w-5 h-5 text-slate-950" />
                  <div className="text-left">
                    <div>Download Save The Date Card (PNG)</div>
                    <div className="text-[10px] text-slate-900 font-normal">
                      High-resolution printable & shareable invitation card
                    </div>
                  </div>
                </div>
                <Download className="w-4 h-4 text-slate-950" />
              </button>

              {/* Download Calendar (.ICS) */}
              <button
                type="button"
                onClick={() => downloadCalendarEvent(couple)}
                className="w-full py-3 px-4 rounded-xl bg-slate-950 hover:bg-purple-950/70 border border-purple-800/60 text-white font-semibold text-xs sm:text-sm flex items-center justify-between transition"
              >
                <div className="flex items-center gap-2.5">
                  <CalendarCheck className="w-5 h-5 text-purple-400" />
                  <div className="text-left">
                    <div>Download iCalendar Event (.ics)</div>
                    <div className="text-[10px] text-slate-400">
                      Syncs to Apple Calendar, Outlook, & Android
                    </div>
                  </div>
                </div>
                <Download className="w-4 h-4 text-purple-300" />
              </button>

              {/* Add to Google Calendar Web */}
              <a
                href={getGoogleCalendarUrl(couple)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 rounded-xl bg-slate-950 hover:bg-purple-950/70 border border-purple-800/60 text-white font-semibold text-xs sm:text-sm flex items-center justify-between transition"
              >
                <div className="flex items-center gap-2.5">
                  <Share2 className="w-5 h-5 text-amber-400" />
                  <div className="text-left">
                    <div>Add Directly to Google Calendar</div>
                    <div className="text-[10px] text-slate-400">
                      One-click event creation in browser
                    </div>
                  </div>
                </div>
                <span className="text-xs text-amber-300">Open ↗</span>
              </a>

              {/* Copy WhatsApp / Text Message */}
              <button
                type="button"
                onClick={handleCopyInviteText}
                className="w-full py-2.5 px-4 rounded-xl bg-purple-950/40 hover:bg-purple-950/80 border border-purple-900/50 text-purple-200 text-xs font-medium flex items-center justify-center gap-2 transition"
              >
                {copiedInvite ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-300">Invitation text copied to clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-purple-400" />
                    <span>Copy WhatsApp / Social Invite Message</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Download Video */}
        {activeTab === 'video' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-950 border border-purple-900/50 space-y-2 text-xs">
              <div className="flex items-center justify-between font-semibold text-purple-200">
                <span>Video Specs:</span>
                <span className="text-amber-300 font-mono">
                  {aspectRatio === '9:16' ? '720 x 1280 (Vertical Reel)' : '1280 x 720 (Cinema)'}
                </span>
              </div>
              <ul className="space-y-1 text-[11px] text-slate-400">
                <li>• 4 Story Scenes: Finally, Wait is Over, Official, & Getting Married</li>
                <li>• Synced with romantic wedding background music & chimes</li>
                <li>• Includes sparkling diamond ring proposal animation</li>
                <li>• Formatted for Instagram Reels, YouTube Shorts, & WhatsApp Status</li>
              </ul>
            </div>

            {/* Export Button or Progress Bar */}
            {isExportingVideo ? (
              <div className="p-4 rounded-2xl bg-purple-950/70 border border-purple-700/60 space-y-2 text-center">
                <div className="flex items-center justify-center gap-2 text-sm font-bold text-amber-300">
                  <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                  Recording Video & Mixing Audio... {exportProgress}%
                </div>
                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-purple-900">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-amber-400 h-full transition-all duration-150"
                    style={{ width: `${exportProgress}%` }}
                  />
                </div>
                <p className="text-[10px] text-purple-300">
                  Compositing 3D Pixar character frames and effects...
                </p>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleExportVideo}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:from-purple-500 hover:via-pink-500 hover:to-amber-400 text-white font-bold text-sm shadow-xl shadow-purple-900/40 flex items-center justify-center gap-2 transition active:scale-[0.99]"
              >
                <Film className="w-5 h-5" />
                Render & Download Video (WebM / MP4)
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
