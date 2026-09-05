"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var ReportCardService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportCardService = void 0;
const common_1 = require("@nestjs/common");
const satori_1 = __importDefault(require("satori"));
const resvg_js_1 = require("@resvg/resvg-js");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const ILLUSTRATIONS = {
    star: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="80" font-size="80">⭐</text></svg>',
    rocket: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="80" font-size="80">🚀</text></svg>',
    trophy: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="80" font-size="80">🏆</text></svg>',
    sparkles: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="80" font-size="80">✨</text></svg>',
    fire: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="80" font-size="80">🔥</text></svg>',
};
let ReportCardService = ReportCardService_1 = class ReportCardService {
    constructor() {
        this.logger = new common_1.Logger(ReportCardService_1.name);
        this.fontPath = path.join(process.cwd(), 'assets', 'NotoSans-Regular.ttf');
        this.malayalamFontPath = path.join(process.cwd(), 'assets', 'NotoSansMalayalam-Regular.woff');
        this.cachedFont = null;
        this.cachedMalayalamFont = null;
    }
    getFont() {
        if (!this.cachedFont) {
            this.cachedFont = fs.readFileSync(this.fontPath);
        }
        return this.cachedFont;
    }
    getMalayalamFont() {
        if (!this.cachedMalayalamFont) {
            if (fs.existsSync(this.malayalamFontPath)) {
                this.cachedMalayalamFont = fs.readFileSync(this.malayalamFontPath);
            }
        }
        return this.cachedMalayalamFont;
    }
    async render(params) {
        const height = this.estimateHeight(params);
        const malayalamFont = this.getMalayalamFont();
        const fonts = [
            { name: 'Noto Sans', data: this.getFont(), weight: 400, style: 'normal' },
        ];
        if (malayalamFont) {
            fonts.push({ name: 'Noto Sans Malayalam', data: malayalamFont, weight: 400, style: 'normal' });
        }
        const loadAdditionalAsset = async (code, segment) => {
            if (code === 'emoji') {
                const codePoint = [...segment].map((c) => c.codePointAt(0).toString(16)).join('-');
                const url = `https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/${codePoint}.svg`;
                try {
                    const res = await fetch(url);
                    if (res.ok) {
                        const svg = await res.text();
                        return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
                    }
                }
                catch {
                }
            }
            return '';
        };
        const svg = await (0, satori_1.default)(this.buildJsx(params), {
            width: 750,
            height,
            fonts,
            loadAdditionalAsset,
        });
        const png = new resvg_js_1.Resvg(svg, { fitTo: { mode: 'width', value: 750 } }).render().asPng();
        return png;
    }
    estimateHeight(p) {
        const base = 380;
        const allMembers = [p.currentUser, ...p.otherMembers];
        const totalHabits = allMembers.reduce((s, m) => s + m.habits.length, 0);
        const memberCount = allMembers.length;
        const cardRows = Math.ceil(memberCount / 2);
        const maxHabitsPerRow = Math.ceil(totalHabits / cardRows);
        const memberHeight = cardRows * (200 + maxHabitsPerRow * 62);
        return Math.max(1100, base + memberHeight + 60);
    }
    buildJsx(p) {
        const C = {
            bg: '#FAFAFA',
            cardBg: '#FFFFFF',
            heroBg: '#1A1A2E',
            accent: '#7C3AED',
            accentSoft: '#EDE9FE',
            teal: '#0D9488',
            tealSoft: '#CCFBF1',
            green: '#059669',
            greenSoft: '#D1FAE5',
            red: '#E11D48',
            redSoft: '#FFE4E6',
            orange: '#EA580C',
            text: '#111827',
            muted: '#6B7280',
            border: '#E5E7EB',
            white: '#FFFFFF',
            gold: '#F59E0B',
        };
        const allMembers = [p.currentUser, ...p.otherMembers];
        const totalCompleted = allMembers.reduce((s, m) => s + m.completed, 0);
        const totalItems = allMembers.reduce((s, m) => s + m.total, 0);
        const overallPercent = totalItems > 0 ? Math.round((totalCompleted / totalItems) * 100) : 0;
        const mood = overallPercent === 100 ? 'perfect' : overallPercent >= 75 ? 'great' : 'push';
        const moodConfig = {
            perfect: { emoji: '🏆', msg: 'Everyone nailed it today!', color: C.gold },
            great: { emoji: '🚀', msg: 'Great teamwork, keep it up!', color: C.accent },
            push: { emoji: '💪', msg: "Let's push harder tomorrow!", color: C.teal },
        }[mood];
        const h = (type, props = {}, ...children) => {
            const cleaned = children.filter((c) => c !== null && c !== undefined && c !== false);
            const next = { ...props };
            if (cleaned.length === 0) { }
            else if (cleaned.length === 1) {
                next.children = cleaned[0];
            }
            else {
                next.children = cleaned;
            }
            return { type, props: next };
        };
        const pill = (text, bg, fg) => h('div', {
            style: {
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: bg, color: fg,
                borderRadius: 100, padding: '4px 14px',
                fontSize: 20, fontWeight: 700,
            },
        }, text);
        const ringProgress = (percent, color, size) => {
            const deg = Math.round((percent / 100) * 360);
            return h('div', {
                style: {
                    width: size, height: size,
                    borderRadius: '50%',
                    background: `conic-gradient(${color} ${deg}deg, #E5E7EB ${deg}deg)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    position: 'relative',
                },
            }, h('div', {
                style: {
                    width: size - 20, height: size - 20,
                    borderRadius: '50%',
                    background: C.cardBg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexDirection: 'column',
                },
            }, h('div', { style: { fontSize: size * 0.28, fontWeight: 900, color: C.text, lineHeight: 1 } }, `${percent}%`), h('div', { style: { fontSize: size * 0.13, color: C.muted, marginTop: 2 } }, 'done')));
        };
        const habitPill = (habit) => {
            const done = habit.completed;
            return h('div', {
                style: {
                    display: 'flex', alignItems: 'center',
                    background: done ? C.greenSoft : '#F9FAFB',
                    border: `1.5px solid ${done ? C.green : C.border}`,
                    borderRadius: 16, padding: '10px 14px',
                    marginBottom: 8,
                },
            }, h('div', {
                style: {
                    width: 36, height: 36, borderRadius: '50%',
                    background: done ? C.green : C.border,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 18, marginRight: 12, flexShrink: 0,
                },
            }, habit.icon ?? '✦'), h('div', {
                style: {
                    flex: 1, fontSize: 22, fontWeight: 600,
                    color: done ? C.green : C.text,
                    fontFamily: 'Noto Sans Malayalam, Noto Sans, sans-serif',
                },
            }, habit.name), habit.streak > 0
                ? h('div', {
                    style: {
                        display: 'flex', alignItems: 'center', gap: 4,
                        background: '#FEF3C7', borderRadius: 10,
                        padding: '3px 10px', marginRight: 8,
                        fontSize: 18, color: C.orange, fontWeight: 700,
                    },
                }, `🔥 ${habit.streak}`)
                : null, h('div', {
                style: {
                    width: 28, height: 28, borderRadius: '50%',
                    background: done ? C.green : '#F3F4F6',
                    border: `2px solid ${done ? C.green : C.border}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 14, color: done ? C.white : C.muted, fontWeight: 900,
                },
            }, done ? '✓' : '○'));
        };
        const memberCard = (m) => {
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
                },
            }, h('div', {
                style: {
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    background: accentSoft, padding: '18px 20px',
                },
            }, h('div', { style: { display: 'flex', flexDirection: 'column' } }, h('div', {
                style: {
                    fontSize: 26, fontWeight: 900, color: C.text,
                    fontFamily: 'Noto Sans Malayalam, Noto Sans, sans-serif',
                    display: 'flex', alignItems: 'center', gap: 8,
                },
            }, m.name, m.isMaster ? h('div', { style: { fontSize: 20 } }, '👑') : null, m.isCurrentUser ? pill('You', accent, C.white) : null), h('div', { style: { fontSize: 18, color: C.muted, marginTop: 4 } }, `${m.completed}/${m.total} activities`)), ringProgress(m.percent, accent, ringSize)), h('div', { style: { display: 'flex', flexDirection: 'column', padding: '16px 20px' } }, ...m.habits.map((habit) => habitPill(habit)), m.habits.length === 0
                ? h('div', { style: { fontSize: 20, color: C.muted, textAlign: 'center', padding: 16 } }, 'No habits yet')
                : null));
        };
        const memberRows = [];
        for (let i = 0; i < allMembers.length; i += 2) {
            const left = allMembers[i];
            const right = allMembers[i + 1];
            const rowChildren = [memberCard(left)];
            if (right) {
                rowChildren.push(h('div', { style: { width: 16 } }));
                rowChildren.push(memberCard(right));
            }
            else {
                rowChildren.push(h('div', { style: { flex: 1 } }));
            }
            memberRows.push(h('div', {
                style: { display: 'flex', flexDirection: 'row', width: '100%', marginBottom: 16 },
            }, ...rowChildren));
        }
        return h('div', {
            style: {
                display: 'flex', flexDirection: 'column',
                width: '100%', height: '100%',
                background: C.bg,
                fontFamily: 'Noto Sans Malayalam, Noto Sans, sans-serif',
            },
        }, h('div', {
            style: {
                display: 'flex', flexDirection: 'row', alignItems: 'center',
                background: C.heroBg,
                padding: '36px 48px 32px',
            },
        }, h('div', { style: { display: 'flex', flexDirection: 'column', flex: 1 } }, h('div', {
            style: {
                display: 'flex', alignItems: 'center', gap: 10,
                background: 'rgba(255,255,255,0.08)', borderRadius: 12,
                padding: '6px 16px', marginBottom: 16, alignSelf: 'flex-start',
            },
        }, h('div', { style: { fontSize: 22, color: '#A78BFA' } }, '📅'), h('div', { style: { fontSize: 20, color: '#C4B5FD', fontWeight: 600 } }, p.dateLabel)), h('div', {
            style: { fontSize: 52, fontWeight: 900, color: C.white, lineHeight: 1.1, marginBottom: 10 },
        }, 'Daily Report'), h('div', {
            style: { fontSize: 28, fontWeight: 400, color: '#A78BFA', marginBottom: 6 },
        }, `📌 ${p.trackerName}`), h('div', {
            style: {
                fontSize: 26, color: '#E0E7FF', marginTop: 8,
                fontFamily: 'Noto Sans Malayalam, Noto Sans, sans-serif',
            },
        }, `Hey ${p.userName}! 👋`)), h('div', {
            style: {
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 120, marginLeft: 32,
                background: 'rgba(255,255,255,0.05)',
                borderRadius: 32, width: 160, height: 160,
            },
        }, p.currentUser.percent === 100 ? '🏆' : p.currentUser.percent >= 75 ? '🚀' : '✨')), h('div', { style: { display: 'flex', flexDirection: 'column', padding: '28px 40px 0' } }, h('div', {
            style: {
                fontSize: 22, fontWeight: 700, color: C.muted,
                letterSpacing: 2, marginBottom: 16,
                textTransform: 'uppercase',
            },
        }, '── Members ──'), ...memberRows), h('div', {
            style: {
                display: 'flex', alignItems: 'center',
                background: C.heroBg, margin: '12px 40px 40px',
                borderRadius: 24, padding: '24px 32px',
            },
        }, h('div', {
            style: {
                fontSize: 72, marginRight: 28,
                background: 'rgba(255,255,255,0.06)', borderRadius: 20,
                width: 96, height: 96,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
            },
        }, moodConfig.emoji), h('div', { style: { display: 'flex', flexDirection: 'column', flex: 1 } }, h('div', {
            style: { fontSize: 30, fontWeight: 900, color: C.white, marginBottom: 6 },
        }, moodConfig.msg), h('div', {
            style: { fontSize: 22, color: '#A78BFA' },
        }, `Group total: ${totalCompleted}/${totalItems} · ${overallPercent}% complete`)), h('div', { style: { marginLeft: 24 } }, h('div', {
            style: {
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center',
                background: moodConfig.color, borderRadius: 20,
                padding: '16px 24px',
            },
        }, h('div', { style: { fontSize: 48, fontWeight: 900, color: C.white, lineHeight: 1 } }, `${overallPercent}%`), h('div', { style: { fontSize: 18, color: 'rgba(255,255,255,0.8)', marginTop: 4 } }, 'overall')))));
    }
};
exports.ReportCardService = ReportCardService;
exports.ReportCardService = ReportCardService = ReportCardService_1 = __decorate([
    (0, common_1.Injectable)()
], ReportCardService);
//# sourceMappingURL=report-card.service.js.map