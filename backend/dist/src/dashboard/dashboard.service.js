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
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const authorization_service_1 = require("../common/authorization.service");
const progress_service_1 = require("../progress/progress.service");
const date_util_1 = require("../common/date.util");
const habit_completion_util_1 = require("../progress/habit-completion.util");
const redis_service_1 = require("../redis/redis.service");
let DashboardService = class DashboardService {
    constructor(prisma, authz, progressService, redis) {
        this.prisma = prisma;
        this.authz = authz;
        this.progressService = progressService;
        this.redis = redis;
    }
    async getToday(userId, trackerId, dateStr) {
        await this.authz.getMembership(userId, trackerId);
        const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
        const date = dateStr ?? (0, date_util_1.todayInTimezone)(user.timezone);
        const cacheKey = `dashboard:today:${userId}:${trackerId}:${date}`;
        return this.redis.wrap(cacheKey, async () => {
            const dbDate = (0, date_util_1.parseCalendarDate)(date);
            const habits = await this.prisma.habit.findMany({
                where: { trackerId, isActive: true },
                orderBy: { sortOrder: 'asc' },
                include: { subtasks: { where: { isActive: true }, orderBy: { sortOrder: 'asc' } } },
            });
            const [habitCompletions, subtaskCompletions] = await Promise.all([
                this.prisma.dailyHabit.findMany({ where: { date: dbDate, habit: { trackerId }, userId } }),
                this.prisma.dailySubtaskCompletion.findMany({
                    where: { date: dbDate, subtask: { habit: { trackerId } }, userId },
                }),
            ]);
            const { habitCompletedSet, subtaskCompletedSet } = (0, habit_completion_util_1.buildCompletedSets)(habitCompletions, subtaskCompletions, userId);
            const myHabits = habits.map((h) => ({
                id: h.id,
                name: h.name,
                icon: h.icon,
                completed: habitCompletedSet.has(h.id),
                subtasks: h.subtasks.map((s) => ({
                    id: s.id,
                    name: s.name,
                    completed: subtaskCompletedSet.has(s.id),
                })),
            }));
            let totalItems = 0;
            let completedItems = 0;
            myHabits.forEach((h) => {
                if (h.subtasks.length === 0) {
                    totalItems++;
                    if (h.completed)
                        completedItems++;
                }
                else {
                    totalItems += h.subtasks.length;
                    completedItems += h.subtasks.filter((s) => s.completed).length;
                }
            });
            const groupProgress = await this.progressService.getDailyProgress(userId, trackerId, date);
            return {
                date,
                userName: user.name,
                myProgress: {
                    completed: completedItems,
                    total: totalItems,
                    percent: totalItems === 0 ? 0 : Math.round((completedItems / totalItems) * 100),
                },
                myHabits,
                groupProgress: groupProgress.members,
            };
        });
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        authorization_service_1.AuthorizationService,
        progress_service_1.ProgressService,
        redis_service_1.RedisService])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map