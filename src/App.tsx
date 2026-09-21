import React, { useState, useEffect } from 'react';
import {
  Film,
  Sparkles,
  Heart,
  Calendar,
  Compass,
  HardDrive,
} from 'lucide-react';
import {
  CoupleData,
  SceneItem,
  AspectRatioType,
  CaricatureAIProfile,
  IndianStateId,
  SceneryOption,
} from './types';
import {
  DEFAULT_SCENES,
  SAMPLE_BRIDE_PHOTO,
  SAMPLE_GROOM_PHOTO,
  INDIAN_STATE_THEMES,
} from './assets/scenes';
import { IndianStateThemeSelector } from './components/IndianStateThemeSelector';
import { PhotoUploader } from './components/PhotoUploader';
import { DateAndDetailsForm } from './components/DateAndDetailsForm';
import { SceneCustomizer } from './components/SceneCustomizer';
import { VideoPlayer } from './components/VideoPlayer';
import { DownloadModal } from './components/DownloadModal';
import { romanticAudio } from './utils/audioEngine';
import {
  loadSavedAppPhotos,
  persistBridePhoto,
  persistGroomPhoto,
  persistCustomSceneries,
  persistSavedScenes,
  persistCoupleData,
} from './utils/storage';

export default function App() {
  // Active Indian state wedding theme
  const [selectedState, setSelectedState] = useState<IndianStateId>('bollywood');

  // Couple state with realistic wedding defaults matching the user's reference video
  const [couple, setCouple] = useState<CoupleData>({
    brideName: 'Priya',
    groomName: 'Amit',
    weddingDate: '2026-06-22',
    weddingTime: '5:00 PM onwards',
    venue: 'The Oberoi Palace & Lawns',
    city: 'Delhi',
    ceremonyType: 'Wedding Ceremony',
    parentsBride: 'Anshal Mehta & Reema Mehta',
    parentsGroom: 'Rajesh Gupta & Kiran Gupta',
    blessingHeader: '|| Shree Ganeshay Namah ||',
    coupleQuote: 'Two souls, one synchronized beat, entering into forever.',
  });

  // Photo uploads
  const [bridePhoto, setBridePhoto] = useState<string | null>(SAMPLE_BRIDE_PHOTO);
  const [groomPhoto, setGroomPhoto] = useState<string | null>(SAMPLE_GROOM_PHOTO);
  const [caricatureProfile, setCaricatureProfile] = useState<CaricatureAIProfile | null>({
    groom: {
      features: 'Charming 3D Pixar animated groom in tailored ivory sherwani with subtle gold lapel motifs, styled dark hair, warm smiling eyes.',
      expression: 'Lovestruck and beaming with adoration during the proposal and first dance.',
    },
    bride: {
      features: 'Radiant 3D Pixar animated bride in blush pink & gold lehenga, gentle wavy locks adorned with floral blossoms, expressive hazel eyes.',
      expression: 'Emotional and overjoyed, hand over heart.',
    },
    vibe: 'Romantic wisteria twilight garden with glowing lavender bokeh, starburst sparkles, and fairy lights.',
    romanticQuote: 'Every love story is beautiful, but ours is our favorite.',
  });

  // Shared custom user uploads saved across all 4 scenes and persisted in IndexedDB
  const [customUploads, setCustomUploads] = useState<SceneryOption[]>([]);

  // Video studio scenes
  const [scenes, setScenes] = useState<SceneItem[]>(DEFAULT_SCENES);
  const [aspectRatio, setAspectRatio] = useState<AspectRatioType>('9:16');

  // Modal dialog states
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState<boolean>(false);
  const [modalDefaultTab, setModalDefaultTab] = useState<'date' | 'video'>('date');

  // Load saved app photos and state from persistent IndexedDB storage on mount
  useEffect(() => {
    loadSavedAppPhotos()
      .then((stored) => {
        if (stored.bridePhoto) setBridePhoto(stored.bridePhoto);
        if (stored.groomPhoto) setGroomPhoto(stored.groomPhoto);
        if (stored.customSceneries && stored.customSceneries.length > 0) {
          setCustomUploads(stored.customSceneries);
        }
        if (stored.savedScenes && stored.savedScenes.length > 0) {
          setScenes(stored.savedScenes);
        }
        if (stored.savedCouple) {
          setCouple(stored.savedCouple);
        }
      })
      .catch((err) => {
        console.warn('Failed to load saved state from IndexedDB:', err);
      });
  }, []);

  const activeStateTheme = INDIAN_STATE_THEMES[selectedState];

  // Handle State Theme Change
  const handleSelectState = (stateId: IndianStateId) => {
    setSelectedState(stateId);
    const theme = INDIAN_STATE_THEMES[stateId];

    // 1. Automatically update ALL 4 SCENES (Scene 1, Scene 2, Scene 3, Scene 4) to the chosen culture theme!
    setScenes(theme.scenes);
    persistSavedScenes(theme.scenes);

    // 2. Update blessing header, ceremony type, venue & city in couple data
    setCouple((prev) => {
      const next = {
        ...prev,
        blessingHeader: theme.blessingHeader,
        ceremonyType: theme.ceremonyType,
        venue:
          prev.venue === 'Hotel Ashriya International' ||
          prev.venue === 'The Oberoi Palace & Lawns' ||
          Object.values(INDIAN_STATE_THEMES).some((t) => t.defaultVenue === prev.venue)
            ? theme.defaultVenue
            : prev.venue,
        city:
          prev.city === 'Delhi' ||
          Object.values(INDIAN_STATE_THEMES).some((t) => t.defaultCity === prev.city)
            ? theme.defaultCity
            : prev.city,
      };
      persistCoupleData(next);
      return next;
    });

    // 3. Play regional celebration music & sparkle chime
    romanticAudio.setTheme(theme.musicTheme);
    romanticAudio.playSparkleChime();
  };

  const handleCoupleChange = (updated: Partial<CoupleData>) => {
    setCouple((prev) => {
      const next = { ...prev, ...updated };
      persistCoupleData(next);
      return next;
    });
  };

  const handlePhotosChange = (bride: string | null, groom: string | null) => {
    setBridePhoto(bride);
    setGroomPhoto(groom);
    persistBridePhoto(bride);
    persistGroomPhoto(groom);
  };

  const handleAddCustomUpload = (newUpload: SceneryOption) => {
    setCustomUploads((prev) => {
      const next = [newUpload, ...prev];
      persistCustomSceneries(next);
      return next;
    });
  };

  const handleDeleteCustomUpload = (id: string) => {
    setCustomUploads((prev) => {
      const next = prev.filter((item) => item.id !== id);
      persistCustomSceneries(next);
      return next;
    });
  };

  const handleAddPhotoToGallery = (imageUrl: string, label: string) => {
    const newUpload: SceneryOption = {
      id: `gallery-photo-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      label,
      category: 'upload',
      imageUrl,
      description: 'Saved wedding photo from your uploaded collection',
      themeName: 'Saved in App',
    };
    handleAddCustomUpload(newUpload);
  };

  const handleCaricatureGenerated = (profile: CaricatureAIProfile) => {
    setCaricatureProfile(profile);
    if (profile.romanticQuote) {
      setCouple((prev) => {
        const next = { ...prev, coupleQuote: profile.romanticQuote || prev.coupleQuote };
        persistCoupleData(next);
        return next;
      });
    }
  };

  const handleUpdateScene = (index: number, updated: Partial<SceneItem>) => {
    setScenes((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...updated };
      persistSavedScenes(next);
      return next;
    });
  };

  const openDownloadDateModal = () => {
    setModalDefaultTab('date');
    setIsDownloadModalOpen(true);
  };

  const openDownloadVideoModal = () => {
    setModalDefaultTab('video');
    setIsDownloadModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-purple-950/20 to-slate-950 text-slate-100 flex flex-col font-sans-custom">
      {/* Studio Navigation Bar */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-lg border-b border-purple-900/40 px-4 sm:px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 via-pink-500 to-amber-400 p-0.5 shadow-md shadow-purple-900/40">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-amber-300" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-white font-cinzel">
                  Pixar Wedding Video Studio
                </h1>
                <span className="hidden sm:inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {activeStateTheme.stateLabel} Edition
                </span>
              </div>
              <p className="text-[11px] text-purple-300/80 hidden sm:block">
                "Finally" • "Wait is Over" • "We are making it official" • "We are getting married"
              </p>
            </div>
          </div>

          {/* Quick Header CTAs */}
          <div className="flex items-center gap-2">
            <span className="hidden sm:flex items-center gap-1.5 text-[11px] text-emerald-300 font-semibold bg-emerald-950/80 border border-emerald-700/60 px-2.5 py-1 rounded-full shadow-sm">
              <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
              <span>Photos Auto-Saved ({customUploads.length + (bridePhoto ? 1 : 0) + (groomPhoto ? 1 : 0)})</span>
            </span>

            <button
              type="button"
              onClick={openDownloadDateModal}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-purple-950 text-amber-300 border border-amber-500/40 text-xs font-semibold flex items-center gap-1.5 shadow transition"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Save Date</span>
            </button>

            <button
              type="button"
              onClick={openDownloadVideoModal}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:via-pink-500 hover:to-amber-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-purple-900/30 active:scale-95 transition"
            >
              <Film className="w-3.5 h-3.5" />
              <span>Download HD Video</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Studio Workspace */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Editor & Form Controls (7 cols on large screens) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Step 1: Indian State Theme Selector */}
            <IndianStateThemeSelector
              selectedState={selectedState}
              onSelectState={handleSelectState}
            />

            {/* Step 2: Upload Bride & Groom Photos + Pixar AI Stylizer */}
            <PhotoUploader
              bridePhoto={bridePhoto}
              groomPhoto={groomPhoto}
              brideName={couple.brideName}
              groomName={couple.groomName}
              onPhotosChange={handlePhotosChange}
              caricatureProfile={caricatureProfile}
              onCaricatureGenerated={handleCaricatureGenerated}
              stateTheme={activeStateTheme}
              onAddPhotoToGallery={handleAddPhotoToGallery}
            />

            {/* Step 3: Date Input & Celebration Details */}
            <DateAndDetailsForm
              couple={couple}
              onChange={handleCoupleChange}
              onOpenDownloadModal={openDownloadDateModal}
            />

            {/* Step 4: Four Story Scenes Customizer */}
            <SceneCustomizer
              scenes={scenes}
              onUpdateScene={handleUpdateScene}
              activeStateTheme={activeStateTheme}
              onResetScenesToTheme={() => {
                setScenes(activeStateTheme.scenes);
                persistSavedScenes(activeStateTheme.scenes);
              }}
              customUploads={customUploads}
              onAddCustomUpload={handleAddCustomUpload}
              onDeleteCustomUpload={handleDeleteCustomUpload}
            />
          </div>

          {/* Right Column: Live Video Canvas Studio & Scrubber (5 cols on large screens) */}
          <div className="lg:col-span-5 lg:sticky lg:top-20">
            <VideoPlayer
              scenes={scenes}
              couple={couple}
              aspectRatio={aspectRatio}
              onAspectRatioChange={setAspectRatio}
              onOpenDownloadModal={openDownloadDateModal}
              onOpenVideoExport={openDownloadVideoModal}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-purple-900/30 py-6 px-4 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-purple-300 font-medium">
            <Heart className="w-4 h-4 text-pink-500 fill-current" />
            <span>Pixar 3D Wedding Story Studio • {activeStateTheme.name}</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Authentic regional Indian cultural attire, festive blessings & real-time Pixar canvas video composer.
          </p>
        </div>
      </footer>

      {/* Download & Export Modal */}
      <DownloadModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
        couple={couple}
        scenes={scenes}
        aspectRatio={aspectRatio}
        defaultTab={modalDefaultTab}
      />
    </div>
  );
}
