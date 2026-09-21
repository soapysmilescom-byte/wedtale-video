import React, { useRef, useState } from 'react';
import {
  Layers,
  Clock,
  Sparkles,
  Check,
  Upload,
  RotateCcw,
  Palette,
  Image as ImageIcon,
  Heart,
  Search,
  Flame,
  Star,
  Crown,
  Trash2,
  HardDrive,
  CheckCircle2,
  Plus,
} from 'lucide-react';
import { SceneItem, IndianStateTheme, SceneryOption } from '../types';
import {
  USER_UPLOADED_FOUR_HERO_SCENES,
  ALL_UPLOADED_AND_SACRED_SCENES,
  ALL_CURATED_SCENES,
} from '../assets/scenes';

interface SceneCustomizerProps {
  scenes: SceneItem[];
  onUpdateScene: (index: number, updated: Partial<SceneItem>) => void;
  activeStateTheme: IndianStateTheme;
  onResetScenesToTheme?: () => void;
  customUploads: SceneryOption[];
  onAddCustomUpload: (upload: SceneryOption) => void;
  onDeleteCustomUpload: (id: string) => void;
}

type FilterTab = 'hero' | 'custom' | 'uploaded' | 'theme' | 'all';

export const SceneCustomizer: React.FC<SceneCustomizerProps> = ({
  scenes,
  onUpdateScene,
  activeStateTheme,
  onResetScenesToTheme,
  customUploads,
  onAddCustomUpload,
  onDeleteCustomUpload,
}) => {
  // Default tab selection per scene set to 'hero' so the 4 uploaded images are shown first
  const [sceneTab, setSceneTab] = useState<{ [sceneIdx: number]: FilterTab }>({
    0: 'hero',
    1: 'hero',
    2: 'hero',
    3: 'hero',
  });

  // Search keyword per scene
  const [sceneSearch, setSceneSearch] = useState<{ [sceneIdx: number]: string }>({});

  // Flash toast state for notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fileInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});
  const masterGalleryInputRef = useRef<HTMLInputElement | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // 1-Click apply the 4 uploaded images across Scene 1, Scene 2, Scene 3, and Scene 4
  const handleApplyFourUploadedToAllScenes = () => {
    USER_UPLOADED_FOUR_HERO_SCENES.forEach((hero, index) => {
      if (index < scenes.length) {
        onUpdateScene(index, {
          imageUrl: hero.imageUrl,
          title:
            index === 0
              ? 'Finally...'
              : index === 1
              ? 'The Wait is Over'
              : index === 2
              ? 'Making It Official'
              : 'We Are Getting Married!',
          subtitle: hero.label.replace(/^👑 \d+\.\s*/, ''),
        });
      }
    });

    showToast('✓ Successfully applied your 4 uploaded wedding images to Scene 1, Scene 2, Scene 3, and Scene 4!');
  };

  const handleCustomImageUpload = (
    sceneIndex: number | null,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    let count = 0;
    Array.from(files).forEach((file, fIdx) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          const newUpload: SceneryOption = {
            id: `custom-upload-${Date.now()}-${fIdx}-${Math.random().toString(36).substring(2, 6)}`,
            label: `📸 ${file.name.replace(/\.[^/.]+$/, '').substring(0, 24) || 'Uploaded Photo'}`,
            category: 'upload',
            imageUrl: result,
            description: 'Saved user uploaded photo (available in all 4 scenes)',
            themeName: 'Saved in App',
          };

          onAddCustomUpload(newUpload);
          count++;

          if (sceneIndex !== null && fIdx === 0) {
            onUpdateScene(sceneIndex, { imageUrl: result });
            setSceneTab((prev) => ({ ...prev, [sceneIndex]: 'custom' }));
          }
        }
      };
      reader.readAsDataURL(file);
    });

    showToast(`✓ Photo${files.length > 1 ? 's' : ''} saved in app database and added to all 4 scene galleries!`);

    if (e.target) {
      e.target.value = '';
    }
  };

  const getCategoryBadgeColor = (category: SceneryOption['category']) => {
    switch (category) {
      case 'ritual':
        return 'bg-gradient-to-r from-rose-900/80 to-amber-900/80 text-amber-200 border-amber-600/60 shadow-sm';
      case 'proposal':
        return 'bg-pink-900/70 text-pink-200 border-pink-700/60';
      case 'dance':
        return 'bg-purple-900/70 text-purple-200 border-purple-700/60';
      case 'attire':
        return 'bg-amber-900/70 text-amber-200 border-amber-700/60';
      case 'mandap':
        return 'bg-emerald-900/70 text-emerald-200 border-emerald-700/60';
      case 'upload':
        return 'bg-indigo-900/80 text-indigo-200 border-indigo-600/70';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  // Helper to get scenery items for a given tab and search query
  const getDisplayOptions = (sceneIndex: number): SceneryOption[] => {
    const currentTab = sceneTab[sceneIndex] || 'hero';
    const query = (sceneSearch[sceneIndex] || '').toLowerCase().trim();

    let baseList: SceneryOption[] = [];

    switch (currentTab) {
      case 'hero':
        baseList = USER_UPLOADED_FOUR_HERO_SCENES;
        break;
      case 'uploaded':
        baseList = [...customUploads, ...ALL_UPLOADED_AND_SACRED_SCENES];
        break;
      case 'theme':
        // Include the 4 uploaded images + the active theme scenery
        baseList = [...USER_UPLOADED_FOUR_HERO_SCENES, ...activeStateTheme.sceneryOptions];
        break;
      case 'all':
        baseList = [...customUploads, ...ALL_CURATED_SCENES];
        break;
      case 'custom':
        baseList = customUploads;
        break;
      default:
        baseList = USER_UPLOADED_FOUR_HERO_SCENES;
    }

    if (!query) return baseList;

    return baseList.filter(
      (opt) =>
        opt.label.toLowerCase().includes(query) ||
        opt.description.toLowerCase().includes(query) ||
        opt.category.toLowerCase().includes(query) ||
        (opt.themeName && opt.themeName.toLowerCase().includes(query))
    );
  };

  return (
    <div className="bg-slate-900/90 backdrop-blur-md rounded-2xl border border-purple-900/40 p-5 shadow-xl space-y-4">
      {/* Header & 1-Click Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-purple-900/40">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-white font-cinzel">
              4. Four Story Scenes & Scenery Customizer
            </h2>
          </div>
          <p className="text-xs text-purple-300/80 mt-0.5">
            Your 4 uploaded wedding images are loaded into <strong className="text-amber-300">all 4 scenes and all scenery sections</strong> below.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* 1-Click Apply All 4 Uploaded Images Button */}
          <button
            id="apply-4-uploaded-scenes-btn"
            type="button"
            onClick={handleApplyFourUploadedToAllScenes}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 via-pink-500 to-purple-600 hover:from-amber-400 hover:to-purple-500 text-slate-950 font-extrabold text-xs transition shadow-md hover:scale-[1.02] active:scale-[0.98]"
            title="Set Scene 1, Scene 2, Scene 3, and Scene 4 to these 4 uploaded images in sequence"
          >
            <Crown className="w-3.5 h-3.5 text-slate-950 fill-current" />
            <span>Apply 4 Uploaded Images to Scenes 1-4</span>
          </button>

          {onResetScenesToTheme && (
            <button
              id="reset-scenes-to-theme-btn"
              type="button"
              onClick={onResetScenesToTheme}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-950/80 hover:bg-purple-900 border border-purple-700/50 text-purple-200 text-xs font-semibold transition shadow-sm"
              title="Reset all 4 scenes to the default storyboard sequence of this theme"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span>Reset to Theme</span>
            </button>
          )}
        </div>
      </div>

      {/* Confirmation Toast Alert */}
      {toastMessage && (
        <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-950 via-green-900 to-slate-900 border border-emerald-500/70 text-emerald-200 text-xs font-semibold shadow-lg animate-pulse">
          <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Global Notice Bar Highlighting The 4 Uploaded Hero Images */}
      <div className="p-3.5 rounded-xl bg-gradient-to-r from-purple-950/80 via-pink-950/60 to-slate-900 border border-amber-500/40 text-xs space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Crown className="w-4 h-4 text-amber-400 fill-current" />
            <span className="text-purple-100 font-bold">
              Your 4 Uploaded Wedding Images are Active Across All Scenes & Sections:
            </span>
          </div>
          <span className="text-[11px] text-amber-300 font-semibold bg-amber-950/80 px-2 py-0.5 rounded border border-amber-600/50">
            Available in Scene 1, 2, 3, 4
          </span>
        </div>

        {/* Mini Preview Thumbnails of the 4 Uploaded Images */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
          {USER_UPLOADED_FOUR_HERO_SCENES.map((hero, hIdx) => (
            <div
              key={`hero-banner-${hero.id}`}
              className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-950/70 border border-amber-500/30"
            >
              <img
                src={hero.imageUrl}
                alt={hero.label}
                className="w-10 h-12 rounded object-cover border border-amber-400/40"
                referrerPolicy="no-referrer"
              />
              <div className="min-w-0">
                <span className="text-[9px] uppercase font-bold text-amber-300 block">
                  Image #{hIdx + 1}
                </span>
                <span className="text-[10px] font-semibold text-white truncate block">
                  {hero.label.replace(/^👑 \d+\.\s*/, '')}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Master Upload & Persistent App Gallery Section */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-slate-950 via-purple-950/40 to-slate-950 border border-emerald-500/50 space-y-3 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Saved App Photos Gallery</span>
              <span className="text-[10px] text-emerald-300 font-semibold bg-emerald-950/80 border border-emerald-700/60 px-2 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                Auto-saved in App Storage ({customUploads.length})
              </span>
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <input
              ref={masterGalleryInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handleCustomImageUpload(null, e)}
            />
            <button
              id="upload-master-gallery-btn"
              type="button"
              onClick={() => masterGalleryInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow hover:scale-[1.02] active:scale-[0.98]"
              title="Upload photos to permanently save them in the app"
            >
              <Upload className="w-3.5 h-3.5 text-emerald-100" />
              <span>Upload & Save Photos to App</span>
            </button>
          </div>
        </div>

        <p className="text-xs text-purple-300/80">
          Whatever photos you upload here are <strong className="text-emerald-300">permanently saved in the app</strong>. They stay saved even if you refresh or reopen the browser, and you can apply them to any of the 4 scenes with 1 click.
        </p>

        {/* Display Saved Custom Photos */}
        {customUploads.length > 0 ? (
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between text-[11px] text-purple-300">
              <span className="font-semibold text-emerald-300">
                Your Saved Photos ({customUploads.length}): Click any button below to assign to a scene
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 max-h-[220px] overflow-y-auto pr-1">
              {customUploads.map((item) => (
                <div
                  key={`saved-gallery-${item.id}`}
                  className="group relative rounded-xl overflow-hidden border border-emerald-500/40 bg-slate-900/90 p-1.5 flex flex-col shadow transition hover:border-emerald-400"
                >
                  <div className="relative aspect-[9/12] w-full rounded-lg overflow-hidden bg-black mb-1.5">
                    <img
                      src={item.imageUrl}
                      alt={item.label}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />

                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Remove "${item.label}" from saved app storage?`)) {
                          onDeleteCustomUpload(item.id);
                          showToast('Photo removed from saved app storage.');
                        }
                      }}
                      className="absolute top-1 right-1 p-1 rounded-full bg-red-950/80 hover:bg-red-600 text-red-300 hover:text-white transition shadow opacity-70 group-hover:opacity-100"
                      title="Delete this photo from app storage"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>

                  <span className="text-[10px] font-semibold text-slate-200 truncate block px-1">
                    {item.label}
                  </span>

                  {/* 1-Click Assign Buttons to Scene 1, 2, 3, 4 */}
                  <div className="grid grid-cols-4 gap-1 mt-1 pt-1 border-t border-purple-900/40 text-[9px]">
                    {[0, 1, 2, 3].map((sIdx) => (
                      <button
                        key={`assign-${item.id}-scene-${sIdx + 1}`}
                        type="button"
                        onClick={() => {
                          onUpdateScene(sIdx, { imageUrl: item.imageUrl });
                          showToast(`Applied photo to Scene ${sIdx + 1}!`);
                        }}
                        className={`py-0.5 rounded font-bold transition text-center ${
                          scenes[sIdx]?.imageUrl === item.imageUrl
                            ? 'bg-amber-400 text-slate-950'
                            : 'bg-purple-950/80 hover:bg-purple-900 text-purple-200 border border-purple-800/50'
                        }`}
                        title={`Apply to Scene ${sIdx + 1}`}
                      >
                        S{sIdx + 1}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-3 text-center rounded-lg bg-slate-900/60 border border-purple-900/40 text-purple-300/70 text-xs">
            No additional custom photos uploaded yet. Click <strong className="text-emerald-300">Upload & Save Photos to App</strong> to save your own wedding pictures.
          </div>
        )}
      </div>

      {/* List of 4 Story Scenes */}
      <div className="space-y-4">
        {scenes.map((scene, idx) => {
          const currentTab = sceneTab[idx] || 'hero';
          const displayOptions = getDisplayOptions(idx);
          const currentSearch = sceneSearch[idx] || '';

          return (
            <div
              key={scene.id}
              className="p-4 rounded-xl bg-slate-950/80 border border-purple-900/50 hover:border-purple-700/60 transition space-y-3.5"
            >
              {/* Top Bar: Scene Title, Tag, and Duration */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-purple-900/40">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-purple-950 text-amber-300 border border-purple-800/70">
                    Scene {scene.id}
                  </span>
                  <span className="text-xs font-bold text-white">
                    {scene.title || `Scene ${scene.id}`}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <div className="flex items-center gap-1 text-slate-400 bg-slate-900 px-2 py-1 rounded-lg border border-purple-900/40">
                    <Clock className="w-3.5 h-3.5 text-purple-400" />
                    <span className="text-[11px]">Duration:</span>
                    <input
                      id={`scene-${scene.id}-duration-input`}
                      type="number"
                      min="2"
                      max="15"
                      step="0.5"
                      value={scene.duration}
                      onChange={(e) =>
                        onUpdateScene(idx, { duration: parseFloat(e.target.value) || 5 })
                      }
                      className="w-12 px-1 py-0.5 rounded bg-slate-950 border border-purple-900/60 text-right text-purple-200 text-xs font-semibold outline-none focus:border-purple-400"
                    />
                    <span className="text-[11px]">s</span>
                  </div>
                </div>
              </div>

              {/* Scene Metadata: Title & Romantic Caption */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase font-bold text-purple-300/80 block">
                    Scene Headline
                  </label>
                  <input
                    id={`scene-${scene.id}-title-input`}
                    type="text"
                    value={scene.title}
                    onChange={(e) => onUpdateScene(idx, { title: e.target.value })}
                    className="w-full mt-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-purple-900/60 text-white font-semibold text-xs outline-none focus:border-amber-400 transition"
                    placeholder="e.g. Finally..."
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-purple-300/80 block">
                    Romantic Subtitle / Caption
                  </label>
                  <input
                    id={`scene-${scene.id}-subtitle-input`}
                    type="text"
                    value={scene.subtitle}
                    onChange={(e) => onUpdateScene(idx, { subtitle: e.target.value })}
                    className="w-full mt-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-purple-900/60 text-purple-200 text-xs outline-none focus:border-amber-400 transition"
                    placeholder="e.g. Two Hearts Dancing as One"
                  />
                </div>
              </div>

              {/* Dedicated 4 Uploaded Images Featured Strip for this Scene */}
              <div className="p-3 rounded-xl bg-gradient-to-r from-amber-950/30 via-purple-950/40 to-slate-900/90 border border-amber-500/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <Crown className="w-3.5 h-3.5 text-amber-400 fill-current" />
                    <span>Your 4 Uploaded Images (Select for Scene {scene.id}):</span>
                  </span>
                  <span className="text-[10px] text-amber-300/80 font-semibold bg-amber-950/60 px-2 py-0.5 rounded border border-amber-600/40">
                    1-Click Select
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {USER_UPLOADED_FOUR_HERO_SCENES.map((hero, hIdx) => {
                    const isSelected = scene.imageUrl === hero.imageUrl;

                    return (
                      <button
                        key={`hero-btn-${scene.id}-${hero.id}`}
                        id={`scene-${scene.id}-hero-${hero.id}`}
                        type="button"
                        onClick={() => onUpdateScene(idx, { imageUrl: hero.imageUrl })}
                        className={`group relative rounded-xl overflow-hidden border p-1 text-left flex flex-col transition shadow-md ${
                          isSelected
                            ? 'border-amber-400 ring-2 ring-amber-400/70 bg-amber-950/90'
                            : 'border-amber-900/40 bg-slate-900/90 hover:border-amber-400/60 hover:bg-purple-950/40'
                        }`}
                      >
                        {/* Thumbnail */}
                        <div className="relative aspect-[9/13] w-full rounded-lg overflow-hidden bg-black mb-1.5">
                          <img
                            src={hero.imageUrl}
                            alt={hero.label}
                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                            referrerPolicy="no-referrer"
                          />

                          {/* Active Indicator */}
                          {isSelected && (
                            <div className="absolute top-1 right-1 px-1.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[9px] font-black flex items-center gap-0.5 shadow-md">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                              <span>Active</span>
                            </div>
                          )}

                          <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-black/80 text-[9px] font-extrabold text-amber-300">
                            #{hIdx + 1}
                          </div>
                        </div>

                        {/* Title */}
                        <div className="px-1 pb-1">
                          <div
                            className={`text-[11px] font-bold leading-tight line-clamp-1 ${
                              isSelected ? 'text-amber-300' : 'text-slate-200 group-hover:text-white'
                            }`}
                          >
                            {hero.label}
                          </div>
                          <div className="text-[9px] text-purple-300/70 line-clamp-1 mt-0.5">
                            {hero.description}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dedicated Saved Custom Photos Strip for this Scene if any uploaded */}
              {customUploads.length > 0 && (
                <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-950/30 via-slate-900/90 to-purple-950/30 border border-emerald-500/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                      <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Your Saved Photos ({customUploads.length}) - Select for Scene {scene.id}:</span>
                    </span>
                    <span className="text-[10px] text-emerald-300/80 font-semibold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-600/40">
                      Saved in App
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 max-h-[160px] overflow-y-auto pr-1">
                    {customUploads.map((opt) => {
                      const isSelected = scene.imageUrl === opt.imageUrl;
                      return (
                        <button
                          key={`scene-${scene.id}-saved-fast-${opt.id}`}
                          type="button"
                          onClick={() => onUpdateScene(idx, { imageUrl: opt.imageUrl })}
                          className={`group relative rounded-xl overflow-hidden border p-1 text-left flex flex-col transition shadow-md ${
                            isSelected
                              ? 'border-emerald-400 ring-2 ring-emerald-400/70 bg-emerald-950/90'
                              : 'border-emerald-900/40 bg-slate-900/90 hover:border-emerald-400/60 hover:bg-emerald-950/30'
                          }`}
                        >
                          <div className="relative aspect-[9/12] w-full rounded-lg overflow-hidden bg-black mb-1">
                            <img
                              src={opt.imageUrl}
                              alt={opt.label}
                              className="w-full h-full object-cover transition-transform group-hover:scale-105"
                              referrerPolicy="no-referrer"
                            />
                            {isSelected && (
                              <div className="absolute top-1 right-1 px-1.5 py-0.5 rounded-full bg-emerald-400 text-slate-950 text-[9px] font-black flex items-center gap-0.5 shadow-md">
                                <Check className="w-2.5 h-2.5 stroke-[3]" />
                                <span>Active</span>
                              </div>
                            )}
                          </div>
                          <span className="text-[10px] font-semibold text-slate-200 truncate block px-0.5">
                            {opt.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Scenery Selection Section for this Scene */}
              <div className="pt-2 border-t border-purple-900/30 space-y-3">
                {/* Header label & Custom File Upload button */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="text-xs font-bold text-purple-200 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                    <span>Browse More Scenery Options for Scene {scene.id}:</span>
                  </label>

                  {/* Hidden file input and Upload button */}
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      ref={(el) => {
                        fileInputRefs.current[idx] = el;
                      }}
                      onChange={(e) => handleCustomImageUpload(idx, e)}
                    />
                    <button
                      id={`scene-${scene.id}-upload-custom-btn`}
                      type="button"
                      onClick={() => fileInputRefs.current[idx]?.click()}
                      className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded bg-slate-900 hover:bg-purple-950/80 border border-purple-700/60 text-purple-200 hover:text-white transition shadow-sm"
                    >
                      <Upload className="w-3 h-3 text-amber-400" />
                      <span>Upload & Save Photo</span>
                    </button>
                  </div>
                </div>

                {/* Filter Tabs & Search Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setSceneTab((prev) => ({ ...prev, [idx]: 'hero' }))}
                      className={`text-[11px] px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 transition ${
                        currentTab === 'hero'
                          ? 'bg-gradient-to-r from-amber-500 to-pink-500 text-slate-950 font-bold shadow-md ring-1 ring-amber-300'
                          : 'bg-slate-900 text-purple-200 hover:bg-slate-800 border border-purple-900/50'
                      }`}
                    >
                      <Crown className="w-3 h-3 text-amber-400 fill-current" />
                      <span>👑 4 Uploaded Images (4)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSceneTab((prev) => ({ ...prev, [idx]: 'custom' }))}
                      className={`text-[11px] px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 transition ${
                        currentTab === 'custom'
                          ? 'bg-emerald-600 text-white font-bold shadow-md'
                          : 'bg-slate-900 text-purple-200 hover:bg-slate-800 border border-purple-900/50'
                      }`}
                    >
                      <HardDrive className="w-3 h-3 text-emerald-400" />
                      <span>💾 Saved in App ({customUploads.length})</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSceneTab((prev) => ({ ...prev, [idx]: 'uploaded' }))}
                      className={`text-[11px] px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 transition ${
                        currentTab === 'uploaded'
                          ? 'bg-pink-600 text-white font-bold shadow-md'
                          : 'bg-slate-900 text-purple-200 hover:bg-slate-800 border border-purple-900/50'
                      }`}
                    >
                      <Heart className="w-3 h-3 text-pink-400 fill-current" />
                      <span>💖 All 17 Sacred Scenes ({ALL_UPLOADED_AND_SACRED_SCENES.length})</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSceneTab((prev) => ({ ...prev, [idx]: 'theme' }))}
                      className={`text-[11px] px-2.5 py-1 rounded-lg font-semibold transition ${
                        currentTab === 'theme'
                          ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                          : 'bg-slate-900 text-purple-200 hover:bg-slate-800 border border-purple-900/50'
                      }`}
                    >
                      ✨ {activeStateTheme.stateLabel} ({activeStateTheme.sceneryOptions.length + 4})
                    </button>

                    <button
                      type="button"
                      onClick={() => setSceneTab((prev) => ({ ...prev, [idx]: 'all' }))}
                      className={`text-[11px] px-2.5 py-1 rounded-lg font-semibold transition ${
                        currentTab === 'all'
                          ? 'bg-purple-600 text-white font-bold shadow-md'
                          : 'bg-slate-900 text-purple-200 hover:bg-slate-800 border border-purple-900/50'
                      }`}
                    >
                      🌟 All 30+ Scenes Library
                    </button>
                  </div>

                  {/* Search filter */}
                  <div className="relative w-full sm:w-48">
                    <Search className="w-3 h-3 text-purple-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={currentSearch}
                      onChange={(e) =>
                        setSceneSearch((prev) => ({ ...prev, [idx]: e.target.value }))
                      }
                      placeholder="Search scenery..."
                      className="w-full pl-7 pr-2 py-1 text-[11px] rounded-lg bg-slate-900 border border-purple-900/60 text-purple-100 placeholder-purple-400/50 outline-none focus:border-amber-400 transition"
                    />
                  </div>
                </div>

                {/* Scenery Options Grid */}
                {displayOptions.length === 0 ? (
                  <div className="p-6 text-center rounded-xl bg-slate-900/40 border border-purple-900/30 text-purple-300/70 text-xs">
                    No scenery found matching &ldquo;{currentSearch}&rdquo; in this tab.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 pt-1 max-h-[360px] overflow-y-auto pr-1">
                    {displayOptions.map((opt) => {
                      const isCurrent = scene.imageUrl === opt.imageUrl;

                      return (
                        <button
                          key={`${scene.id}-${opt.id}`}
                          id={`scene-${scene.id}-opt-${opt.id}`}
                          type="button"
                          onClick={() => onUpdateScene(idx, { imageUrl: opt.imageUrl })}
                          className={`group relative rounded-xl overflow-hidden border p-1 text-left flex flex-col transition shadow-md ${
                            isCurrent
                              ? 'border-amber-400 ring-2 ring-amber-400/50 bg-purple-950/90'
                              : 'border-purple-900/50 bg-slate-900/90 hover:border-purple-500/70 hover:bg-purple-950/40'
                          }`}
                        >
                          {/* Thumbnail Frame */}
                          <div className="relative aspect-[9/14] w-full rounded-lg overflow-hidden bg-black mb-1.5">
                            <img
                              src={opt.imageUrl}
                              alt={opt.label}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                              referrerPolicy="no-referrer"
                            />

                            {/* Active Badge */}
                            {isCurrent && (
                              <div className="absolute top-1 right-1 px-1.5 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[9px] font-black flex items-center gap-0.5 shadow-md">
                                <Check className="w-2.5 h-2.5 stroke-[3]" />
                                <span>Active</span>
                              </div>
                            )}

                            {/* Category Tag */}
                            <div
                              className={`absolute bottom-1 left-1 px-1.5 py-0.5 rounded text-[8px] uppercase font-bold border backdrop-blur-sm ${getCategoryBadgeColor(
                                opt.category
                              )}`}
                            >
                              {opt.category}
                            </div>

                            {/* Delete button if user upload */}
                            {opt.category === 'upload' && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (confirm(`Remove "${opt.label}" from saved app storage?`)) {
                                    onDeleteCustomUpload(opt.id);
                                    showToast('Photo removed from saved app storage.');
                                  }
                                }}
                                className="absolute top-1 left-1 p-1 rounded-full bg-red-950/90 hover:bg-red-600 text-red-300 hover:text-white transition shadow z-10"
                                title="Delete this photo from app storage"
                              >
                                <Trash2 className="w-2.5 h-2.5" />
                              </button>
                            )}

                            {/* Regional Theme Tag if present */}
                            {opt.themeName && (
                              <div className="absolute top-1 left-1 px-1 py-0.5 rounded bg-black/70 backdrop-blur-sm text-[8px] font-semibold text-purple-200 border border-white/10 max-w-[80%] truncate">
                                {opt.themeName}
                              </div>
                            )}
                          </div>

                          {/* Label & Description */}
                          <div className="px-1 pb-1">
                            <div
                              className={`text-[11px] font-bold leading-tight line-clamp-1 ${
                                isCurrent ? 'text-amber-300' : 'text-slate-200 group-hover:text-white'
                              }`}
                            >
                              {opt.label}
                            </div>
                            <div className="text-[9px] text-purple-300/70 line-clamp-1 mt-0.5">
                              {opt.description}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
