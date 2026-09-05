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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DailyHabitsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const authorization_service_1 = require("../common/authorization.service");
const date_util_1 = require("../common/date.util");
const notifications_service_1 = require("../notifications/notifications.service");
let DailyHabitsService = class DailyHabitsService {
    constructor(prisma, authz, notificationsService) {
        this.prisma = prisma;
        this.authz = authz;
        this.notificationsService = notificationsService;
    }
    async setHabitCompletion(userId, habitId, dto) {
        await this.authz.requireHabitAccess(userId, habitId);
        const date = (0, date_util_1.parseCalendarDate)(dto.date);
        const result = await this.prisma.dailyHabit.upsert({
            where: { habitId_userId_date: { habitId, userId, date } },
            create: { habitId, userId, date, completed: dto.completed, completedAt: dto.completed ? new Date() : null },
            update: { completed: dto.completed, completedAt: dto.completed ? new Date() : null },
        });
        if (dto.completed) {
            const user = await this.prisma.user.findUnique({ where: { id: userId } });
            const habit = await this.prisma.habit.findUnique({ where: { id: habitId }, include: { tracker: true } });
            if (user && habit && habit.tracker.notifyOnActivityUpdate) {
                this.notificationsService.broadcastActivityCompletion(habit.trackerId, habit.name, userId, user.name).catch(() => { });
            }
        }
        return result;
    }
    async setSubtaskCompletion(userId, subtaskId, dto) {
        await this.authz.requireSubtaskAccess(userId, subtaskId);
        const date = (0, date_util_1.parseCalendarDate)(dto.date);
        const result = await this.prisma.dailySubtaskCompletion.upsert({
            where: { subtaskId_userId_date: { subtaskId, userId, date } },
            create: {
                subtaskId,
                userId,
                date,
                completed: dto.completed,
                completedAt: dto.completed ? new Date() : null,
            },
            update: { completed: dto.completed, completedAt: dto.completed ? new Date() : null },
        });
        if (dto.completed) {
            const user = await this.prisma.user.findUnique({ where: { id: userId } });
            const subtask = await this.prisma.habitSubtask.findUnique({
                where: { id: subtaskId },
                include: { habit: { include: { tracker: true } } }
            });
            if (user && subtask && subtask.habit.tracker.notifyOnActivityUpdate) {
                const activityName = `${subtask.habit.name} - ${subtask.name}`;
                this.notificationsService.broadcastActivityCompletion(subtask.habit.trackerId, activityName, userId, user.name).catch(() => { });
            }
        }
        return result;
    }
    async getForTrackerAndDate(userId, trackerId, dateStr) {
        await this.authz.getMembership(userId, trackerId);
        const date = (0, date_util_1.parseCalendarDate)(dateStr);
        const [habitCompletions, subtaskCompletions] = await Promise.all([
            this.prisma.dailyHabit.findMany({
                where: { date, habit: { trackerId } },
            }),
            this.prisma.dailySubtaskCompletion.findMany({
                where: { date, subtask: { habit: { trackerId } } },
            }),
        ]);
        return { habitCompletions, subtaskCompletions };
    }
};
exports.DailyHabitsService = DailyHabitsService;
exports.DailyHabitsService = DailyHabitsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        authorization_service_1.AuthorizationService,
        notifications_service_1.NotificationsService])
], DailyHabitsService);
//# sourceMappingURL=daily-habits.service.js.map