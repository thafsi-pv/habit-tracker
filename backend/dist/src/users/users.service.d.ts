import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserSettingsDto } from './dto/update-user-settings.dto';
import { NotificationsService } from '../notifications/notifications.service';
export declare class UsersService {
    private prisma;
    private notificationsService;
    constructor(prisma: PrismaService, notificationsService: NotificationsService);
    updateSettings(userId: string, dto: UpdateUserSettingsDto): Promise<{
        id: string;
        timezone: string;
        whatsappNumber: string | null;
        notificationTime: string | null;
        notificationsEnabled: boolean;
    }>;
}
