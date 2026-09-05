import { PrismaService } from '../prisma/prisma.service';
import { AuthorizationService } from '../common/authorization.service';
import { SetCompletionDto } from './dto/daily-habit.dto';
import { NotificationsService } from '../notifications/notifications.service';
export declare class DailyHabitsService {
    private prisma;
    private authz;
    private notificationsService;
    constructor(prisma: PrismaService, authz: AuthorizationService, notificationsService: NotificationsService);
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
        date: Date;
        completed: boolean;
        completedAt: Date | null;
        subtaskId: string;
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
            date: Date;
            completed: boolean;
            completedAt: Date | null;
            subtaskId: string;
        }[];
    }>;
}
