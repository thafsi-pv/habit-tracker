import { PrismaService } from '../prisma/prisma.service';
import { CreateTrackerDto, UpdateTrackerDto } from './dto/tracker.dto';
export declare class TrackersService {
    private prisma;
    constructor(prisma: PrismaService);
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
        notifyOnActivityUpdate: boolean;
        createdAt: Date;
        updatedAt: Date;
        ownerId: string;
    }>;
    findAllForUser(userId: string): Promise<{
        myRole: import(".prisma/client").$Enums.TrackerRole;
        _count: {
            members: number;
            habits: number;
        };
        id: string;
        name: string;
        notifyOnActivityUpdate: boolean;
        createdAt: Date;
        updatedAt: Date;
        ownerId: string;
    }[]>;
    findOne(trackerId: string): Promise<{
        members: ({
            user: {
                id: string;
                name: string;
                email: string;
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
                isActive: boolean;
                sortOrder: number;
                habitId: string;
            }[];
        } & {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            trackerId: string;
            isActive: boolean;
            sortOrder: number;
            icon: string | null;
        })[];
    } & {
        id: string;
        name: string;
        notifyOnActivityUpdate: boolean;
        createdAt: Date;
        updatedAt: Date;
        ownerId: string;
    }>;
    update(trackerId: string, dto: UpdateTrackerDto): Promise<{
        id: string;
        name: string;
        notifyOnActivityUpdate: boolean;
        createdAt: Date;
        updatedAt: Date;
        ownerId: string;
    }>;
    remove(trackerId: string): Promise<{
        success: boolean;
    }>;
}
