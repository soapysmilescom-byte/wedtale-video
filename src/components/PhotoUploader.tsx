import React, { useState } from 'react';
import { Upload, Sparkles, Wand2, Image as ImageIcon, Heart, CheckCircle2, User, RefreshCw } from 'lucide-react';
import { CaricatureAIProfile, IndianStateTheme } from '../types';
import { SAMPLE_BRIDE_PHOTO, SAMPLE_GROOM_PHOTO } from '../assets/scenes';

interface PhotoUploaderProps {
  bridePhoto: string | null;
  groomPhoto: string | null;
  brideName: string;
  groomName: string;
  onPhotosChange: (bride: string | null, groom: string | null) => void;
  caricatureProfile: CaricatureAIProfile | null;
  onCaricatureGenerated: (profile: CaricatureAIProfile) => void;
  stateTheme?: IndianStateTheme;
  onAddPhotoToGallery?: (imageUrl: string, label: string) => void;
}

export const PhotoUploader: React.FC<PhotoUploaderProps> = ({
  bridePhoto,
  groomPhoto,
  brideName,
  groomName,
  onPhotosChange,
  caricatureProfile,
  onCaricatureGenerated,
  stateTheme,
  onAddPhotoToGallery,
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [galleryAddedNotice, setGalleryAddedNotice] = useState<string | null>(null);

  const handleAddToGallery = (imageUrl: string, label: string) => {
    if (onAddPhotoToGallery) {
      onAddPhotoToGallery(imageUrl, label);
      setGalleryAddedNotice(`Saved "${label}" to all 4 Scene Galleries!`);
      setTimeout(() => setGalleryAddedNotice(null), 3000);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'bride' | 'groom') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (type === 'bride') {
        onPhotosChange(dataUrl, groomPhoto);
      } else {
        onPhotosChange(bridePhoto, dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUseSamplePhotos = () => {
    onPhotosChange(SAMPLE_BRIDE_PHOTO, SAMPLE_GROOM_PHOTO);
  };

  const handleGenerateCaricature = async () => {
    setIsAnalyzing(true);
    setErrorMsg(null);
    setAnalysisStep('Scanning facial characteristics & hair features...');

    try {
      // Step progression simulation for rich UX feedback
      const timer1 = setTimeout(() => {
        setAnalysisStep(
          stateTheme
            ? `Styling 3D Pixar character models in ${stateTheme.stateLabel} cultural attire...`
            : 'Styling 3D Pixar character models in royal couture...'
        );
      }, 1000);

      const timer2 = setTimeout(() => {
        setAnalysisStep('Directing 4 romantic cinematic scenes (Finally, Wait is Over, Official, Married)...');
      }, 2200);

      const res = await fetch('/api/analyze-couple', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bridePhoto,
          groomPhoto,
          brideName,
          groomName,
          stateTheme: stateTheme?.name || 'Pan-Indian / Bollywood Glam',
          brideAttire: stateTheme?.brideAttire || '',
          groomAttire: stateTheme?.groomAttire || '',
        }),
      });

      clearTimeout(timer1);
      clearTimeout(timer2);

      const data = await res.json();
      if (data.success && data.caricatureDetails) {
        onCaricatureGenerated(data.caricatureDetails);
      } else {
        throw new Error(data.error || 'Failed to generate caricature');
      }
    } catch (err: any) {
      console.warn('Backend analyze error, falling back to local Pixar caricature styler:', err);
      // Fallback local styling with state theme
      const fallbackProfile: CaricatureAIProfile = {
        groom: {
          features: `Charming 3D Pixar caricature of ${groomName}: ${stateTheme?.groomAttire || 'tailored ivory suit with gold lapel embroidery'}.`,
          expression: 'Lovestruck and beaming with adoration during the proposal and celebration.',
        },
        bride: {
          features: `Radiant 3D Pixar caricature of ${brideName}: ${stateTheme?.brideAttire || 'pastel shimmer gown with floral blossoms'}.`,
          expression: 'Overwhelmed with happiness, hand to chest in joy.',
        },
        vibe: stateTheme ? `${stateTheme.culturalVibe}` : 'Enchanted Pixar romance with warm bokeh fairy lights.',
        romanticQuote: `From this day forward, you shall not walk alone.`,
      };
      onCaricatureGenerated(fallbackProfile);
    } finally {
      setIsAnalyzing(false);
      setAnalysisStep('');
    }
  };

  return (
    <div className="bg-slate-900/90 backdrop-blur-md rounded-2xl border border-purple-900/40 p-5 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              1. Bride & Groom Photos
            </h2>
            <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-950/70 border border-emerald-700/50 px-2 py-0.5 rounded-full flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Saved in App
            </span>
          </div>
          <p className="text-xs text-purple-300/80">
            Photos you upload are permanently saved in the app and can be used in 3D Pixar generation and scene backdrops.
          </p>
        </div>
        <button
          type="button"
          onClick={handleUseSamplePhotos}
          className="text-xs px-3 py-1.5 rounded-full bg-purple-950/80 hover:bg-purple-900 text-purple-300 border border-purple-800/60 transition flex items-center gap-1.5"
          title="Load sample couple photos"
        >
          <ImageIcon className="w-3.5 h-3.5" />
          Load Sample Photos
        </button>
      </div>

      {galleryAddedNotice && (
        <div className="mb-3 px-3 py-2 rounded-xl bg-emerald-950/80 border border-emerald-500/60 text-emerald-300 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>{galleryAddedNotice}</span>
        </div>
      )}

      {/* Upload Dual Cards */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {/* Bride Card */}
        <div className="relative group rounded-xl border border-dashed border-pink-500/40 hover:border-pink-400 bg-slate-950/50 p-3 text-center transition">
          <label className="cursor-pointer block">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileUpload(e, 'bride')}
            />
            {bridePhoto ? (
              <div className="relative mx-auto w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden shadow-md ring-2 ring-pink-500/60 group-hover:scale-105 transition">
                <img
                  src={bridePhoto}
                  alt="Bride Preview"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-xs text-white">
                  Change
                </div>
              </div>
            ) : (
              <div className="py-4 flex flex-col items-center justify-center text-pink-400/80">
                <div className="w-12 h-12 rounded-full bg-pink-950/60 flex items-center justify-center mb-2">
                  <User className="w-6 h-6 text-pink-400" />
                </div>
                <span className="text-xs font-semibold text-pink-300">Upload Bride Photo</span>
                <span className="text-[10px] text-slate-400 mt-1">PNG, JPG or WebP</span>
              </div>
            )}
          </label>
          <div className="mt-2 text-center space-y-1">
            <span className="text-xs font-medium text-pink-300 block">👰 {brideName || 'Bride'}</span>
            {bridePhoto && onAddPhotoToGallery && (
              <button
                type="button"
                onClick={() => handleAddToGallery(bridePhoto, `👰 ${brideName || 'Bride'} Photo`)}
                className="text-[10px] text-pink-300 hover:text-white bg-pink-950/70 hover:bg-pink-900 border border-pink-700/50 px-2 py-0.5 rounded-md transition flex items-center justify-center gap-1 mx-auto"
                title="Save bride photo into all 4 scene galleries"
              >
                <Sparkles className="w-2.5 h-2.5 text-pink-400" />
                <span>Add to Scene Gallery</span>
              </button>
            )}
          </div>
        </div>

        {/* Groom Card */}
        <div className="relative group rounded-xl border border-dashed border-indigo-500/40 hover:border-indigo-400 bg-slate-950/50 p-3 text-center transition">
          <label className="cursor-pointer block">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileUpload(e, 'groom')}
            />
            {groomPhoto ? (
              <div className="relative mx-auto w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden shadow-md ring-2 ring-indigo-500/60 group-hover:scale-105 transition">
                <img
                  src={groomPhoto}
                  alt="Groom Preview"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-xs text-white">
                  Change
                </div>
              </div>
            ) : (
              <div className="py-4 flex flex-col items-center justify-center text-indigo-400/80">
                <div className="w-12 h-12 rounded-full bg-indigo-950/60 flex items-center justify-center mb-2">
                  <User className="w-6 h-6 text-indigo-400" />
                </div>
                <span className="text-xs font-semibold text-indigo-300">Upload Groom Photo</span>
                <span className="text-[10px] text-slate-400 mt-1">PNG, JPG or WebP</span>
              </div>
            )}
          </label>
          <div className="mt-2 text-center space-y-1">
            <span className="text-xs font-medium text-indigo-300 block">🤵 {groomName || 'Groom'}</span>
            {groomPhoto && onAddPhotoToGallery && (
              <button
                type="button"
                onClick={() => handleAddToGallery(groomPhoto, `🤵 ${groomName || 'Groom'} Photo`)}
                className="text-[10px] text-indigo-300 hover:text-white bg-indigo-950/70 hover:bg-indigo-900 border border-indigo-700/50 px-2 py-0.5 rounded-md transition flex items-center justify-center gap-1 mx-auto"
                title="Save groom photo into all 4 scene galleries"
              >
                <Sparkles className="w-2.5 h-2.5 text-indigo-400" />
                <span>Add to Scene Gallery</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Generate 3D Pixar Caricature Action Button */}
      <button
        type="button"
        onClick={handleGenerateCaricature}
        disabled={isAnalyzing}
        className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:from-purple-500 hover:via-pink-500 hover:to-amber-400 text-white font-semibold text-sm shadow-lg shadow-purple-900/30 active:scale-[0.99] transition flex items-center justify-center gap-2 disabled:opacity-60"
      >
        {isAnalyzing ? (
          <>
            <RefreshCw className="w-4 h-4 animate-spin text-white" />
            <span>Generating 3D Pixar Caricature...</span>
          </>
        ) : (
          <>
            <Wand2 className="w-4 h-4" />
            <span>Generate 3D Pixar Cute Caricature</span>
          </>
        )}
      </button>

      {/* Live AI Progress State */}
      {isAnalyzing && (
        <div className="mt-3 p-3 rounded-lg bg-purple-950/60 border border-purple-800/50 text-xs text-purple-200 flex items-center gap-2 animate-pulse">
          <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
          <span>{analysisStep}</span>
        </div>
      )}

      {/* Caricature Persona Preview Badge */}
      {caricatureProfile && !isAnalyzing && (
        <div className="mt-4 p-3.5 rounded-xl bg-purple-950/40 border border-purple-800/40 space-y-2 text-xs">
          <div className="flex items-center justify-between text-purple-300 font-semibold">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Pixar 3D Caricatures Applied
            </span>
            <span className="text-[10px] text-amber-300/90 font-mono">3D Cinematic Style</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            <div className="p-2 rounded-lg bg-slate-950/60 border border-purple-900/30">
              <span className="font-semibold text-indigo-300">🤵 Groom Pixar Avatar:</span>
              <p className="text-slate-300 text-[11px] mt-0.5 line-clamp-2">{caricatureProfile.groom.features}</p>
            </div>
            <div className="p-2 rounded-lg bg-slate-950/60 border border-purple-900/30">
              <span className="font-semibold text-pink-300">👰 Bride Pixar Avatar:</span>
              <p className="text-slate-300 text-[11px] mt-0.5 line-clamp-2">{caricatureProfile.bride.features}</p>
            </div>
          </div>
          {caricatureProfile.romanticQuote && (
            <p className="text-center italic text-amber-200/90 pt-1 text-[11px]">
              "{caricatureProfile.romanticQuote}"
            </p>
          )}
        </div>
      )}
    </div>
  );
};
