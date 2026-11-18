import type {
  CloudItem,
  FallingFood,
  FloatingText,
  FoodId,
  MonsterMood,
  Particle,
} from './types';

export interface MonsterRenderState {
  x: number;
  y: number;
  width: number;
  height: number;
  vx: number;
  squashX: number;
  squashY: number;
  mood: MonsterMood;
  moodTimer: number;
  blinkTimer: number;
  isBlinking: boolean;
  mouthOpenAmount: number;
  lookX: number;
  lookY: number;
  bobPhase: number;
}

/**
 * Draws a single handcrafted vector food item centered at (0, 0) with given radius.
 * Strictly avoids purple and pink hues.
 */
export function drawFoodVector(
  ctx: CanvasRenderingContext2D,
  type: FoodId,
  radius: number
): void {
  ctx.save();

  switch (type) {
    case 'apple': {
      // Crisp bright red apple with green leaf
      ctx.fillStyle = '#EF4444';
      ctx.strokeStyle = '#991B1B';
      ctx.lineWidth = 2.5;

      ctx.beginPath();
      ctx.moveTo(0, -radius * 0.52);
      ctx.bezierCurveTo(
        radius * 0.85,
        -radius * 0.95,
        radius * 1.05,
        radius * 0.25,
        0,
        radius * 0.88
      );
      ctx.bezierCurveTo(
        -radius * 1.05,
        radius * 0.25,
        -radius * 0.85,
        -radius * 0.95,
        0,
        -radius * 0.52
      );
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Glossy highlight
      ctx.fillStyle = '#FCA5A5';
      ctx.beginPath();
      ctx.ellipse(-radius * 0.34, -radius * 0.14, radius * 0.16, radius * 0.28, -0.35, 0, Math.PI * 2);
      ctx.fill();

      // Stem
      ctx.strokeStyle = '#78350F';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(0, -radius * 0.5);
      ctx.quadraticCurveTo(radius * 0.08, -radius * 0.9, radius * 0.22, -radius * 0.98);
      ctx.stroke();

      // Leaf
      ctx.fillStyle = '#22C55E';
      ctx.strokeStyle = '#15803D';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.ellipse(radius * 0.26, -radius * 0.72, radius * 0.28, radius * 0.14, -0.45, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      break;
    }

    case 'banana': {
      // Sunny curved yellow banana
      ctx.rotate(-0.2);
      ctx.fillStyle = '#FACC15';
      ctx.strokeStyle = '#A16207';
      ctx.lineWidth = 2.5;
      ctx.lineJoin = 'round';

      ctx.beginPath();
      ctx.moveTo(-radius * 0.8, -radius * 0.22);
      ctx.quadraticCurveTo(0, radius * 0.95, radius * 0.85, -radius * 0.35);
      ctx.quadraticCurveTo(radius * 0.15, radius * 0.28, -radius * 0.8, -radius * 0.22);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Inner shine
      ctx.strokeStyle = '#FEF08A';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-radius * 0.45, radius * 0.08);
      ctx.quadraticCurveTo(0, radius * 0.44, radius * 0.52, -radius * 0.02);
      ctx.stroke();

      // Brown tips
      ctx.fillStyle = '#78350F';
      ctx.beginPath();
      ctx.arc(-radius * 0.8, -radius * 0.22, radius * 0.09, 0, Math.PI * 2);
      ctx.arc(radius * 0.85, -radius * 0.35, radius * 0.1, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 'star': {
      // Cheerful golden star with subtle eyes
      ctx.fillStyle = '#FACC15';
      ctx.strokeStyle = '#D97706';
      ctx.lineWidth = 2.6;
      ctx.lineJoin = 'round';

      const spikes = 5;
      const outer = radius * 0.95;
      const inner = radius * 0.46;
      ctx.beginPath();
      for (let i = 0; i < spikes * 2; i++) {
        const r = i % 2 === 0 ? outer : inner;
        const angle = (i * Math.PI) / spikes - Math.PI / 2;
        const sx = Math.cos(angle) * r;
        const sy = Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Warm inner highlight
      ctx.fillStyle = '#FEF08A';
      ctx.beginPath();
      ctx.arc(-radius * 0.12, -radius * 0.16, radius * 0.2, 0, Math.PI * 2);
      ctx.fill();

      // Cute tiny eyes
      ctx.fillStyle = '#78350F';
      ctx.beginPath();
      ctx.arc(-radius * 0.16, 0, radius * 0.07, 0, Math.PI * 2);
      ctx.arc(radius * 0.16, 0, radius * 0.07, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 'orange': {
      // Bright juicy orange
      ctx.fillStyle = '#F97316';
      ctx.strokeStyle = '#C2410C';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, radius * 0.06, radius * 0.78, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Shine
      ctx.fillStyle = '#FDBA74';
      ctx.beginPath();
      ctx.ellipse(-radius * 0.28, -radius * 0.2, radius * 0.16, radius * 0.24, -0.4, 0, Math.PI * 2);
      ctx.fill();

      // Leaf
      ctx.fillStyle = '#22C55E';
      ctx.strokeStyle = '#15803D';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.ellipse(radius * 0.18, -radius * 0.72, radius * 0.26, radius * 0.13, -0.35, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      break;
    }

    case 'pear': {
      // Fresh lime-green pear
      ctx.fillStyle = '#84CC16';
      ctx.strokeStyle = '#4D7C0F';
      ctx.lineWidth = 2.5;

      ctx.beginPath();
      ctx.moveTo(0, -radius * 0.72);
      ctx.bezierCurveTo(
        radius * 0.45,
        -radius * 0.72,
        radius * 0.48,
        -radius * 0.18,
        radius * 0.72,
        radius * 0.15
      );
      ctx.bezierCurveTo(
        radius * 0.85,
        radius * 0.68,
        radius * 0.42,
        radius * 0.9,
        0,
        radius * 0.88
      );
      ctx.bezierCurveTo(
        -radius * 0.42,
        radius * 0.9,
        -radius * 0.85,
        radius * 0.68,
        -radius * 0.72,
        radius * 0.15
      );
      ctx.bezierCurveTo(
        -radius * 0.48,
        -radius * 0.18,
        -radius * 0.45,
        -radius * 0.72,
        0,
        -radius * 0.72
      );
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Highlight
      ctx.fillStyle = '#D9F99D';
      ctx.beginPath();
      ctx.ellipse(-radius * 0.26, radius * 0.25, radius * 0.14, radius * 0.24, -0.2, 0, Math.PI * 2);
      ctx.fill();

      // Stem
      ctx.strokeStyle = '#78350F';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(0, -radius * 0.72);
      ctx.lineTo(radius * 0.1, -radius * 0.96);
      ctx.stroke();
      break;
    }

    case 'cookie': {
      // Golden honey cookie with chocolate chips
      ctx.fillStyle = '#F59E0B';
      ctx.strokeStyle = '#B45309';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.78, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Inner biscuit glow
      ctx.fillStyle = '#FBBF24';
      ctx.beginPath();
      ctx.arc(-radius * 0.08, -radius * 0.08, radius * 0.56, 0, Math.PI * 2);
      ctx.fill();

      // Chocolate chips
      const chips = [
        [-0.3, -0.25, 0.11],
        [0.26, -0.22, 0.1],
        [-0.1, 0.12, 0.12],
        [0.32, 0.22, 0.1],
        [-0.32, 0.3, 0.09],
      ];
      ctx.fillStyle = '#78350F';
      for (const [cx, cy, cr] of chips) {
        ctx.beginPath();
        ctx.arc(radius * cx, radius * cy, radius * cr, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }
  }

  ctx.restore();
}

/**
 * Draws the bright sky, sun, drifting clouds, and sunny mint-green meadow floor.
 */
export function drawBackdrop(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  clouds: CloudItem[],
  timeSec: number
): void {
  // Soft bright sky gradient (zero purple/pink)
  const skyGrad = ctx.createLinearGradient(0, 0, 0, height * 0.85);
  skyGrad.addColorStop(0, '#BAE6FD');
  skyGrad.addColorStop(0.55, '#E0F2FE');
  skyGrad.addColorStop(1, '#F0FDF4');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, width, height);

  // Warm smiling sun in top-left corner
  const sunX = Math.max(76, width * 0.11);
  const sunY = Math.max(84, height * 0.13);
  const sunRadius = Math.min(44, Math.max(30, width * 0.04));

  ctx.save();
  ctx.translate(sunX, sunY);
  const pulse = 1 + Math.sin(timeSec * 2) * 0.04;
  ctx.fillStyle = 'rgba(253, 224, 71, 0.35)';
  ctx.beginPath();
  ctx.arc(0, 0, sunRadius * 1.45 * pulse, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#FDE047';
  ctx.strokeStyle = '#FACC15';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, 0, sunRadius, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // Fluffy white clouds
  for (const cloud of clouds) {
    ctx.save();
    ctx.translate(cloud.x, cloud.y);
    ctx.scale(cloud.scale, cloud.scale);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.beginPath();
    ctx.arc(0, 0, 26, 0, Math.PI * 2);
    ctx.arc(28, -8, 32, 0, Math.PI * 2);
    ctx.arc(60, 0, 25, 0, Math.PI * 2);
    ctx.arc(30, 10, 26, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Rolling sunny green grass hills at the bottom
  const groundTop = height - 88;
  ctx.fillStyle = '#86EFAC';
  ctx.beginPath();
  ctx.moveTo(0, groundTop + 14);
  ctx.quadraticCurveTo(width * 0.25, groundTop - 22, width * 0.52, groundTop + 8);
  ctx.quadraticCurveTo(width * 0.78, groundTop + 34, width, groundTop - 10);
  ctx.lineTo(width, height);
  ctx.lineTo(0, height);
  ctx.closePath();
  ctx.fill();

  // Foreground bright grass strip
  const grassGrad = ctx.createLinearGradient(0, groundTop + 16, 0, height);
  grassGrad.addColorStop(0, '#4ADE80');
  grassGrad.addColorStop(1, '#22C55E');
  ctx.fillStyle = grassGrad;
  ctx.beginPath();
  ctx.moveTo(0, groundTop + 26);
  ctx.quadraticCurveTo(width * 0.35, groundTop + 8, width * 0.7, groundTop + 26);
  ctx.quadraticCurveTo(width * 0.88, groundTop + 36, width, groundTop + 20);
  ctx.lineTo(width, height);
  ctx.lineTo(0, height);
  ctx.closePath();
  ctx.fill();

  // Subtle decorative grass blades
  ctx.strokeStyle = '#16A34A';
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';
  const step = Math.max(70, Math.floor(width / 14));
  for (let gx = 32; gx < width; gx += step) {
    const gy = height - 26 + ((gx * 13) % 14);
    ctx.beginPath();
    ctx.moveTo(gx, gy);
    ctx.quadraticCurveTo(gx - 5, gy - 11, gx - 9, gy - 15);
    ctx.moveTo(gx + 6, gy);
    ctx.quadraticCurveTo(gx + 10, gy - 12, gx + 14, gy - 14);
    ctx.stroke();
  }
}

/**
 * Draws the cute mint-green monster with expressive eyes, cheeks, mouth, and thought bubble.
 */
export function drawMonsterAndBubble(
  ctx: CanvasRenderingContext2D,
  monster: MonsterRenderState,
  targetFood: FoodId,
  showBubble: boolean,
  bubblePulse: number
): void {
  const { x, y, width, height, squashX, squashY, mood, isBlinking, mouthOpenAmount, lookX, lookY, bobPhase } =
    monster;

  const bobOffset = Math.sin(bobPhase) * 3;
  const tilt = Math.max(-0.12, Math.min(0.12, monster.vx * 0.00018));

  ctx.save();
  ctx.translate(x, y + bobOffset);

  // Soft ground shadow beneath monster
  ctx.fillStyle = 'rgba(21, 128, 61, 0.22)';
  ctx.beginPath();
  ctx.ellipse(0, height * 0.48 - bobOffset, width * 0.44 * squashX, 11, 0, 0, Math.PI * 2);
  ctx.fill();

  // Apply squash-and-stretch + lean
  ctx.rotate(tilt);
  ctx.scale(squashX, squashY);

  // Cute amber little horns/ears
  ctx.fillStyle = '#FBBF24';
  ctx.strokeStyle = '#B45309';
  ctx.lineWidth = 3;
  // Left horn
  ctx.beginPath();
  ctx.moveTo(-width * 0.28, -height * 0.34);
  ctx.quadraticCurveTo(-width * 0.42, -height * 0.64, -width * 0.2, -height * 0.56);
  ctx.quadraticCurveTo(-width * 0.14, -height * 0.44, -width * 0.14, -height * 0.38);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Right horn
  ctx.beginPath();
  ctx.moveTo(width * 0.28, -height * 0.34);
  ctx.quadraticCurveTo(width * 0.42, -height * 0.64, width * 0.2, -height * 0.56);
  ctx.quadraticCurveTo(width * 0.14, -height * 0.44, width * 0.14, -height * 0.38);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Little feet
  ctx.fillStyle = '#10B981';
  ctx.strokeStyle = '#047857';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(-width * 0.22, height * 0.42, 16, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(width * 0.22, height * 0.42, 16, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Main chubby mint-green monster body
  ctx.fillStyle = '#34D399';
  ctx.strokeStyle = '#059669';
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.moveTo(0, -height * 0.46);
  ctx.bezierCurveTo(width * 0.48, -height * 0.46, width * 0.54, height * 0.08, width * 0.46, height * 0.34);
  ctx.bezierCurveTo(width * 0.38, height * 0.47, -width * 0.38, height * 0.47, -width * 0.46, height * 0.34);
  ctx.bezierCurveTo(-width * 0.54, height * 0.08, -width * 0.48, -height * 0.46, 0, -height * 0.46);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Lighter mint belly patch
  ctx.fillStyle = '#A7F3D0';
  ctx.beginPath();
  ctx.ellipse(0, height * 0.18, width * 0.28, height * 0.22, 0, 0, Math.PI * 2);
  ctx.fill();

  // Warm orange cheeks (no pink!)
  ctx.fillStyle = mood === 'sad' ? 'rgba(251, 146, 60, 0.35)' : 'rgba(251, 146, 60, 0.72)';
  ctx.beginPath();
  ctx.ellipse(-width * 0.29, height * 0.04, 11, 7, 0, 0, Math.PI * 2);
  ctx.ellipse(width * 0.29, height * 0.04, 11, 7, 0, 0, Math.PI * 2);
  ctx.fill();

  // Big expressive eyes
  const eyeOffsetX = width * 0.18;
  const eyeY = -height * 0.12;
  const eyeRadius = 15;

  for (const side of [-1, 1]) {
    const ex = side * eyeOffsetX;
    if (mood === 'happy') {
      // Joyful curved happy eyes ^_^
      ctx.strokeStyle = '#064E3B';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(ex, eyeY + 3, 10, Math.PI * 1.15, Math.PI * 1.85);
      ctx.stroke();
    } else if (mood === 'sad') {
      // Sad > < / tilted worried eyes
      ctx.fillStyle = '#FFFFFF';
      ctx.strokeStyle = '#064E3B';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(ex, eyeY, eyeRadius - 1, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#0F172A';
      ctx.beginPath();
      ctx.arc(ex, eyeY + 2, 6.5, 0, Math.PI * 2);
      ctx.fill();

      // Worried eyebrow
      ctx.strokeStyle = '#064E3B';
      ctx.lineWidth = 3.2;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(ex - side * 12, eyeY - 17);
      ctx.lineTo(ex + side * 10, eyeY - 12);
      ctx.stroke();
    } else if (isBlinking) {
      // Natural blink line
      ctx.strokeStyle = '#064E3B';
      ctx.lineWidth = 3.5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(ex - 11, eyeY);
      ctx.lineTo(ex + 11, eyeY);
      ctx.stroke();
    } else {
      // Open big sparkling eyes tracking nearby food
      ctx.fillStyle = '#FFFFFF';
      ctx.strokeStyle = '#064E3B';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(ex, eyeY, eyeRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      const px = ex + lookX * 4.5;
      const py = eyeY + lookY * 3.5;
      ctx.fillStyle = '#0F172A';
      ctx.beginPath();
      ctx.arc(px, py, 7.5, 0, Math.PI * 2);
      ctx.fill();

      // Eye shine
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(px - 2.5, py - 2.5, 2.8, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Mouth (idle smile, wide excited bite, happy grin, or sad wobble)
  const mouthY = height * 0.08;
  if (mood === 'sad') {
    ctx.strokeStyle = '#064E3B';
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(0, mouthY + 12, 13, Math.PI * 1.18, Math.PI * 1.82);
    ctx.stroke();
  } else if (mouthOpenAmount > 0.15 || mood === 'happy') {
    const openH = mood === 'happy' ? 18 : 8 + mouthOpenAmount * 14;
    const openW = mood === 'happy' ? 22 : 16 + mouthOpenAmount * 8;
    ctx.fillStyle = '#064E3B';
    ctx.beginPath();
    ctx.ellipse(0, mouthY + 4, openW, openH, 0, 0, Math.PI);
    ctx.closePath();
    ctx.fill();

    // Cute little white tooth
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.roundRect(-5, mouthY + 4, 10, 6, [0, 0, 4, 4]);
    ctx.fill();

    // Warm orange-coral tongue (avoiding pink!)
    ctx.fillStyle = '#FB923C';
    ctx.beginPath();
    ctx.ellipse(0, mouthY + openH * 0.68, openW * 0.45, Math.max(4, openH * 0.28), 0, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Cheerful resting smile
    ctx.strokeStyle = '#064E3B';
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(0, mouthY - 2, 14, 0.18 * Math.PI, 0.82 * Math.PI);
    ctx.stroke();
  }

  ctx.restore();

  // Thought bubble directly above monster's head showing desired food
  if (showBubble) {
    const bubbleScale = 1 + Math.sin(bubblePulse) * 0.05;
    const bx = Math.max(58, Math.min(ctx.canvas.width / (window.devicePixelRatio || 1) - 58, x));
    const by = y - height * 0.92 + bobOffset;

    ctx.save();
    ctx.translate(bx, by);
    ctx.scale(bubbleScale, bubbleScale);

    // Little thought dots leading from monster head to bubble
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#38BDF8';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.arc(-6, 36, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(-2, 23, 7.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Main soft cloud-like thought bubble
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#0284C7';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(-34, -34, 68, 54, 24);
    ctx.fill();
    ctx.stroke();

    // Draw the exact requested food icon inside the thought bubble
    ctx.translate(0, -7);
    drawFoodVector(ctx, targetFood, 19);

    ctx.restore();
  }
}

/**
 * Draws falling food items with soft glow for the target item so kids spot it clearly.
 */
export function drawFallingFood(
  ctx: CanvasRenderingContext2D,
  item: FallingFood,
  isTarget: boolean
): void {
  ctx.save();
  ctx.translate(item.x, item.y);

  if (isTarget) {
    ctx.fillStyle = 'rgba(253, 224, 71, 0.28)';
    ctx.beginPath();
    ctx.arc(0, 0, item.radius * 1.35, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.rotate(item.rotation);
  drawFoodVector(ctx, item.type, item.radius);
  ctx.restore();
}

/**
 * Draws confetti & star particles.
 */
export function drawParticles(ctx: CanvasRenderingContext2D, particles: Particle[]): void {
  for (const p of particles) {
    if (!p.active) continue;
    ctx.save();
    ctx.globalAlpha = Math.max(0, p.alpha);
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);
    ctx.fillStyle = p.color;

    if (p.shape === 'star') {
      const outer = p.size;
      const inner = p.size * 0.45;
      ctx.beginPath();
      for (let i = 0; i < 10; i++) {
        const r = i % 2 === 0 ? outer : inner;
        const a = (i * Math.PI) / 5;
        if (i === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
        else ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
      }
      ctx.closePath();
      ctx.fill();
    } else if (p.shape === 'spark') {
      ctx.fillRect(-p.size * 0.7, -p.size * 0.25, p.size * 1.4, p.size * 0.5);
    } else {
      ctx.beginPath();
      ctx.arc(0, 0, p.size * 0.65, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}

/**
 * Draws floating score/feedback labels (+1, -1).
 */
export function drawFloatingTexts(ctx: CanvasRenderingContext2D, texts: FloatingText[]): void {
  for (const ft of texts) {
    const progress = 1 - ft.life / ft.maxLife;
    ctx.save();
    ctx.globalAlpha = Math.max(0, 1 - progress);
    ctx.font = '800 22px "Baloo Bhaijaan 2", "Cairo", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#FFFFFF';
    ctx.strokeText(ft.text, ft.x, ft.y);
    ctx.fillStyle = ft.color;
    ctx.fillText(ft.text, ft.x, ft.y);
    ctx.restore();
  }
}
