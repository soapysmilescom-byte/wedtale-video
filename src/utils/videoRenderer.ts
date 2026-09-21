import { CoupleData, SceneItem, AspectRatioType } from '../types';
import { formatRomanticDate } from './calendarExport';
import { romanticAudio } from './audioEngine';

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  color: string;
  type: 'petal' | 'bokeh' | 'sparkle' | 'gold-dust';
  rotation: number;
  rotSpeed: number;
}

export class VideoRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private imageCache: Map<string, HTMLImageElement> = new Map();
  private particles: Particle[] = [];
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Could not get 2D context');
    this.ctx = context;
    this.initParticles(60);
  }

  public resize(aspectRatio: AspectRatioType, isExport: boolean = false) {
    if (aspectRatio === '9:16') {
      this.canvas.width = isExport ? 1080 : 720;
      this.canvas.height = isExport ? 1920 : 1280;
    } else {
      this.canvas.width = isExport ? 1920 : 1280;
      this.canvas.height = isExport ? 1080 : 720;
    }
  }

  public async preloadImages(scenes: SceneItem[], extraUrls: string[] = []): Promise<void> {
    const urls = [...scenes.map(s => s.imageUrl), ...extraUrls].filter(Boolean);
    const promises = urls.map(url => {
      if (this.imageCache.has(url)) return Promise.resolve();
      return new Promise<void>((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          this.imageCache.set(url, img);
          resolve();
        };
        img.onerror = () => {
          console.warn(`Failed to load image: ${url}`);
          resolve();
        };
        img.src = url;
      });
    });
    await Promise.all(promises);
  }

  private initParticles(count: number) {
    this.particles = [];
    const colors = ['#f472b6', '#c084fc', '#fbbf24', '#fef08a', '#fbcfe8', '#e9d5ff'];
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * (this.canvas.width || 720),
        y: Math.random() * (this.canvas.height || 1280),
        vx: (Math.random() - 0.5) * 0.8,
        vy: 0.5 + Math.random() * 1.2,
        size: 3 + Math.random() * 8,
        opacity: 0.3 + Math.random() * 0.6,
        color: colors[Math.floor(Math.random() * colors.length)],
        type: Math.random() > 0.4 ? 'petal' : (Math.random() > 0.5 ? 'bokeh' : 'gold-dust'),
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.03,
      });
    }
  }

  private updateParticles() {
    const w = this.canvas.width;
    const h = this.canvas.height;
    for (const p of this.particles) {
      p.y += p.vy;
      p.x += p.vx + Math.sin(p.y * 0.01) * 0.4;
      p.rotation += p.rotSpeed;

      if (p.y > h + 20) {
        p.y = -20;
        p.x = Math.random() * w;
      }
      if (p.x < -20) p.x = w + 20;
      if (p.x > w + 20) p.x = -20;
    }
  }

  private drawParticles() {
    const ctx = this.ctx;
    for (const p of this.particles) {
      ctx.save();
      ctx.globalAlpha = p.opacity;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);

      if (p.type === 'petal') {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size * 1.5, p.size * 0.8, 0, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'bokeh') {
        const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, p.size * 2);
        grad.addColorStop(0, p.color);
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, p.size * 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Gold star sparkle
        ctx.fillStyle = '#fef08a';
        this.drawStar(ctx, 0, 0, 4, p.size, p.size * 0.3);
      }
      ctx.restore();
    }
  }

  private drawStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, spikes: number, outerR: number, innerR: number) {
    let rot = (Math.PI / 2) * 3;
    let x = cx;
    let y = cy;
    const step = Math.PI / spikes;

    ctx.beginPath();
    ctx.moveTo(cx, cy - outerR);
    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerR;
      y = cy + Math.sin(rot) * outerR;
      ctx.lineTo(x, y);
      rot += step;

      x = cx + Math.cos(rot) * innerR;
      y = cy + Math.sin(rot) * innerR;
      ctx.lineTo(x, y);
      rot += step;
    }
    ctx.lineTo(cx, cy - outerR);
    ctx.closePath();
    ctx.fill();
  }

  // Draw romantic frame with Ken Burns zoom, overlay, vignette, and captions
  public renderFrame(
    currentTime: number,
    scenes: SceneItem[],
    couple: CoupleData,
    invitationBgUrl?: string
  ) {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    // Determine active scene and local time
    let accumulatedTime = 0;
    let activeSceneIndex = 0;
    let sceneLocalTime = 0;
    const totalDuration = scenes.reduce((acc, s) => acc + s.duration, 0);
    const clampedTime = Math.max(0, Math.min(currentTime, totalDuration - 0.001));

    for (let i = 0; i < scenes.length; i++) {
      const s = scenes[i];
      if (clampedTime >= accumulatedTime && clampedTime < accumulatedTime + s.duration) {
        activeSceneIndex = i;
        sceneLocalTime = clampedTime - accumulatedTime;
        break;
      }
      accumulatedTime += s.duration;
    }

    const currentScene = scenes[activeSceneIndex];
    const progressInScene = sceneLocalTime / currentScene.duration;

    // Clear canvas with dark elegant twilight background
    ctx.fillStyle = '#090514';
    ctx.fillRect(0, 0, w, h);

    // Ken Burns camera scale & subtle pan
    const scale = 1.0 + progressInScene * 0.08;
    const panY = Math.sin(progressInScene * Math.PI) * 15;

    // Draw scene image
    let img = this.imageCache.get(currentScene.imageUrl);
    if (!img) {
      const fallbackImg = new Image();
      fallbackImg.crossOrigin = 'anonymous';
      fallbackImg.src = currentScene.imageUrl;
      fallbackImg.onload = () => {
        this.imageCache.set(currentScene.imageUrl, fallbackImg);
      };
      this.imageCache.set(currentScene.imageUrl, fallbackImg);
      img = fallbackImg;
    }

    if (img && img.complete && img.naturalWidth > 0) {
      ctx.save();
      ctx.translate(w / 2, h / 2);
      ctx.scale(scale, scale);
      ctx.translate(-w / 2, -h / 2 + panY);

      // Draw image to cover
      const imgRatio = img.width / img.height;
      const canvasRatio = w / h;
      let drawW = w;
      let drawH = h;
      let offsetX = 0;
      let offsetY = 0;

      if (imgRatio > canvasRatio) {
        drawH = h;
        drawW = h * imgRatio;
        offsetX = (w - drawW) / 2;
      } else {
        drawW = w;
        drawH = w / imgRatio;
        offsetY = (h - drawH) / 2;
      }

      ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
      ctx.restore();
    } else {
      // Fallback gradient if image not cached yet
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, '#2e1065');
      grad.addColorStop(0.5, '#4c1d95');
      grad.addColorStop(1, '#1e1b4b');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
    }

    // Vignette / Cinematic shadow on top and bottom for readability
    const topVignette = ctx.createLinearGradient(0, 0, 0, h * 0.35);
    topVignette.addColorStop(0, 'rgba(10, 5, 20, 0.85)');
    topVignette.addColorStop(0.6, 'rgba(10, 5, 20, 0.45)');
    topVignette.addColorStop(1, 'transparent');
    ctx.fillStyle = topVignette;
    ctx.fillRect(0, 0, w, h * 0.35);

    const bottomVignette = ctx.createLinearGradient(0, h * 0.55, 0, h);
    bottomVignette.addColorStop(0, 'transparent');
    bottomVignette.addColorStop(0.4, 'rgba(10, 5, 20, 0.65)');
    bottomVignette.addColorStop(1, 'rgba(10, 5, 20, 0.95)');
    ctx.fillStyle = bottomVignette;
    ctx.fillRect(0, h * 0.55, w, h * 0.45);

    // Particle dynamics
    this.updateParticles();
    this.drawParticles();

    // Scene specific effects and titles
    if (currentScene.tag === 'scene1') {
      // Scene 1: "Finally" - Proposal sparkle at the ring
      this.drawProposalDiamondSparkle(w * 0.52, h * 0.48, progressInScene);
      this.drawScene1Overlays(currentScene, couple, progressInScene);
    } else if (currentScene.tag === 'scene2') {
      // Scene 2: "Wait is Over"
      this.drawScene2Overlays(currentScene, couple, progressInScene);
    } else if (currentScene.tag === 'scene3') {
      // Scene 3: "We are making it official"
      this.drawScene3Overlays(currentScene, couple, progressInScene);
    } else if (currentScene.tag === 'scene4') {
      // Scene 4: "We are getting married" - The Royal Wedding Card & Date
      this.drawScene4Overlays(currentScene, couple, progressInScene);
    }

    // Crossfade at the end of each scene (last 0.5s)
    const fadeDuration = 0.5;
    const timeRemaining = currentScene.duration - sceneLocalTime;
    if (timeRemaining < fadeDuration && activeSceneIndex < scenes.length - 1) {
      const fadeAlpha = (fadeDuration - timeRemaining) / fadeDuration;
      ctx.fillStyle = `rgba(15, 8, 30, ${fadeAlpha * 0.8})`;
      ctx.fillRect(0, 0, w, h);
    }
  }

  // Sparkling diamond flare animation for Proposal scene
  private drawProposalDiamondSparkle(cx: number, cy: number, progress: number) {
    const ctx = this.ctx;
    const pulse = Math.sin(progress * Math.PI * 6);
    const flareSize = 25 + pulse * 12;

    ctx.save();
    ctx.translate(cx, cy);

    // Outer warm diamond glow
    const glow = ctx.createRadialGradient(0, 0, 2, 0, 0, flareSize * 2.5);
    glow.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
    glow.addColorStop(0.2, 'rgba(216, 180, 254, 0.8)');
    glow.addColorStop(0.6, 'rgba(234, 179, 8, 0.3)');
    glow.addColorStop(1, 'transparent');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(0, 0, flareSize * 2.5, 0, Math.PI * 2);
    ctx.fill();

    // 4-point glittering star spikes
    ctx.fillStyle = '#ffffff';
    this.drawStar(ctx, 0, 0, 4, flareSize * 1.8, flareSize * 0.15);

    // Diagonals
    ctx.rotate(Math.PI / 4);
    ctx.fillStyle = 'rgba(255, 240, 180, 0.8)';
    this.drawStar(ctx, 0, 0, 4, flareSize * 1.1, flareSize * 0.12);

    ctx.restore();
  }

  private drawScene1Overlays(scene: SceneItem, couple: CoupleData, progress: number) {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const isMobileAspect = h > w;

    // Header Badge: Scene 1 • The Proposal
    const animAlpha = Math.min(1, progress * 3);
    ctx.save();
    ctx.globalAlpha = animAlpha;

    // Top Title: Dynamic Scene Title
    ctx.textAlign = 'center';
    ctx.fillStyle = '#fef08a';
    ctx.shadowColor = 'rgba(234, 179, 8, 0.8)';
    ctx.shadowBlur = 18;
    ctx.font = isMobileAspect ? 'bold 44px Cinzel, serif' : 'bold 36px Cinzel, serif';
    ctx.fillText((scene.title || 'FINALLY...').toUpperCase(), w / 2, isMobileAspect ? h * 0.12 : h * 0.15);

    // Subtitle
    ctx.fillStyle = '#fdf4ff';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = 8;
    ctx.font = isMobileAspect ? 'italic 26px "Great Vibes", cursive' : 'italic 22px "Great Vibes", cursive';
    ctx.fillText(scene.subtitle || 'The moment our forever began', w / 2, isMobileAspect ? h * 0.16 : h * 0.20);

    // Bottom Action Card
    const bottomY = isMobileAspect ? h * 0.84 : h * 0.82;
    ctx.fillStyle = '#ffffff';
    ctx.font = isMobileAspect ? '600 22px "Plus Jakarta Sans", sans-serif' : '600 18px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(scene.actionText || `${couple.groomName} got down on one knee...`, w / 2, bottomY);

    ctx.fillStyle = '#f472b6';
    ctx.font = isMobileAspect ? 'bold 34px "Great Vibes", cursive' : 'bold 28px "Great Vibes", cursive';
    ctx.fillText(`...and ${couple.brideName} said YES! 💍`, w / 2, bottomY + 45);

    ctx.restore();
  }

  private drawScene2Overlays(scene: SceneItem, couple: CoupleData, progress: number) {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const isMobileAspect = h > w;
    const animAlpha = Math.min(1, progress * 3);

    ctx.save();
    ctx.globalAlpha = animAlpha;
    ctx.textAlign = 'center';

    // Top Title: Dynamic Scene Title
    ctx.fillStyle = '#fed7aa';
    ctx.shadowColor = 'rgba(251, 146, 60, 0.7)';
    ctx.shadowBlur = 16;
    ctx.font = isMobileAspect ? 'bold 44px Cinzel, serif' : 'bold 36px Cinzel, serif';
    ctx.fillText((scene.title || 'THE WAIT IS OVER').toUpperCase(), w / 2, isMobileAspect ? h * 0.12 : h * 0.15);

    ctx.fillStyle = '#fdf4ff';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = 8;
    ctx.font = isMobileAspect ? 'italic 26px "Great Vibes", cursive' : 'italic 22px "Great Vibes", cursive';
    ctx.fillText(scene.subtitle || 'Lost in the magic of our celebration', w / 2, isMobileAspect ? h * 0.16 : h * 0.20);

    // Bottom Card
    const bottomY = isMobileAspect ? h * 0.84 : h * 0.82;
    ctx.fillStyle = '#fef08a';
    ctx.font = isMobileAspect ? '600 22px "Plus Jakarta Sans", sans-serif' : '600 18px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(scene.actionText || 'Every love story is beautiful,', w / 2, bottomY);

    ctx.fillStyle = '#ffffff';
    ctx.font = isMobileAspect ? 'bold 32px "Great Vibes", cursive' : 'bold 26px "Great Vibes", cursive';
    ctx.fillText('...but ours is our favorite ✨', w / 2, bottomY + 40);

    ctx.restore();
  }

  private drawScene3Overlays(scene: SceneItem, couple: CoupleData, progress: number) {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const isMobileAspect = h > w;
    const animAlpha = Math.min(1, progress * 3);

    ctx.save();
    ctx.globalAlpha = animAlpha;
    ctx.textAlign = 'center';

    // Top Title: Dynamic Scene Title
    ctx.fillStyle = '#fef08a';
    ctx.shadowColor = 'rgba(234, 179, 8, 0.8)';
    ctx.shadowBlur = 16;
    ctx.font = isMobileAspect ? 'bold 40px Cinzel, serif' : 'bold 34px Cinzel, serif';
    ctx.fillText((scene.title || 'WE ARE MAKING IT OFFICIAL').toUpperCase(), w / 2, isMobileAspect ? h * 0.12 : h * 0.14);

    // Couple names in script
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(216, 180, 254, 0.9)';
    ctx.shadowBlur = 12;
    ctx.font = isMobileAspect ? 'bold 52px "Great Vibes", cursive' : 'bold 42px "Great Vibes", cursive';
    ctx.fillText(`${couple.brideName}  &  ${couple.groomName}`, w / 2, isMobileAspect ? h * 0.19 : h * 0.22);

    // Bottom announcement
    const bottomY = isMobileAspect ? h * 0.83 : h * 0.80;
    ctx.fillStyle = '#fef08a';
    ctx.font = isMobileAspect ? 'bold 22px Cinzel, serif' : 'bold 18px Cinzel, serif';
    ctx.fillText(scene.subtitle?.toUpperCase() || couple.ceremonyType.toUpperCase() || 'WEDDING CELEBRATION', w / 2, bottomY);

    ctx.fillStyle = '#fdf4ff';
    ctx.font = isMobileAspect ? '19px "Plus Jakarta Sans", sans-serif' : '17px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(scene.actionText || 'Hand in hand, stepping into forever together', w / 2, bottomY + 36);

    ctx.restore();
  }

  // Scene 4: "We Are Getting Married" - Royal Wedding Invitation Card with Date & Venue
  private drawScene4Overlays(scene: SceneItem, couple: CoupleData, progress: number) {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const isMobileAspect = h > w;
    const animAlpha = Math.min(1, progress * 2.5);

    ctx.save();
    ctx.globalAlpha = animAlpha;

    // Card background panel (soft royal glass card with gold borders)
    const cardMarginX = isMobileAspect ? w * 0.07 : w * 0.22;
    const cardTopY = isMobileAspect ? h * 0.08 : h * 0.08;
    const cardW = w - cardMarginX * 2;
    const cardH = isMobileAspect ? h * 0.84 : h * 0.84;

    // Soft glass background
    ctx.fillStyle = 'rgba(18, 10, 32, 0.85)';
    ctx.beginPath();
    ctx.roundRect(cardMarginX, cardTopY, cardW, cardH, 20);
    ctx.fill();

    // Dual Gold Border
    ctx.strokeStyle = 'rgba(234, 179, 8, 0.75)';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.strokeStyle = 'rgba(254, 240, 138, 0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(cardMarginX + 8, cardTopY + 8, cardW - 16, cardH - 16, 16);
    ctx.stroke();

    // Corner Ornate Lotus accents
    this.drawCornerLotus(cardMarginX + 24, cardTopY + 24, 0);
    this.drawCornerLotus(cardMarginX + cardW - 24, cardTopY + 24, Math.PI / 2);
    this.drawCornerLotus(cardMarginX + cardW - 24, cardTopY + cardH - 24, Math.PI);
    this.drawCornerLotus(cardMarginX + 24, cardTopY + cardH - 24, -Math.PI / 2);

    ctx.textAlign = 'center';

    // 1. Blessing Header: "|| Shree Ganeshay Namah ||"
    let currentY = cardTopY + 50;
    ctx.fillStyle = '#fef08a';
    ctx.font = isMobileAspect ? '600 18px Cinzel, serif' : '600 16px Cinzel, serif';
    ctx.fillText(couple.blessingHeader || '|| Shree Ganeshay Namah ||', w / 2, currentY);

    // 2. Main Title: "WE ARE GETTING MARRIED"
    currentY += 45;
    ctx.fillStyle = '#fef08a';
    ctx.shadowColor = 'rgba(234, 179, 8, 0.9)';
    ctx.shadowBlur = 18;
    ctx.font = isMobileAspect ? 'bold 36px Cinzel, serif' : 'bold 30px Cinzel, serif';
    ctx.fillText('WE ARE GETTING MARRIED', w / 2, currentY);

    // 3. Cordial Invitation line
    currentY += 38;
    ctx.fillStyle = '#e9d5ff';
    ctx.shadowBlur = 0;
    ctx.font = isMobileAspect ? 'italic 19px "Cormorant Garamond", serif' : 'italic 17px "Cormorant Garamond", serif';
    ctx.fillText('You are cordially invited to grace the auspicious ceremony of', w / 2, currentY);

    // 4. Groom & Bride Names with Parents
    currentY += 50;
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(254, 240, 138, 0.8)';
    ctx.shadowBlur = 12;
    ctx.font = isMobileAspect ? 'bold 46px "Great Vibes", cursive' : 'bold 38px "Great Vibes", cursive';
    ctx.fillText(couple.groomName, w / 2, currentY);

    if (couple.parentsGroom) {
      currentY += 26;
      ctx.fillStyle = '#d8b4fe';
      ctx.shadowBlur = 0;
      ctx.font = isMobileAspect ? '14px "Plus Jakarta Sans", sans-serif' : '13px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(`S/o ${couple.parentsGroom}`, w / 2, currentY);
    }

    // Intertwined Golden Wedding Rings graphic
    currentY += 38;
    this.drawIntertwinedRings(w / 2, currentY, 18);

    currentY += 46;
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(254, 240, 138, 0.8)';
    ctx.shadowBlur = 12;
    ctx.font = isMobileAspect ? 'bold 46px "Great Vibes", cursive' : 'bold 38px "Great Vibes", cursive';
    ctx.fillText(couple.brideName, w / 2, currentY);

    if (couple.parentsBride) {
      currentY += 26;
      ctx.fillStyle = '#d8b4fe';
      ctx.shadowBlur = 0;
      ctx.font = isMobileAspect ? '14px "Plus Jakarta Sans", sans-serif' : '13px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(`D/o ${couple.parentsBride}`, w / 2, currentY);
    }

    // 5. Highlighted Date Box
    currentY += 48;
    const dateBoxW = cardW * 0.82;
    const dateBoxH = isMobileAspect ? 90 : 75;
    const dateBoxX = (w - dateBoxW) / 2;

    const dateGrad = ctx.createLinearGradient(dateBoxX, currentY, dateBoxX + dateBoxW, currentY);
    dateGrad.addColorStop(0, 'rgba(147, 51, 234, 0.4)');
    dateGrad.addColorStop(0.5, 'rgba(234, 179, 8, 0.25)');
    dateGrad.addColorStop(1, 'rgba(147, 51, 234, 0.4)');
    ctx.fillStyle = dateGrad;
    ctx.beginPath();
    ctx.roundRect(dateBoxX, currentY, dateBoxW, dateBoxH, 12);
    ctx.fill();

    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Date Text Inside Box
    const formattedDate = formatRomanticDate(couple.weddingDate);
    ctx.fillStyle = '#fef08a';
    ctx.shadowColor = 'rgba(234, 179, 8, 0.8)';
    ctx.shadowBlur = 10;
    ctx.font = isMobileAspect ? 'bold 24px Cinzel, serif' : 'bold 20px Cinzel, serif';
    ctx.fillText(formattedDate.toUpperCase(), w / 2, currentY + 36);

    ctx.fillStyle = '#ffffff';
    ctx.shadowBlur = 0;
    ctx.font = isMobileAspect ? '600 16px "Plus Jakarta Sans", sans-serif' : '600 14px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(`⏰  ${couple.weddingTime || '5:00 PM onwards'}`, w / 2, currentY + 68);

    // 6. Venue & City
    currentY += dateBoxH + 34;
    ctx.fillStyle = '#fdf4ff';
    ctx.font = isMobileAspect ? '600 18px "Plus Jakarta Sans", sans-serif' : '600 16px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(`📍 ${couple.venue}`, w / 2, currentY);

    currentY += 24;
    ctx.fillStyle = '#cbd5e1';
    ctx.font = isMobileAspect ? '16px "Plus Jakarta Sans", sans-serif' : '14px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(couple.city, w / 2, currentY);

    // 7. Save Our Date Footer
    currentY += 32;
    ctx.fillStyle = '#fbbf24';
    ctx.font = isMobileAspect ? 'bold 18px Cinzel, serif' : 'bold 16px Cinzel, serif';
    ctx.fillText('✨ SAVE OUR DATE ✨', w / 2, currentY);

    ctx.restore();
  }

  private drawCornerLotus(x: number, y: number, angle: number) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.strokeStyle = '#fef08a';
    ctx.fillStyle = 'rgba(254, 240, 138, 0.3)';
    ctx.lineWidth = 1.5;

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(15, -5, 20, -20);
    ctx.quadraticCurveTo(5, -15, 0, 0);
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }

  private drawIntertwinedRings(cx: number, cy: number, r: number) {
    const ctx = this.ctx;
    ctx.save();
    ctx.lineWidth = 3.5;
    ctx.strokeStyle = '#fbbf24';
    ctx.shadowColor = 'rgba(251, 191, 36, 0.8)';
    ctx.shadowBlur = 8;

    // Left Ring
    ctx.beginPath();
    ctx.arc(cx - r * 0.55, cy, r, 0, Math.PI * 2);
    ctx.stroke();

    // Right Ring
    ctx.beginPath();
    ctx.arc(cx + r * 0.55, cy, r, 0, Math.PI * 2);
    ctx.stroke();

    // Tiny Diamond on top
    ctx.fillStyle = '#ffffff';
    this.drawStar(ctx, cx - r * 0.55, cy - r, 4, 6, 2);

    ctx.restore();
  }

  // Export high-resolution Invitation Card (PNG / JPG)
  public exportInvitationCardDataUrl(
    couple: CoupleData,
    aspectRatio: AspectRatioType = '9:16',
    scene4?: SceneItem
  ): string {
    // Temporarily resize canvas to high-res export
    const prevW = this.canvas.width;
    const prevH = this.canvas.height;
    this.resize(aspectRatio, true);

    const targetScene: SceneItem = scene4 || {
      id: 4,
      tag: 'scene4',
      title: 'We Are Getting Married',
      subtitle: 'Save Our Date',
      actionText: '',
      imageUrl: '',
      duration: 5,
    };

    // Draw full Scene 4 card
    this.renderFrame(1.0, [targetScene], couple);
    const dataUrl = this.canvas.toDataURL('image/png');

    // Restore canvas dimensions
    this.canvas.width = prevW;
    this.canvas.height = prevH;
    return dataUrl;
  }

  // Export Full Video Recording as WebM / MP4 file
  public async exportVideo(
    scenes: SceneItem[],
    couple: CoupleData,
    aspectRatio: AspectRatioType,
    onProgress: (pct: number) => void
  ): Promise<Blob> {
    this.resize(aspectRatio, true);
    await this.preloadImages(scenes);

    const totalDuration = scenes.reduce((acc, s) => acc + s.duration, 0);
    const fps = 30;
    const totalFrames = Math.floor(totalDuration * fps);

    // Get canvas stream
    const canvasStream = (this.canvas as any).captureStream ? (this.canvas as any).captureStream(fps) : null;
    if (!canvasStream) {
      throw new Error('Canvas captureStream is not supported in this browser.');
    }

    // Connect synthesized romantic audio stream if available
    const audioTrack = romanticAudio.getAudioStream();
    if (audioTrack) {
      canvasStream.addTrack(audioTrack);
      romanticAudio.start();
    }

    // Supported mime type fallback
    let mimeType = 'video/webm;codecs=vp9';
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = 'video/webm;codecs=vp8';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/webm';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = '';
        }
      }
    }

    this.recordedChunks = [];
    this.mediaRecorder = mimeType
      ? new MediaRecorder(canvasStream, { mimeType, videoBitsPerSecond: 4000000 })
      : new MediaRecorder(canvasStream);

    this.mediaRecorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        this.recordedChunks.push(e.data);
      }
    };

    const recordPromise = new Promise<Blob>((resolve, reject) => {
      this.mediaRecorder!.onstop = () => {
        const blob = new Blob(this.recordedChunks, { type: mimeType || 'video/webm' });
        romanticAudio.stop();
        resolve(blob);
      };
      this.mediaRecorder!.onerror = (err) => {
        romanticAudio.stop();
        reject(err);
      };
    });

    this.mediaRecorder.start(100);

    // Render frame-by-frame in real-time pace
    const frameInterval = 1000 / fps;
    for (let f = 0; f < totalFrames; f++) {
      const time = f / fps;
      this.renderFrame(time, scenes, couple);
      onProgress(Math.round((f / totalFrames) * 100));
      await new Promise(r => setTimeout(r, frameInterval));
    }

    onProgress(100);
    this.mediaRecorder.stop();
    return recordPromise;
  }
}
