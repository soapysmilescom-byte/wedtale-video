import React, { useState, useEffect, useRef } from 'react';
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
  Smartphone,
  Laptop,
  RotateCcw,
  CheckCircle2,
  Info,
  Play,
  Volume2,
} from 'lucide-react';
import { CoupleData, SceneItem, AspectRatioType, VideoQuality, ExportedVideoData } from '../types';
import { downloadCalendarEvent, getGoogleCalendarUrl, formatRomanticDate } from '../utils/calendarExport';
import { VideoRenderer, detectBestVideoMimeType } from '../utils/videoRenderer';

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
  const [selectedQuality, setSelectedQuality] = useState<VideoQuality>('1080p');
  const [isExportingVideo, setIsExportingVideo] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<number>(0);
  const [exportStatusText, setExportStatusText] = useState<string>('');
  const [exportedVideo, setExportedVideo] = useState<ExportedVideoData | null>(null);
  const [copiedInvite, setCopiedInvite] = useState<boolean>(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [isSharingToPhone, setIsSharingToPhone] = useState<boolean>(false);
  const [cardQuality, setCardQuality] = useState<VideoQuality>('1080p');
  const [isExportingCard, setIsExportingCard] = useState<boolean>(false);

  const videoPreviewRef = useRef<HTMLVideoElement | null>(null);

  // Synchronize default tab on open
  useEffect(() => {
    if (isOpen) {
      setActiveTab(defaultTab);
      setSaveSuccessMsg(null);
    }
  }, [isOpen, defaultTab]);

  if (!isOpen) return null;

  const formattedDate = formatRomanticDate(couple.weddingDate);
  const mimeInfo = detectBestVideoMimeType();

  // Resolution specs label helper
  const getResolutionSpecs = (quality: VideoQuality) => {
    if (aspectRatio === '9:16') {
      if (quality === '4k') return { label: '2160 × 3840 (4K Cinema Vertical)', badge: '4K Ultra HD', desc: 'Maximum crispness for TV & Projectors' };
      if (quality === '1080p') return { label: '1080 × 1920 (Full HD Reel)', badge: '1080p Full HD', desc: 'Standard for iPhone/Android Gallery & Instagram Reels' };
      return { label: '720 × 1280 (Standard HD)', badge: '720p HD', desc: 'Smaller file size, fast render' };
    } else {
      if (quality === '4k') return { label: '3840 × 2160 (4K Cinema Widescreen)', badge: '4K Ultra HD', desc: 'Maximum crispness for Big Screen TV' };
      if (quality === '1080p') return { label: '1920 × 1080 (Full HD Cinema)', badge: '1080p Full HD', desc: 'Standard for Laptops, YouTube & TV Displays' };
      return { label: '1280 × 720 (Standard HD)', badge: '720p HD', desc: 'Smaller file size, fast render' };
    }
  };

  // Generate and download High-Res Save The Date Card Image
  const handleDownloadDateCard = async () => {
    setIsExportingCard(true);
    try {
      const offscreenCanvas = document.createElement('canvas');
      const renderer = new VideoRenderer(offscreenCanvas);
      const scene4 = scenes.find((s) => s.tag === 'scene4') || scenes[scenes.length - 1];
      await renderer.preloadImages(scenes);

      const dataUrl = renderer.exportInvitationCardDataUrl(couple, aspectRatio, scene4, cardQuality);

      const cleanBride = couple.brideName.trim().replace(/[^a-zA-Z0-9]/g, '_') || 'Bride';
      const cleanGroom = couple.groomName.trim().replace(/[^a-zA-Z0-9]/g, '_') || 'Groom';
      const fileName = `${cleanBride}_and_${cleanGroom}_Save_The_Date_Card_HD.png`;

      // Try Web Share on mobile first
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], fileName, { type: 'image/png' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: `${couple.brideName} & ${couple.groomName} Wedding Card`,
            text: `Save our date: ${formattedDate}`,
          });
          setSaveSuccessMsg('Card sent to device / Photos gallery!');
          setTimeout(() => setSaveSuccessMsg(null), 4000);
          setIsExportingCard(false);
          return;
        } catch (shareErr) {
          // User cancelled or fallback to direct download
        }
      }

      // Direct file download for Laptop / desktop
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setSaveSuccessMsg('High-Res Invitation Card downloaded to your computer!');
      setTimeout(() => setSaveSuccessMsg(null), 4000);
    } catch (e) {
      console.error('Failed to export date card image:', e);
    } finally {
      setIsExportingCard(false);
    }
  };

  // Record and export Full HD Video
  const handleExportVideo = async () => {
    setIsExportingVideo(true);
    setExportProgress(0);
    setExportStatusText('Initializing 3D renderer & audio engine...');
    setSaveSuccessMsg(null);

    try {
      const offscreenCanvas = document.createElement('canvas');
      const renderer = new VideoRenderer(offscreenCanvas);

      const result = await renderer.exportVideo(
        scenes,
        couple,
        aspectRatio,
        selectedQuality,
        (pct, status) => {
          setExportProgress(pct);
          if (status) setExportStatusText(status);
        }
      );

      setExportedVideo(result);
      setSaveSuccessMsg(`HD Video ready! Choose to save directly to phone Photos or download to laptop below.`);
    } catch (e) {
      console.error('Failed to export video:', e);
      alert('Video export encountered an issue. Please ensure your browser supports MediaRecorder.');
    } finally {
      setIsExportingVideo(false);
      setExportProgress(0);
      setExportStatusText('');
    }
  };

  // Save Video directly to Phone Gallery (iOS Camera Roll / Android Photos)
  const handleSaveToPhoneGallery = async () => {
    if (!exportedVideo) return;
    setIsSharingToPhone(true);

    try {
      const file = new File([exportedVideo.blob], exportedVideo.fileName, {
        type: exportedVideo.mimeType || 'video/mp4',
      });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `${couple.brideName} & ${couple.groomName} Pixar Wedding Story`,
          text: `Watch our Pixar 3D Wedding Story Video! Save our date: ${formattedDate}`,
        });
        setSaveSuccessMsg('Video sent to Share Sheet! Tap "Save Video" to add directly to your Photos app.');
      } else {
        // Fallback: trigger standard download and notify user
        handleDownloadToLaptop();
        setSaveSuccessMsg(
          'Video downloading! On iPhone/Android, open your Downloads folder and tap "Save Video" to move it to your Photos Gallery.'
        );
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.warn('Share error, falling back to direct download:', err);
        handleDownloadToLaptop();
      }
    } finally {
      setIsSharingToPhone(false);
    }
  };

  // Direct download to Laptop / PC
  const handleDownloadToLaptop = () => {
    if (!exportedVideo) return;
    const link = document.createElement('a');
    link.href = exportedVideo.url;
    link.download = exportedVideo.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setSaveSuccessMsg(`✅ Downloaded "${exportedVideo.fileName}" to your computer's Downloads folder!`);
    setTimeout(() => setSaveSuccessMsg(null), 5000);
  };

  const handleCopyInviteText = () => {
    const text = `💍 WEDDING INVITATION 💍\n\n${couple.blessingHeader}\n\nYou are cordially invited to celebrate the marriage ceremony of\n${couple.brideName} & ${couple.groomName}\n\n🗓️ Date: ${formattedDate}\n⏰ Time: ${couple.weddingTime}\n📍 Venue: ${couple.venue}, ${couple.city}\n\n"From this day forward, you shall not walk alone."\n\nSave our date! ✨`;
    navigator.clipboard.writeText(text);
    setCopiedInvite(true);
    setTimeout(() => setCopiedInvite(false), 2500);
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `💍 WEDDING INVITATION 💍\n\n${couple.blessingHeader}\n\nWe are getting married! ${couple.brideName} & ${couple.groomName}\n🗓️ ${formattedDate} at ${couple.weddingTime}\n📍 ${couple.venue}, ${couple.city}\n\nSave our date! ✨`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const activeSpecs = getResolutionSpecs(selectedQuality);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-xl my-6 rounded-3xl bg-slate-900 border border-purple-700/60 shadow-2xl p-5 sm:p-7 text-white overflow-hidden max-h-[92vh] flex flex-col">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-950/80 hover:bg-purple-950 text-slate-400 hover:text-white transition z-10"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-4 flex-shrink-0">
          <div className="inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-600 via-pink-500 to-amber-400 mb-2 shadow-lg shadow-purple-900/40">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-xl font-bold text-white font-cinzel tracking-wide">
            HD Video & Gallery Download
          </h3>
          <p className="text-xs text-purple-200/80 mt-0.5">
            Download your high-definition video and save directly to your Phone Photos or Laptop
          </p>
        </div>

        {/* Global Toast Success Message */}
        {saveSuccessMsg && (
          <div className="mb-3 p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-500/60 text-emerald-200 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span className="flex-1">{saveSuccessMsg}</span>
          </div>
        )}

        {/* Tabs */}
        <div className="grid grid-cols-2 p-1 rounded-xl bg-slate-950 border border-purple-900/60 mb-4 flex-shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('video')}
            className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'video'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Film className="w-4 h-4" />
            Download HD Video
          </button>

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
            Save The Date & Card
          </button>
        </div>

        {/* Tab Content Container */}
        <div className="overflow-y-auto pr-1 space-y-4 flex-1">
          {/* ===================== TAB 1: DOWNLOAD HD VIDEO ===================== */}
          {activeTab === 'video' && (
            <div className="space-y-4">
              {/* If Video is NOT yet exported: Quality Selection & Specs */}
              {!exportedVideo && !isExportingVideo && (
                <>
                  {/* Quality Selector */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-purple-200 flex items-center justify-between">
                      <span>Select Video Quality:</span>
                      <span className="text-[10px] text-amber-300 font-mono">
                        {aspectRatio === '9:16' ? 'Vertical 9:16 Reel' : 'Cinema 16:9'}
                      </span>
                    </label>

                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedQuality('1080p')}
                        className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
                          selectedQuality === '1080p'
                            ? 'bg-purple-950/80 border-purple-400 shadow-md shadow-purple-900/50'
                            : 'bg-slate-950/70 border-purple-950 hover:border-purple-800 text-slate-400'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="text-xs font-bold text-white">1080p</span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-pink-500/20 text-pink-300 border border-pink-500/30">
                            Popular
                          </span>
                        </div>
                        <div className="text-[10px] text-purple-300 font-medium mt-1">Full HD</div>
                        <div className="text-[9px] text-slate-400 mt-0.5">Reels & Gallery</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedQuality('720p')}
                        className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
                          selectedQuality === '720p'
                            ? 'bg-purple-950/80 border-purple-400 shadow-md shadow-purple-900/50'
                            : 'bg-slate-950/70 border-purple-950 hover:border-purple-800 text-slate-400'
                        }`}
                      >
                        <span className="text-xs font-bold text-white">720p</span>
                        <div className="text-[10px] text-purple-300 font-medium mt-1">Standard HD</div>
                        <div className="text-[9px] text-slate-400 mt-0.5">Faster Render</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedQuality('4k')}
                        className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
                          selectedQuality === '4k'
                            ? 'bg-purple-950/80 border-purple-400 shadow-md shadow-purple-900/50'
                            : 'bg-slate-950/70 border-purple-950 hover:border-purple-800 text-slate-400'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="text-xs font-bold text-white">4K</span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            Ultra
                          </span>
                        </div>
                        <div className="text-[10px] text-purple-300 font-medium mt-1">Ultra HD</div>
                        <div className="text-[9px] text-slate-400 mt-0.5">Big Screen TV</div>
                      </button>
                    </div>
                  </div>

                  {/* Video Specs Card */}
                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-purple-900/60 space-y-2 text-xs">
                    <div className="flex items-center justify-between font-semibold">
                      <span className="text-purple-200">Resolution & Dimensions:</span>
                      <span className="text-amber-300 font-mono text-[11px]">{activeSpecs.label}</span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-300 border-t border-purple-950 pt-2">
                      <span className="text-slate-400">Audio Track:</span>
                      <span className="text-pink-300 flex items-center gap-1 font-medium">
                        <Volume2 className="w-3.5 h-3.5 text-pink-400" />
                        Romantic Wedding Ballad (Synced)
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-300 border-t border-purple-950 pt-2">
                      <span className="text-slate-400">Format Compatibility:</span>
                      <span className="text-emerald-300 font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        {mimeInfo.label}
                      </span>
                    </div>

                    <div className="text-[10px] text-purple-300/80 pt-1">
                      ✨ Seamlessly saves to Apple Photos (iOS), Android Gallery, and PC/Mac Downloads.
                    </div>
                  </div>

                  {/* Render Trigger Button */}
                  <button
                    type="button"
                    onClick={handleExportVideo}
                    className="w-full py-4 px-4 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:from-purple-500 hover:via-pink-500 hover:to-amber-400 text-white font-bold text-sm shadow-xl shadow-purple-900/40 flex items-center justify-center gap-2.5 transition active:scale-[0.99]"
                  >
                    <Film className="w-5 h-5" />
                    <span>Render {selectedQuality.toUpperCase()} Video for Phone & Laptop</span>
                  </button>
                </>
              )}

              {/* In-Progress Render Screen */}
              {isExportingVideo && (
                <div className="p-6 rounded-2xl bg-purple-950/70 border border-purple-700/60 space-y-3 text-center animate-in fade-in">
                  <div className="flex items-center justify-center gap-2 text-base font-bold text-amber-300">
                    <Loader2 className="w-5 h-5 animate-spin text-amber-400" />
                    Recording in {selectedQuality.toUpperCase()} • {exportProgress}%
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-purple-900">
                    <div
                      className="bg-gradient-to-r from-purple-500 via-pink-500 to-amber-400 h-full transition-all duration-150"
                      style={{ width: `${exportProgress}%` }}
                    />
                  </div>

                  <p className="text-xs text-purple-200 font-medium">
                    {exportStatusText || 'Compositing Pixar 3D characters, diamond sparkle & audio...'}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Please keep this window open while the high-definition video is being prepared.
                  </p>
                </div>
              )}

              {/* POST-RENDER STATE: Interactive Player + Phone Gallery & Laptop Download */}
              {exportedVideo && !isExportingVideo && (
                <div className="space-y-4 animate-in fade-in">
                  {/* Embedded Video Preview Player */}
                  <div className="relative rounded-2xl overflow-hidden bg-black border border-purple-800/80 shadow-2xl flex items-center justify-center">
                    <video
                      ref={videoPreviewRef}
                      src={exportedVideo.url}
                      controls
                      playsInline
                      autoPlay
                      loop
                      className={`w-full max-h-64 object-contain bg-slate-950 ${
                        aspectRatio === '9:16' ? 'max-w-[200px] mx-auto py-2' : 'aspect-video'
                      }`}
                    />
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md border border-purple-500/40 text-[10px] font-bold text-amber-300">
                      ✅ {exportedVideo.quality.toUpperCase()} HD • {(exportedVideo.sizeBytes / (1024 * 1024)).toFixed(1)} MB
                    </div>
                  </div>

                  {/* Action 1: Save directly to Phone Photos / Gallery */}
                  <button
                    type="button"
                    onClick={handleSaveToPhoneGallery}
                    disabled={isSharingToPhone}
                    className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:from-purple-500 hover:via-pink-500 hover:to-amber-400 text-white font-bold text-sm shadow-xl shadow-purple-900/40 flex items-center justify-between transition active:scale-[0.99]"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-xl bg-white/20">
                        <Smartphone className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-left">
                        <div>Save to Phone Photos / Gallery</div>
                        <div className="text-[10px] text-purple-100 font-normal">
                          Apple Photos Camera Roll or Android Gallery
                        </div>
                      </div>
                    </div>
                    {isSharingToPhone ? (
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                    ) : (
                      <Download className="w-4 h-4 text-white" />
                    )}
                  </button>

                  {/* Action 2: Direct Download to Laptop / PC */}
                  <button
                    type="button"
                    onClick={handleDownloadToLaptop}
                    className="w-full py-3 px-4 rounded-2xl bg-slate-950 hover:bg-purple-950 border border-purple-800/80 text-white font-bold text-xs sm:text-sm flex items-center justify-between transition active:scale-[0.99]"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-xl bg-purple-900/40">
                        <Laptop className="w-4 h-4 text-amber-300" />
                      </div>
                      <div className="text-left">
                        <div>Download to Laptop / PC</div>
                        <div className="text-[10px] text-slate-400 font-normal">
                          Saves file directly to your computer's Downloads folder
                        </div>
                      </div>
                    </div>
                    <Download className="w-4 h-4 text-amber-300" />
                  </button>

                  {/* Phone Tip Info Box */}
                  <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-900/50 flex items-start gap-2.5 text-[11px] text-purple-200">
                    <Info className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-amber-300">How to save to phone gallery: </span>
                      Tap <strong>"Save to Phone Photos"</strong> then choose <strong>"Save Video"</strong> on your iPhone or Android. You can also press and hold the video player above and select <strong>"Save to Photos"</strong>.
                    </div>
                  </div>

                  {/* Action 3: Social & Re-render options */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleShareWhatsApp}
                      className="py-2.5 px-3 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/70 border border-emerald-800/60 text-emerald-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      Share to WhatsApp
                    </button>

                    <button
                      type="button"
                      onClick={() => setExportedVideo(null)}
                      className="py-2.5 px-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-purple-900/40 text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Change Quality
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ===================== TAB 2: DOWNLOAD DATE & INVITATIONS ===================== */}
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
                <div className="p-3 rounded-2xl bg-slate-950 border border-purple-900/60 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-purple-200">Invitation Card Quality:</span>
                    <div className="flex items-center gap-1">
                      {(['1080p', '4k'] as VideoQuality[]).map((q) => (
                        <button
                          key={q}
                          type="button"
                          onClick={() => setCardQuality(q)}
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition ${
                            cardQuality === q
                              ? 'bg-amber-500 text-slate-950'
                              : 'bg-slate-900 text-slate-400 hover:text-white'
                          }`}
                        >
                          {q.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleDownloadDateCard}
                    disabled={isExportingCard}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-pink-600 hover:from-amber-400 hover:to-pink-500 text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-between shadow-lg shadow-amber-950/40 transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <FileImage className="w-5 h-5 text-slate-950" />
                      <div className="text-left">
                        <div>Download Save The Date Card (PNG)</div>
                        <div className="text-[10px] text-slate-900 font-normal">
                          High-resolution royal invitation card for Phone Gallery & Laptop
                        </div>
                      </div>
                    </div>
                    {isExportingCard ? (
                      <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                    ) : (
                      <Download className="w-4 h-4 text-slate-950" />
                    )}
                  </button>
                </div>

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
                        Syncs to iPhone Apple Calendar, Outlook, & Android
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
        </div>
      </div>
    </div>
  );
};
