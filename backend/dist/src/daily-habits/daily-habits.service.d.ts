import { PrismaService } from '../prisma/prisma.service';
import { AuthorizationService } from '../common/authorization.service';
import { SetCompletionDto } from './dto/daily-habit.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { RedisService } from '../redis/redis.service';
export declare class DailyHabitsService {
    private prisma;
    private authz;
    private notificationsService;
    private redis;
    constructor(prisma: PrismaService, authz: AuthorizationService, notificationsService: NotificationsService, redis: RedisService);
    setHabitCompletion(userId: string, habitId: string, dto: SetCompletionDto): Promise<{
        id: string;
        userId: string;
        habitId: string;
        date: Date;
        completed: boolean;
        completedAt: Date | null;
    }>;
    setSubtaskCompletion(userId: string, subtaskId: string, dto: SetCompletionDto): Promise<{
        id: string;
        userId: string;
        subtaskId: string;
        date: Date;
        completed: boolean;
        completedAt: Date | null;
    }>;
    getForTrackerAndDate(userId: string, trackerId: string, dateStr: string): Promise<{
        habitCompletions: {
            id: string;
            userId: string;
            habitId: string;
            date: Date;
            completed: boolean;
            completedAt: Date | null;
        }[];
        subtaskCompletions: {
            id: string;
            userId: string;
            subtaskId: string;
            date: Date;
            completed: boolean;
            completedAt: Date | null;
        }[];
    }>;
}
