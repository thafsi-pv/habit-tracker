interface SubtaskRow {
    name: string;
    completed: boolean;
}
interface HabitRow {
    name: string;
    icon: string | null;
    completed: boolean;
    streak: number;
    subtasks: SubtaskRow[];
}
interface MemberCardData {
    name: string;
    isMaster: boolean;
    isCurrentUser: boolean;
    habits: HabitRow[];
    completed: number;
    total: number;
    percent: number;
}
interface ReportImageParams {
    trackerName: string;
    userName: string;
    dateLabel: string;
    currentUser: MemberCardData;
    otherMembers: MemberCardData[];
}
export declare class ReportCardService {
    private readonly logger;
    private readonly fontPath;
    private readonly malayalamFontPath;
    private cachedFont;
    private cachedMalayalamFont;
    private getFont;
    private getMalayalamFont;
    estimateHeight(p: ReportImageParams): number;
    render(params: ReportImageParams): Promise<Buffer>;
    private buildJsx;
}
export {};
