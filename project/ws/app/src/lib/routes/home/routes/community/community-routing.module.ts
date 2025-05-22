import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { CommunityDashboardComponent } from './components/community-dashboard/community-dashboard.component'
import { CommunityCreationComponent } from './components/community-creation/community-creation.component'
import { CommunityResolverService } from './services/community-resolver.service'
import { CommunityManageComponent } from './components/community-manage/community-manage.component'

const routes: Routes = [
  {
    path: '',
    component: CommunityDashboardComponent,
  },
  {
    path: 'create',
    component: CommunityCreationComponent,
  },
  {
    path: 'manage/:communityId',
    component: CommunityManageComponent,
  },
  {
    path: 'edit/:communityId',
    component: CommunityCreationComponent,
    resolve: {
      communityDetails: CommunityResolverService
    },
  },
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CommunityRoutingModule { }
