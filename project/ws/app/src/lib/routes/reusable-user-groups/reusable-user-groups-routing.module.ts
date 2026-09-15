import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { UserGroupsListComponent } from './routes/user-groups-list/user-groups-list.component'
import { ReusableUserGroupsComponent } from './routes/reusable-user-groups/reusable-user-groups.component'
import { ConfigResolveService } from '../home/resolvers/config-resolve.service'
import { PageResolve } from '@sunbird-cb/utils-v2'
import { CreateUserGroupsComponent } from './routes/create-user-groups/create-user-groups.component'

const routes: Routes = [
  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full',
  },
  {
    path: '',
    component: ReusableUserGroupsComponent,
    data: {
      pageId: 'home/reusable-user-groups',
      module: 'reusable-user-groups',
      pageType: 'feature',
      pageKey: 'reusable-user-groups',
      path: '',
    },
    resolve: {
      configService: ConfigResolveService,
      pageData: PageResolve,
    },
    children: [
      {
        path: 'list',
        component: UserGroupsListComponent,
      },
      {
        path: 'user-groups',
        component: CreateUserGroupsComponent,
      },
      {
        path: 'user-groups/:id',
        component: CreateUserGroupsComponent,
      },

    ]
  }
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [ConfigResolveService],
})
export class ReusableUserGroupsRoutingModule { }
