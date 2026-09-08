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
exports.TrackersService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
const redis_service_1 = require("../redis/redis.service");
let TrackersService = class TrackersService {
    constructor(prisma, redis) {
        this.prisma = prisma;
        this.redis = redis;
    }
    async create(userId, dto) {
        const result = await this.prisma.tracker.create({
            data: {
                name: dto.name,
                ownerId: userId,
                members: {
                    create: { userId, role: client_1.TrackerRole.MASTER },
                },
            },
            include: { members: { include: { user: { select: { id: true, name: true, avatarUrl: true } } } } },
        });
        this.redis.del(`trackers:user:${userId}`).catch(() => { });
        return result;
    }
    async findAllForUser(userId) {
        const cacheKey = `trackers:user:${userId}`;
        return this.redis.wrap(cacheKey, async () => {
            const memberships = await this.prisma.trackerMember.findMany({
                where: { userId },
                include: {
                    tracker: {
                        include: {
                            _count: { select: { members: true, habits: true } },
                        },
                    },
                },
                orderBy: { joinedAt: 'asc' },
            });
            return memberships.map((m) => ({ ...m.tracker, myRole: m.role }));
        });
    }
    async findOne(trackerId) {
        const cacheKey = `tracker:details:${trackerId}`;
        return this.redis.wrap(cacheKey, async () => {
            return this.prisma.tracker.findUniqueOrThrow({
                where: { id: trackerId },
                include: {
                    members: {
                        include: { user: { select: { id: true, name: true, avatarUrl: true, email: true } } },
                    },
                    habits: {
                        where: { isActive: true },
                        orderBy: { sortOrder: 'asc' },
                        include: { subtasks: { where: { isActive: true }, orderBy: { sortOrder: 'asc' } } },
                    },
                },
            });
        });
    }
    async update(trackerId, dto) {
        const result = await this.prisma.tracker.update({
            where: { id: trackerId },
            data: {
                name: dto.name,
                ...(dto.notifyOnActivityUpdate !== undefined && { notifyOnActivityUpdate: dto.notifyOnActivityUpdate })
            }
        });
        this.redis.del(`tracker:details:${trackerId}`).catch(() => { });
        this.redis.delByPattern('trackers:user:*').catch(() => { });
        return result;
    }
    async remove(trackerId) {
        await this.prisma.tracker.delete({ where: { id: trackerId } });
        this.redis.del(`tracker:details:${trackerId}`).catch(() => { });
        this.redis.delByPattern('trackers:user:*').catch(() => { });
        this.redis.delByPattern('dashboard:*').catch(() => { });
        return { success: true };
    }
};
exports.TrackersService = TrackersService;
exports.TrackersService = TrackersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        redis_service_1.RedisService])
], TrackersService);
//# sourceMappingURL=trackers.service.js.map