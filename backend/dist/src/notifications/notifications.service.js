"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var NotificationsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
const whatsapp_service_1 = require("../whatsapp/whatsapp.service");
const dashboard_service_1 = require("../dashboard/dashboard.service");
const progress_service_1 = require("../progress/progress.service");
const report_card_service_1 = require("./report-card.service");
const date_util_1 = require("../common/date.util");
function formatHabitLine(h) {
    const icon = h.icon ?? '•';
    const status = h.completed ? '✅' : '❌';
    const streak = h.streak > 0 ? ` 🔥 ${h.streak} day streak` : '';
    const lines = [`  ${icon} ${h.name}  ${status}${streak}`];
    if (h.subtasks && h.subtasks.length > 0) {
        for (const sub of h.subtasks) {
            lines.push(`     └─ ${sub.completed ? '✅' : '❌'} ${sub.name}`);
        }
    }
    return lines;
}
function formatMemberSection(member, isCurrentUser) {
    const label = isCurrentUser ? '📋 *Your Activity*' : `👤 *${member.name}*${member.isMaster ? ' 👑' : ''}`;
    const lines = [
        label,
        '─'.repeat(20),
    ];
    for (const h of member.habits) {
        lines.push(...formatHabitLine(h));
        lines.push('');
    }
    const bar = buildProgressBar(member.percent);
    lines.push(`  📊 ${member.completed}/${member.total} completed  ${bar}  ${member.percent}%`);
    if (member.percent === 100) {
        lines.push('  🎉 Perfect day!');
    }
    return lines;
}
function buildProgressBar(percent) {
    const filled = Math.round(percent / 10);
    const empty = 10 - filled;
    return '▓'.repeat(filled) + '░'.repeat(empty);
}
function buildReportMessage(params) {
    const { trackerName, userName, dateLabel, currentUser, otherMembers } = params;
    const allMembers = [currentUser, ...otherMembers];
    const totalCompleted = allMembers.reduce((s, m) => s + m.completed, 0);
    const totalHabits = allMembers.reduce((s, m) => s + m.total, 0);
    const overallPercent = totalHabits > 0 ? Math.round((totalCompleted / totalHabits) * 100) : 0;
    const lines = [
        '🌙 *Daily Habit Report*',
        '',
        `📌 *${trackerName}*`,
        `📅 ${dateLabel}`,
        '',
        `Hey ${userName} 👋`,
        '',
        ...formatMemberSection(currentUser, true),
        '',
    ];
    for (const member of otherMembers) {
        lines.push(...formatMemberSection(member, false));
        lines.push('');
    }
    lines.push('━'.repeat(20));
    lines.push('📈 *Overall Group Summary*');
    lines.push('');
    for (const m of allMembers) {
        const bar = buildProgressBar(m.percent);
        lines.push(`  ${m.isMaster ? '👑' : '👤'} ${m.name}: ${m.completed}/${m.total}  ${bar}  ${m.percent}%`);
    }
    lines.push('');
    lines.push(`  🏆 Group Total: ${totalCompleted}/${totalHabits} (${overallPercent}%)`);
    if (overallPercent === 100) {
        lines.push('  🎉🎉 Everyone nailed it today! 🎉🎉');
    }
    else if (overallPercent >= 75) {
        lines.push('  💪 Great teamwork!');
    }
    else {
        lines.push('  🔥 Let\'s push harder tomorrow!');
    }
    return lines.join('\n');
}
function buildGroupReportMessage(params) {
    const { trackerName, dateLabel, members } = params;
    const totalCompleted = members.reduce((s, m) => s + m.completed, 0);
    const totalHabits = members.reduce((s, m) => s + m.total, 0);
    const overallPercent = totalHabits > 0 ? Math.round((totalCompleted / totalHabits) * 100) : 0;
    const lines = [
        '🌙 *Daily Habit Report*',
        `📌 *${trackerName}*`,
        `📅 ${dateLabel}`,
        '',
        `📊 *Group Progress:* ${totalCompleted}/${totalHabits} completed (${overallPercent}%)`,
        buildProgressBar(overallPercent),
        '',
        '👥 *Member Breakdown:*',
    ];
    for (const m of members) {
        const bar = buildProgressBar(m.percent);
        const badge = m.percent === 100 ? '🌟' : m.percent >= 50 ? '⚡' : '⏳';
        const role = m.isMaster ? ' 👑' : '';
        lines.push(`${badge} *${m.name}*${role}: ${m.completed}/${m.total} (${m.percent}%)`);
        lines.push(`   ${bar}`);
    }
    lines.push('');
    if (overallPercent === 100) {
        lines.push('🎉🎉 *Outstanding! Everyone completed 100% today!* 🎉🎉');
    }
    else if (overallPercent >= 75) {
        lines.push('💪 *Great teamwork! Keep up the momentum!*');
    }
    else {
        lines.push("🔥 *Good effort today! Let's push higher tomorrow!*");
    }
    return lines.join('\n');
}
let NotificationsService = NotificationsService_1 = class NotificationsService {
    constructor(prisma, whatsappService, dashboardService, progressService, reportCardService) {
        this.prisma = prisma;
        this.whatsappService = whatsappService;
        this.dashboardService = dashboardService;
        this.progressService = progressService;
        this.reportCardService = reportCardService;
        this.logger = new common_1.Logger(NotificationsService_1.name);
    }
    async ensureTrackerWhatsAppGroup(trackerId) {
        const tracker = await this.prisma.tracker.findUnique({
            where: { id: trackerId },
            include: {
                owner: true,
                members: { include: { user: true } },
            },
        });
        if (!tracker)
            return null;
        const adminUser = await this.prisma.user.findUnique({ where: { email: 'thafsi@example.com' } });
        let senderId = adminUser?.id;
        let status = senderId ? await this.whatsappService.getStatus(senderId) : null;
        if (status?.status !== 'CONNECTED') {
            const ownerStatus = await this.whatsappService.getStatus(tracker.ownerId);
            if (ownerStatus.status === 'CONNECTED') {
                senderId = tracker.ownerId;
                status = ownerStatus;
            }
        }
        if (!senderId || status?.status !== 'CONNECTED') {
            this.logger.warn(`WhatsApp sender is not connected for tracker ${trackerId}`);
            return null;
        }
        const memberNumbers = tracker.members
            .map((m) => m.user.whatsappNumber)
            .filter((num) => typeof num === 'string' && num.trim().length > 0);
        if (tracker.whatsappGroupId) {
            if (memberNumbers.length > 0) {
                this.whatsappService.addParticipantsToGroup(senderId, tracker.whatsappGroupId, memberNumbers).catch((err) => {
                    this.logger.warn(`Could not sync participants to group ${tracker.whatsappGroupId}: ${err?.message}`);
                });
            }
            return { groupId: tracker.whatsappGroupId, senderId };
        }
        if (memberNumbers.length === 0) {
            this.logger.warn(`Cannot create WhatsApp group for tracker ${trackerId}: No members have a valid WhatsApp number`);
            return null;
        }
        const groupName = `${tracker.name} (Habits)`;
        this.logger.log(`Creating WhatsApp group "${groupName}" for tracker ${trackerId} with members: ${memberNumbers.join(', ')}`);
        const result = await this.whatsappService.createGroup(senderId, groupName, memberNumbers);
        if (!result.success || !result.groupId) {
            this.logger.error(`Failed to create WhatsApp group for tracker ${trackerId}: ${result.error}`);
            return null;
        }
        await this.prisma.tracker.update({
            where: { id: trackerId },
            data: {
                whatsappGroupId: result.groupId,
                whatsappGroupInviteLink: result.inviteLink ?? null,
            },
        });
        this.logger.log(`Created WhatsApp group ${result.groupId} for tracker ${trackerId}`);
        return { groupId: result.groupId, senderId };
    }
    async sendTrackerReports(trackerId) {
        const tracker = await this.prisma.tracker.findUnique({
            where: { id: trackerId },
            include: {
                owner: true,
                members: { include: { user: true } },
            },
        });
        if (!tracker)
            return;
        const groupInfo = await this.ensureTrackerWhatsAppGroup(trackerId);
        if (!groupInfo) {
            this.logger.warn(`Cannot send tracker report: WhatsApp group not ready for tracker ${trackerId}`);
            return;
        }
        const masterId = tracker.ownerId;
        const masterTimezone = tracker.owner.timezone;
        const today = (0, date_util_1.todayInTimezone)(masterTimezone);
        const dateLabel = new Date(`${today}T00:00:00Z`).toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            timeZone: 'UTC',
        });
        const memberReports = [];
        for (const member of tracker.members) {
            try {
                const dashboard = await this.dashboardService.getToday(member.user.id, trackerId, today);
                const monthly = await this.progressService.getMonthlyProgress(member.user.id, trackerId);
                memberReports.push({
                    name: member.user.name,
                    isMaster: member.user.id === masterId,
                    habits: dashboard.myHabits.map((h) => {
                        const streak = monthly.habits.find((mh) => mh.habitId === h.id)?.currentStreak ?? 0;
                        return {
                            name: h.name,
                            icon: h.icon,
                            completed: h.subtasks.length === 0 ? h.completed : h.subtasks.every((s) => s.completed),
                            streak,
                            subtasks: (h.subtasks || []).map((s) => ({
                                name: s.name,
                                completed: s.completed,
                            })),
                        };
                    }),
                    completed: dashboard.myProgress.completed,
                    total: dashboard.myProgress.total,
                    percent: dashboard.myProgress.percent,
                });
            }
            catch (err) {
                this.logger.error(`Error fetching data for member ${member.user.id}`, err);
            }
        }
        if (memberReports.length === 0)
            return;
        memberReports.sort((a, b) => b.percent - a.percent);
        const caption = buildGroupReportMessage({
            trackerName: tracker.name,
            dateLabel,
            members: memberReports,
        });
        try {
            const image = await this.reportCardService.render({
                trackerName: tracker.name,
                userName: tracker.name,
                dateLabel,
                currentUser: { ...memberReports[0], isCurrentUser: false },
                otherMembers: memberReports.slice(1).map((m) => ({ ...m, isCurrentUser: false })),
            });
            const log = await this.prisma.notificationLog.create({
                data: {
                    userId: tracker.ownerId,
                    trackerId,
                    type: client_1.NotificationType.DAILY_REPORT,
                    channel: client_1.NotificationChannel.WHATSAPP,
                    status: 'PENDING',
                    message: caption,
                },
            });
            const result = await this.whatsappService.sendImageToGroup(groupInfo.senderId, groupInfo.groupId, image, caption);
            await this.prisma.notificationLog.update({
                where: { id: log.id },
                data: {
                    status: result.success ? 'SENT' : 'FAILED',
                    sentAt: result.success ? new Date() : null,
                    error: result.error,
                },
            });
            if (!result.success) {
                this.logger.warn(`Daily report image to group ${groupInfo.groupId} failed: ${result.error}`);
            }
        }
        catch (err) {
            this.logger.error(`Error sending group report image for tracker ${trackerId}`, err);
        }
    }
    async broadcastActivityCompletion(trackerId, activityName, completedByUserId, completedByUserName) {
        const tracker = await this.prisma.tracker.findUnique({
            where: { id: trackerId },
        });
        if (!tracker || !tracker.notifyOnActivityUpdate)
            return;
        const groupInfo = await this.ensureTrackerWhatsAppGroup(trackerId);
        if (!groupInfo) {
            this.logger.warn(`Cannot broadcast activity completion: WhatsApp group not ready for tracker ${trackerId}`);
            return;
        }
        const message = `✅ *${completedByUserName}* just completed *${activityName}* in *${tracker.name}*!`;
        try {
            const result = await this.whatsappService.sendToGroup(groupInfo.senderId, groupInfo.groupId, message);
            await this.prisma.notificationLog.create({
                data: {
                    userId: completedByUserId,
                    trackerId,
                    type: client_1.NotificationType.ACTIVITY_COMPLETION,
                    channel: client_1.NotificationChannel.WHATSAPP,
                    status: result.success ? 'SENT' : 'FAILED',
                    sentAt: result.success ? new Date() : null,
                    message,
                    error: result.error,
                },
            });
            if (!result.success) {
                this.logger.warn(`Broadcast to WhatsApp group failed for tracker ${trackerId}: ${result.error}`);
            }
        }
        catch (err) {
            this.logger.error(`Error broadcasting activity to group for tracker ${trackerId}`, err);
        }
    }
    async syncMemberToTrackerGroup(trackerId, userWhatsappNumber) {
        if (!userWhatsappNumber)
            return;
        const tracker = await this.prisma.tracker.findUnique({
            where: { id: trackerId },
            select: { whatsappGroupId: true, ownerId: true },
        });
        if (!tracker?.whatsappGroupId)
            return;
        const adminUser = await this.prisma.user.findUnique({ where: { email: 'thafsi@example.com' } });
        const senderId = adminUser?.id ?? tracker.ownerId;
        await this.whatsappService.addParticipantsToGroup(senderId, tracker.whatsappGroupId, [userWhatsappNumber]).catch((err) => {
            this.logger.warn(`Could not add member to group ${tracker.whatsappGroupId}: ${err?.message}`);
        });
    }
    async removeMemberFromTrackerGroup(trackerId, userWhatsappNumber) {
        if (!userWhatsappNumber)
            return;
        const tracker = await this.prisma.tracker.findUnique({
            where: { id: trackerId },
            select: { whatsappGroupId: true, ownerId: true },
        });
        if (!tracker?.whatsappGroupId)
            return;
        const adminUser = await this.prisma.user.findUnique({ where: { email: 'thafsi@example.com' } });
        const senderId = adminUser?.id ?? tracker.ownerId;
        await this.whatsappService.removeParticipantsFromGroup(senderId, tracker.whatsappGroupId, [userWhatsappNumber]).catch((err) => {
            this.logger.warn(`Could not remove member from group ${tracker.whatsappGroupId}: ${err?.message}`);
        });
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = NotificationsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        whatsapp_service_1.WhatsAppService,
        dashboard_service_1.DashboardService,
        progress_service_1.ProgressService,
        report_card_service_1.ReportCardService])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map