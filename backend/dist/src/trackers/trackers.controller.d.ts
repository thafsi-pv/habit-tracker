import { TrackersService } from './trackers.service';
import { CreateTrackerDto, UpdateTrackerDto } from './dto/tracker.dto';
import { AuthenticatedUser } from '../common/decorators/current-user.decorator';
export declare class TrackersController {
    private trackersService;
    constructor(trackersService: TrackersService);
    create(user: AuthenticatedUser, dto: CreateTrackerDto): Promise<{
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
        whatsappGroupId: string | null;
        whatsappGroupInviteLink: string | null;
    }>;
    findAll(user: AuthenticatedUser): Promise<{
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
        whatsappGroupId: string | null;
        whatsappGroupInviteLink: string | null;
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
        whatsappGroupId: string | null;
        whatsappGroupInviteLink: string | null;
    }>;
    update(trackerId: string, dto: UpdateTrackerDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        ownerId: string;
        notifyOnActivityUpdate: boolean;
        whatsappGroupId: string | null;
        whatsappGroupInviteLink: string | null;
    }>;
    remove(trackerId: string): Promise<{
        success: boolean;
    }>;
}
