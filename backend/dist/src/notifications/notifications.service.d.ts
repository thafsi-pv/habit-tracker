import { PrismaService } from '../prisma/prisma.service';
import { WhatsAppService } from '../whatsapp/whatsapp.service';
import { DashboardService } from '../dashboard/dashboard.service';
import { ProgressService } from '../progress/progress.service';
import { ReportCardService } from './report-card.service';
export declare class NotificationsService {
    private prisma;
    private whatsappService;
    private dashboardService;
    private progressService;
    private reportCardService;
    private readonly logger;
    constructor(prisma: PrismaService, whatsappService: WhatsAppService, dashboardService: DashboardService, progressService: ProgressService, reportCardService: ReportCardService);
    sendTrackerReports(trackerId: string): Promise<void>;
    broadcastActivityCompletion(trackerId: string, activityName: string, completedByUserId: string, completedByUserName: string): Promise<void>;
}
