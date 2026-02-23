import { NgModule } from "@angular/core"
import { RouterModule, Routes } from "@angular/router"
import { ConfigResolveService } from "../../resolvers/config-resolve.service"
import { BaseComponent } from "./base/base.component"
import { ApprovalsListComponent } from "./approvals-list/approvals-list.component"

const routes: Routes = [
  {
    path: '',
    component: BaseComponent,
    data: {
      pageId: 'home/achievement-approvals',
      module: 'achievement',
      pageType: 'feature',
      pageKey: 'Achievement',
      path: '',
    },
    resolve: {
      configService: ConfigResolveService,
    },
    children: [
      {
        path: '',
        redirectTo: '',
        pathMatch: 'full',
      },
      {
        path: '',
        component: ApprovalsListComponent,
        data: {
          pageId: 'home/achievement-approvals/list',
          module: 'achievement',
          pageType: 'feature',
          pageKey: 'Achievement',
          path: '',
        },
        resolve: {
          configService: ConfigResolveService,
        },
      },

    ]
  },

]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AchievementApprovalsRoutingModule { }