import { Global, Module } from '@nestjs/common';
import { AuthorizationService } from './authorization.service';
import { TrackerMemberGuard } from './guards/tracker-member.guard';

@Global()
@Module({
  providers: [AuthorizationService, TrackerMemberGuard],
  exports: [AuthorizationService, TrackerMemberGuard],
})
export class CommonModule {}
