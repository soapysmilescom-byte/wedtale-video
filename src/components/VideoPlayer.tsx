import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Sparkles,
  Smartphone,
  Tv,
  Film,
  Download,
  Calendar,
  Layers,
} from 'lucide-react';
import { CoupleData, SceneItem, AspectRatioType, MusicTheme } from '../types';
import { VideoRenderer } from '../utils/videoRenderer';
import { romanticAudio } from '../utils/audioEngine';

interface VideoPlayerProps {
  scenes: SceneItem[];
  couple: CoupleData;
  aspectRatio: AspectRatioType;
  onAspectRatioChange: (ratio: AspectRatioType) => void;
  onOpenDownloadModal: () => void;
  onOpenVideoExport: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  scenes,
  couple,
  aspectRatio,
  onAspectRatioChange,
  onOpenDownloadModal,
  onOpenVideoExport,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rendererRef = useRef<VideoRenderer | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const lastTimestampRef = useRef<number | null>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(false);
  const [musicTheme, setMusicTheme] = useState<MusicTheme>('romantic-waltz');
  const [volume, setVolume] = useState<number>(0.6);

  const totalDuration = scenes.reduce((acc, s) => acc + s.duration, 0);

  // Determine active scene index based on currentTime
  let activeSceneIndex = 0;
  let accumulated = 0;
  for (let i = 0; i < scenes.length; i++) {
    if (currentTime >= accumulated && currentTime < accumulated + scenes[i].duration) {
      activeSceneIndex = i;
      break;
    }
    accumulated += scenes[i].duration;
  }
  const currentScene = scenes[activeSceneIndex] || scenes[0];

  // Initialize renderer
  useEffect(() => {
    if (!canvasRef.current) return;
    const renderer = new VideoRenderer(canvasRef.current);
    renderer.resize(aspectRatio, false);
    renderer.preloadImages(scenes);
    rendererRef.current = renderer;

    // Start background audio if not muted
    if (!isAudioMuted) {
      romanticAudio.start();
    }

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [aspectRatio]);

  // Keep images preloaded when scenes change
  useEffect(() => {
    if (rendererRef.current) {
      rendererRef.current.preloadImages(scenes);
    }
  }, [scenes]);

  // Animation Loop
  const tick = useCallback(
    (timestamp: number) => {
      if (!lastTimestampRef.current) lastTimestampRef.current = timestamp;
      const delta = (timestamp - lastTimestampRef.current) / 1000;
      lastTimestampRef.current = timestamp;

      setCurrentTime((prev) => {
        let next = prev;
        if (isPlaying) {
          next = prev + delta;
          if (next >= totalDuration) {
            next = 0; // Loop seamlessly
          }
        }
        if (rendererRef.current) {
          rendererRef.current.renderFrame(next, scenes, couple);
        }
        return next;
      });

      animFrameRef.current = requestAnimationFrame(tick);
    },
    [isPlaying, scenes, couple, totalDuration]
  );

  useEffect(() => {
    animFrameRef.current = requestAnimationFrame(tick);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [tick]);

  const togglePlay = () => {
    setIsPlaying((prev) => {
      const next = !prev;
      if (next && !isAudioMuted) {
        romanticAudio.start();
      } else {
        romanticAudio.stop();
      }
      return next;
    });
  };

  const restartVideo = () => {
    setCurrentTime(0);
    lastTimestampRef.current = performance.now();
    setIsPlaying(true);
    if (!isAudioMuted) {
      romanticAudio.start();
      romanticAudio.playSparkleChime();
    }
  };

  const jumpToScene = (sceneIndex: number) => {
    let t = 0;
    for (let i = 0; i < sceneIndex; i++) {
      t += scenes[i].duration;
    }
    setCurrentTime(t);
    lastTimestampRef.current = performance.now();
    if (sceneIndex === 0) {
      romanticAudio.playSparkleChime();
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    lastTimestampRef.current = performance.now();
    if (rendererRef.current) {
      rendererRef.current.renderFrame(newTime, scenes, couple);
    }
  };

  const toggleMute = () => {
    setIsAudioMuted((prev) => {
      const next = !prev;
      if (next) {
        romanticAudio.stop();
      } else if (isPlaying) {
        romanticAudio.start();
      }
      return next;
    });
  };

  const handleThemeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const th = e.target.value as MusicTheme;
    setMusicTheme(th);
    romanticAudio.setTheme(th);
  };

  const formatTimecode = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-slate-900/90 backdrop-blur-md rounded-2xl border border-purple-900/40 p-4 sm:p-5 shadow-2xl flex flex-col items-center">
      {/* Top Header Bar */}
      <div className="w-full flex items-center justify-between pb-3 mb-2 border-b border-purple-900/30">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-xs font-bold uppercase tracking-wider text-purple-200">
            Pixar Video Studio Live Preview
          </span>
        </div>

        {/* Aspect Ratio Selector */}
        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-purple-800/40">
          <button
            type="button"
            onClick={() => onAspectRatioChange('9:16')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              aspectRatio === '9:16'
                ? 'bg-purple-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
            title="9:16 Mobile Reel / Story format"
          >
            <Smartphone className="w-3.5 h-3.5" />
            9:16 Reel
          </button>
          <button
            type="button"
            onClick={() => onAspectRatioChange('16:9')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              aspectRatio === '16:9'
                ? 'bg-purple-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
            title="16:9 Cinematic Landscape"
          >
            <Tv className="w-3.5 h-3.5" />
            16:9 Cinema
          </button>
        </div>
      </div>

      {/* Video Canvas Container */}
      <div
        className={`relative overflow-hidden rounded-2xl shadow-2xl border border-purple-500/30 bg-black flex items-center justify-center transition-all duration-300 ${
          aspectRatio === '9:16'
            ? 'w-[290px] sm:w-[340px] md:w-[370px] aspect-[9/16]'
            : 'w-full max-w-[640px] aspect-[16/9]'
        }`}
      >
        <canvas
          ref={canvasRef}
          className="w-full h-full object-contain cursor-pointer"
          onClick={togglePlay}
        />

        {/* Floating Active Scene Badge */}
        <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-purple-500/40 text-[11px] font-semibold text-amber-300 flex items-center gap-1.5 shadow-lg pointer-events-none">
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span>Scene {currentScene.id}: {currentScene.title}</span>
        </div>

        {/* Play Overlay Hint when paused */}
        {!isPlaying && (
          <button
            type="button"
            onClick={togglePlay}
            className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-purple-600/80 hover:bg-purple-500 text-white flex items-center justify-center shadow-2xl backdrop-blur-sm transition hover:scale-110 active:scale-95"
            aria-label="Play Video"
          >
            <Play className="w-8 h-8 fill-current ml-1" />
          </button>
        )}
      </div>

      {/* Scrubber Timeline & Scene Markers */}
      <div className="w-full max-w-xl mt-4 space-y-2">
        {/* Scene Jump Pills */}
        <div className="grid grid-cols-4 gap-1.5 text-center">
          {scenes.map((s, idx) => (
            <button
              key={s.id}
              type="button"
              onClick={() => jumpToScene(idx)}
              className={`py-1.5 px-2 rounded-lg text-[10px] sm:text-[11px] font-bold truncate transition border ${
                activeSceneIndex === idx
                  ? 'bg-purple-600/90 text-white border-amber-400 shadow-md shadow-purple-900/40'
                  : 'bg-slate-950/70 hover:bg-purple-950/60 text-slate-300 border-purple-900/40'
              }`}
              title={`Jump to Scene ${s.id}: ${s.title}`}
            >
              Scene {s.id}: {s.title.replace('...', '')}
            </button>
          ))}
        </div>

        {/* Scrubber Slider */}
        <div className="flex items-center gap-2 pt-1">
          <span className="text-[11px] font-mono text-purple-300 w-10 text-right">
            {formatTimecode(currentTime)}
          </span>
          <input
            type="range"
            min="0"
            max={totalDuration}
            step="0.05"
            value={currentTime}
            onChange={handleSeek}
            className="flex-1 accent-amber-400 cursor-pointer h-1.5 rounded-lg bg-purple-950/80"
          />
          <span className="text-[11px] font-mono text-slate-400 w-10">
            {formatTimecode(totalDuration)}
          </span>
        </div>
      </div>

      {/* Control Bar & Audio Synthesizer Controls */}
      <div className="w-full max-w-xl flex flex-wrap items-center justify-between gap-3 pt-3 mt-2 border-t border-purple-900/30">
        {/* Play / Pause / Restart */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={togglePlay}
            className="p-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white shadow-md active:scale-95 transition"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
          </button>

          <button
            type="button"
            onClick={restartVideo}
            className="p-2.5 rounded-xl bg-slate-950 hover:bg-purple-950 text-slate-300 hover:text-white border border-purple-900/40 transition"
            title="Replay from start"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => romanticAudio.playSparkleChime()}
            className="px-2.5 py-1.5 rounded-xl bg-slate-950 hover:bg-purple-950 text-amber-300 text-xs border border-amber-500/40 flex items-center gap-1 transition"
            title="Ring sparkle chime"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Twinkle
          </button>
        </div>

        {/* Music Controls */}
        <div className="flex items-center gap-2 text-xs">
          <button
            type="button"
            onClick={toggleMute}
            className={`p-2 rounded-xl border transition ${
              isAudioMuted
                ? 'bg-rose-950/60 border-rose-800/60 text-rose-300'
                : 'bg-purple-950/60 border-purple-800/60 text-purple-300'
            }`}
            title={isAudioMuted ? 'Unmute romantic music' : 'Mute music'}
          >
            {isAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          <select
            value={musicTheme}
            onChange={handleThemeChange}
            className="px-2.5 py-1.5 rounded-xl bg-slate-950 border border-purple-800/50 text-purple-200 text-xs outline-none"
            title="Romantic background theme"
          >
            <option value="romantic-waltz">🎻 Romantic Waltz</option>
            <option value="fairytale-ballad">✨ Fairytale Ballad</option>
            <option value="celestial-piano">🎹 Celestial Piano</option>
            <option value="festive-sangeet">🎉 Festive Sangeet</option>
          </select>
        </div>
      </div>

      {/* Primary Export Actions (Download Video + Download Date) */}
      <div className="w-full max-w-xl grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 pt-3 border-t border-purple-900/30">
        <button
          type="button"
          onClick={onOpenVideoExport}
          className="py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:from-purple-500 hover:via-pink-500 hover:to-amber-400 text-white font-bold text-sm shadow-xl shadow-purple-900/40 flex items-center justify-center gap-2 active:scale-[0.99] transition"
        >
          <Film className="w-4 h-4" />
          Download 3D Video (MP4/WebM)
        </button>

        <button
          type="button"
          onClick={onOpenDownloadModal}
          className="py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-pink-600 hover:from-amber-400 hover:to-pink-500 text-slate-950 font-bold text-sm shadow-xl shadow-amber-900/30 flex items-center justify-center gap-2 active:scale-[0.99] transition"
        >
          <Calendar className="w-4 h-4 text-slate-950" />
          Download Date & Save The Date Card
        </button>
      </div>
    </div>
  );
};
