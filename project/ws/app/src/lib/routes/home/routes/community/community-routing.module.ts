import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { CommunityDashboardComponent } from './components/community-dashboard/community-dashboard.component'
import { CommunityCreationComponent } from './components/community-creation/community-creation.component'
import { CommunityResolverService } from './services/community-resolver.service'
import { CommunityManageComponent } from './components/community-manage/community-manage.component'
import { GeneralGuard } from '../../../../../../../../../src/app/guards/general.guard'

const routes: Routes = [
  {
    path: '',
    component: CommunityDashboardComponent,
  },
  {
    path: 'create',
    component: CommunityCreationComponent,
    canActivate: [GeneralGuard],
    data: {
      requiredRoles: ['mdo_leader'],
    },
  },
  {
    path: 'manage/:communityId',
    component: CommunityManageComponent,
    canActivate: [GeneralGuard],
    data: {
      requiredRoles: ['mdo_leader', 'community_moderator'],
    },
  },
  {
    path: 'edit/:communityId',
    component: CommunityCreationComponent,
    resolve: {
      communityDetails: CommunityResolverService
    },
    canActivate: [GeneralGuard],
    data: {
      requiredRoles: ['mdo_leader'],
    },
  },
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CommunityRoutingModule { }
