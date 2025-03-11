import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { CommunityDashboardComponent } from './components/community-dashboard/community-dashboard.component'
import { CommunityCreationComponent } from './components/community-creation/community-creation.component'

const routes: Routes = [
  {
    path: '',
    component: CommunityDashboardComponent,
  },
  {
    path: 'create',
    component: CommunityCreationComponent,
  },
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CommunityRoutingModule { }
