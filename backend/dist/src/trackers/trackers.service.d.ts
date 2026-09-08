import { PrismaService } from '../prisma/prisma.service';
import { CreateTrackerDto, UpdateTrackerDto } from './dto/tracker.dto';
import { RedisService } from '../redis/redis.service';
export declare class TrackersService {
    private prisma;
    private redis;
    constructor(prisma: PrismaService, redis: RedisService);
    create(userId: string, dto: CreateTrackerDto): Promise<{
        members: ({
            user: {
                id: string;
                name: string;
                avatarUrl: string | null;
            };
        } & {
            id: string;
            role: import(".prisma/client").$Enums.TrackerRole;
            joinedAt: Date;
            userId: string;
            trackerId: string;
        })[];
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        ownerId: string;
        notifyOnActivityUpdate: boolean;
    }>;
    findAllForUser(userId: string): Promise<{
        myRole: import(".prisma/client").$Enums.TrackerRole;
        _count: {
            members: number;
            habits: number;
        };
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        ownerId: string;
        notifyOnActivityUpdate: boolean;
    }[]>;
    findOne(trackerId: string): Promise<{
        members: ({
            user: {
                id: string;
                email: string;
                name: string;
                avatarUrl: string | null;
            };
        } & {
            id: string;
            role: import(".prisma/client").$Enums.TrackerRole;
            joinedAt: Date;
            userId: string;
            trackerId: string;
        })[];
        habits: ({
            subtasks: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                sortOrder: number;
                isActive: boolean;
                habitId: string;
            }[];
        } & {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            icon: string | null;
            sortOrder: number;
            isActive: boolean;
            trackerId: string;
        })[];
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        ownerId: string;
        notifyOnActivityUpdate: boolean;
    }>;
    update(trackerId: string, dto: UpdateTrackerDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        ownerId: string;
        notifyOnActivityUpdate: boolean;
    }>;
    remove(trackerId: string): Promise<{
        success: boolean;
    }>;
}
