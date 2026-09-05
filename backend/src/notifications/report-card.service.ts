import { Injectable, Logger } from '@nestjs/common';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import * as fs from 'fs';
import * as path from 'path';

interface HabitRow {
  name: string;
  icon: string | null;
  completed: boolean;
  streak: number;
}

interface MemberCardData {
  name: string;
  isMaster: boolean;
  isCurrentUser: boolean;
  habits: HabitRow[];
  completed: number;
  total: number;
  percent: number;
}

interface ReportImageParams {
  trackerName: string;
  userName: string;
  dateLabel: string;
  currentUser: MemberCardData;
  otherMembers: MemberCardData[];
}

// Cute illustrations as simple SVG data URIs
const ILLUSTRATIONS = {
  star:     'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="80" font-size="80">⭐</text></svg>',
  rocket:   'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="80" font-size="80">🚀</text></svg>',
  trophy:   'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="80" font-size="80">🏆</text></svg>',
  sparkles: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="80" font-size="80">✨</text></svg>',
  fire:     'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="80" font-size="80">🔥</text></svg>',
};

@Injectable()
export class ReportCardService {
  private readonly logger = new Logger(ReportCardService.name);
  private readonly fontPath = path.join(process.cwd(), 'assets', 'NotoSans-Regular.ttf');
  private readonly malayalamFontPath = path.join(process.cwd(), 'assets', 'NotoSansMalayalam-Regular.woff');
  private cachedFont: Buffer | null = null;
  private cachedMalayalamFont: Buffer | null = null;

  private getFont(): Buffer {
    if (!this.cachedFont) {
      this.cachedFont = fs.readFileSync(this.fontPath);
    }
    return this.cachedFont;
  }

  private getMalayalamFont(): Buffer | null {
    if (!this.cachedMalayalamFont) {
      if (fs.existsSync(this.malayalamFontPath)) {
        this.cachedMalayalamFont = fs.readFileSync(this.malayalamFontPath);
      }
    }
    return this.cachedMalayalamFont;
  }

  async render(params: ReportImageParams): Promise<Buffer> {
    const height = this.estimateHeight(params);
    const malayalamFont = this.getMalayalamFont();

    const fonts: { name: string; data: Buffer; weight: 400 | 700 | 900; style: 'normal' }[] = [
      { name: 'Noto Sans', data: this.getFont(), weight: 400, style: 'normal' },
    ];

    if (malayalamFont) {
      fonts.push({ name: 'Noto Sans Malayalam', data: malayalamFont, weight: 400, style: 'normal' });
    }

    // Resolve emoji via twemoji for crisp rendering
    const loadAdditionalAsset = async (code: string, segment: string): Promise<string> => {
      if (code === 'emoji') {
        const codePoint = [...segment].map((c) => c.codePointAt(0)!.toString(16)).join('-');
        const url = `https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/${codePoint}.svg`;
        try {
          const res = await fetch(url);
          if (res.ok) {
            const svg = await res.text();
            return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
          }
        } catch {
          // fall back to text rendering
        }
      }
      return '';
    };

    const svg = await satori(this.buildJsx(params) as never, {
      width: 750,
      height,
      fonts,
      loadAdditionalAsset,
    });
    const png = new Resvg(svg, { fitTo: { mode: 'width', value: 750 } }).render().asPng();
    return png;
  }

  private estimateHeight(p: ReportImageParams): number {
    // Header + footer
    const base = 380;
    // Per member: header + habits
    const allMembers = [p.currentUser, ...p.otherMembers];
    const totalHabits = allMembers.reduce((s, m) => s + m.habits.length, 0);
    const memberCount = allMembers.length;
    // 2-column: ceil(n/2) rows of cards
    const cardRows = Math.ceil(memberCount / 2);
    // Each card row: ~200 base + 58 per habit (in that card row's tallest card)
    const maxHabitsPerRow = Math.ceil(totalHabits / cardRows);
    const memberHeight = cardRows * (200 + maxHabitsPerRow * 62);
    return Math.max(1100, base + memberHeight + 60);
  }

  private buildJsx(p: ReportImageParams) {
    // ─── Design Tokens ───────────────────────────────────────────────────────
    const C = {
      bg:        '#FAFAFA',       // off-white canvas
      cardBg:    '#FFFFFF',       // pure white cards
      heroBg:    '#1A1A2E',       // deep navy hero
      accent:    '#7C3AED',       // violet
      accentSoft:'#EDE9FE',       // violet tint
      teal:      '#0D9488',       // teal for secondary member cards
      tealSoft:  '#CCFBF1',       // teal tint
      green:     '#059669',       // green done
      greenSoft: '#D1FAE5',       // green tint
      red:       '#E11D48',       // red pending
      redSoft:   '#FFE4E6',       // red tint
      orange:    '#EA580C',       // streak orange
      text:      '#111827',       // near-black
      muted:     '#6B7280',       // grey
      border:    '#E5E7EB',       // light border
      white:     '#FFFFFF',
      gold:      '#F59E0B',       // gold for master
    };

    // Determine overall mood
    const allMembers = [p.currentUser, ...p.otherMembers];
    const totalCompleted = allMembers.reduce((s, m) => s + m.completed, 0);
    const totalItems = allMembers.reduce((s, m) => s + m.total, 0);
    const overallPercent = totalItems > 0 ? Math.round((totalCompleted / totalItems) * 100) : 0;
    const mood = overallPercent === 100 ? 'perfect' : overallPercent >= 75 ? 'great' : 'push';

    const moodConfig = {
      perfect: { emoji: '🏆', msg: 'Everyone nailed it today!',  color: C.gold },
      great:   { emoji: '🚀', msg: 'Great teamwork, keep it up!', color: C.accent },
      push:    { emoji: '💪', msg: "Let's push harder tomorrow!", color: C.teal },
    }[mood];

    // ─── Helper ──────────────────────────────────────────────────────────────
    const h = (type: string, props: Record<string, unknown> = {}, ...children: unknown[]) => {
      const cleaned = children.filter((c) => c !== null && c !== undefined && c !== false);
      const next: Record<string, unknown> = { ...props };
      if (cleaned.length === 0) { /* leave children unset */ }
      else if (cleaned.length === 1) { next.children = cleaned[0]; }
      else { next.children = cleaned; }
      return { type, props: next };
    };

    // ─── Pill Badge ──────────────────────────────────────────────────────────
    const pill = (text: string, bg: string, fg: string) =>
      h('div', {
        style: {
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: bg, color: fg,
          borderRadius: 100, padding: '4px 14px',
          fontSize: 20, fontWeight: 700,
        },
      }, text);

    // ─── Donut Progress Ring (SVG circle trick via border-radius) ─────────────
    // We simulate a ring with two concentric divs
    const ringProgress = (percent: number, color: string, size: number) => {
      const deg = Math.round((percent / 100) * 360);
      // Use a conic-gradient trick
      return h('div', {
        style: {
          width: size, height: size,
          borderRadius: '50%',
          background: `conic-gradient(${color} ${deg}deg, #E5E7EB ${deg}deg)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative',
        },
      },
        h('div', {
          style: {
            width: size - 20, height: size - 20,
            borderRadius: '50%',
            background: C.cardBg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexDirection: 'column',
          },
        },
          h('div', { style: { fontSize: size * 0.28, fontWeight: 900, color: C.text, lineHeight: 1 } }, `${percent}%`),
          h('div', { style: { fontSize: size * 0.13, color: C.muted, marginTop: 2 } }, 'done'),
        ),
      );
    };

    // ─── Habit Pill ───────────────────────────────────────────────────────────
    const habitPill = (habit: HabitRow) => {
      const done = habit.completed;
      return h('div', {
        style: {
          display: 'flex', alignItems: 'center',
          background: done ? C.greenSoft : '#F9FAFB',
          border: `1.5px solid ${done ? C.green : C.border}`,
          borderRadius: 16, padding: '10px 14px',
          marginBottom: 8,
        },
      },
        // Icon bubble
        h('div', {
          style: {
            width: 36, height: 36, borderRadius: '50%',
            background: done ? C.green : C.border,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, marginRight: 12, flexShrink: 0,
          },
        }, habit.icon ?? '✦'),
        // Name
        h('div', {
          style: {
            flex: 1, fontSize: 22, fontWeight: 600,
            color: done ? C.green : C.text,
            fontFamily: 'Noto Sans Malayalam, Noto Sans, sans-serif',
          },
        }, habit.name),
        // Streak badge
        habit.streak > 0
          ? h('div', {
              style: {
                display: 'flex', alignItems: 'center', gap: 4,
                background: '#FEF3C7', borderRadius: 10,
                padding: '3px 10px', marginRight: 8,
                fontSize: 18, color: C.orange, fontWeight: 700,
              },
            }, `🔥 ${habit.streak}`)
          : null,
        // Status dot
        h('div', {
          style: {
            width: 28, height: 28, borderRadius: '50%',
            background: done ? C.green : '#F3F4F6',
            border: `2px solid ${done ? C.green : C.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, color: done ? C.white : C.muted, fontWeight: 900,
          },
        }, done ? '✓' : '○'),
      );
    };

    // ─── Member Card ──────────────────────────────────────────────────────────
    const memberCard = (m: MemberCardData) => {
      const accent = m.isCurrentUser ? C.accent : C.teal;
      const accentSoft = m.isCurrentUser ? C.accentSoft : C.tealSoft;
      const ringSize = 90;

      return h('div', {
        style: {
          display: 'flex', flexDirection: 'column',
          background: C.cardBg,
          borderRadius: 24,
          border: `2px solid ${m.isCurrentUser ? accent : C.border}`,
          overflow: 'hidden', flex: 1,
          // box shadow workaround via border
        },
      },
        // Card header bar
        h('div', {
          style: {
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: accentSoft, padding: '18px 20px',
          },
        },
          // Name + role
          h('div', { style: { display: 'flex', flexDirection: 'column' } },
            h('div', {
              style: {
                fontSize: 26, fontWeight: 900, color: C.text,
                fontFamily: 'Noto Sans Malayalam, Noto Sans, sans-serif',
                display: 'flex', alignItems: 'center', gap: 8,
              },
            },
              m.name,
              m.isMaster ? h('div', { style: { fontSize: 20 } }, '👑') : null,
              m.isCurrentUser ? pill('You', accent, C.white) : null,
            ),
            h('div', { style: { fontSize: 18, color: C.muted, marginTop: 4 } },
              `${m.completed}/${m.total} activities`),
          ),
          // Progress ring
          ringProgress(m.percent, accent, ringSize),
        ),
        // Habits list
        h('div', { style: { display: 'flex', flexDirection: 'column', padding: '16px 20px' } },
          ...m.habits.map((habit) => habitPill(habit)),
          m.habits.length === 0
            ? h('div', { style: { fontSize: 20, color: C.muted, textAlign: 'center', padding: 16 } }, 'No habits yet')
            : null,
        ),
      );
    };

    // ─── Build 2-column member grid ───────────────────────────────────────────
    const memberRows: unknown[] = [];
    for (let i = 0; i < allMembers.length; i += 2) {
      const left = allMembers[i];
      const right = allMembers[i + 1];
      const rowChildren: unknown[] = [memberCard(left)];
      if (right) {
        rowChildren.push(h('div', { style: { width: 16 } }));
        rowChildren.push(memberCard(right));
      } else {
        // Spacer so single card stays at 50% width
        rowChildren.push(h('div', { style: { flex: 1 } }));
      }
      memberRows.push(
        h('div', {
          style: { display: 'flex', flexDirection: 'row', width: '100%', marginBottom: 16 },
        }, ...rowChildren),
      );
    }

    // ─── Root ─────────────────────────────────────────────────────────────────
    return h('div', {
      style: {
        display: 'flex', flexDirection: 'column',
        width: '100%', height: '100%',
        background: C.bg,
        fontFamily: 'Noto Sans Malayalam, Noto Sans, sans-serif',
      },
    },

      // ── Hero Banner ────────────────────────────────────────────────────────
      h('div', {
        style: {
          display: 'flex', flexDirection: 'row', alignItems: 'center',
          background: C.heroBg,
          padding: '36px 48px 32px',
        },
      },
        // Left: text
        h('div', { style: { display: 'flex', flexDirection: 'column', flex: 1 } },
          // Top label
          h('div', {
            style: {
              display: 'flex', alignItems: 'center', gap: 10,
              background: 'rgba(255,255,255,0.08)', borderRadius: 12,
              padding: '6px 16px', marginBottom: 16, alignSelf: 'flex-start',
            },
          },
            h('div', { style: { fontSize: 22, color: '#A78BFA' } }, '📅'),
            h('div', { style: { fontSize: 20, color: '#C4B5FD', fontWeight: 600 } }, p.dateLabel),
          ),
          // Title
          h('div', {
            style: { fontSize: 52, fontWeight: 900, color: C.white, lineHeight: 1.1, marginBottom: 10 },
          }, 'Daily Report'),
          h('div', {
            style: { fontSize: 28, fontWeight: 400, color: '#A78BFA', marginBottom: 6 },
          }, `📌 ${p.trackerName}`),
          h('div', {
            style: {
              fontSize: 26, color: '#E0E7FF', marginTop: 8,
              fontFamily: 'Noto Sans Malayalam, Noto Sans, sans-serif',
            },
          }, `Hey ${p.userName}! 👋`),
        ),
        // Right: big decorative emoji
        h('div', {
          style: {
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 120, marginLeft: 32,
            background: 'rgba(255,255,255,0.05)',
            borderRadius: 32, width: 160, height: 160,
          },
        }, p.currentUser.percent === 100 ? '🏆' : p.currentUser.percent >= 75 ? '🚀' : '✨'),
      ),

      // ── Content area ───────────────────────────────────────────────────────
      h('div', { style: { display: 'flex', flexDirection: 'column', padding: '28px 40px 0' } },

        // Section label
        h('div', {
          style: {
            fontSize: 22, fontWeight: 700, color: C.muted,
            letterSpacing: 2, marginBottom: 16,
            textTransform: 'uppercase',
          },
        }, '── Members ──'),

        // 2-column member grid
        ...memberRows,
      ),

      // ── Footer Summary ─────────────────────────────────────────────────────
      h('div', {
        style: {
          display: 'flex', alignItems: 'center',
          background: C.heroBg, margin: '12px 40px 40px',
          borderRadius: 24, padding: '24px 32px',
        },
      },
        // Big mood emoji
        h('div', {
          style: {
            fontSize: 72, marginRight: 28,
            background: 'rgba(255,255,255,0.06)', borderRadius: 20,
            width: 96, height: 96,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          },
        }, moodConfig.emoji),
        // Stats
        h('div', { style: { display: 'flex', flexDirection: 'column', flex: 1 } },
          h('div', {
            style: { fontSize: 30, fontWeight: 900, color: C.white, marginBottom: 6 },
          }, moodConfig.msg),
          h('div', {
            style: { fontSize: 22, color: '#A78BFA' },
          }, `Group total: ${totalCompleted}/${totalItems} · ${overallPercent}% complete`),
        ),
        // Overall ring
        h('div', { style: { marginLeft: 24 } },
          // a simpler big percent badge
          h('div', {
            style: {
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center',
              background: moodConfig.color, borderRadius: 20,
              padding: '16px 24px',
            },
          },
            h('div', { style: { fontSize: 48, fontWeight: 900, color: C.white, lineHeight: 1 } }, `${overallPercent}%`),
            h('div', { style: { fontSize: 18, color: 'rgba(255,255,255,0.8)', marginTop: 4 } }, 'overall'),
          ),
        ),
      ),
    );
  }
}