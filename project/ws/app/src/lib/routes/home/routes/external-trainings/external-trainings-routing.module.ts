import { NgModule } from "@angular/core"
import { RouterModule, Routes } from "@angular/router"
import { ConfigResolveService } from "../../resolvers/config-resolve.service"
import { BaseComponent } from "./base/base.component"
import { ListComponent } from "./list/list.component"

const routes: Routes = [
  {
    path: '',
    component: BaseComponent,
    data: {
      pageId: 'home/external-trainings',
      module: 'external-trainings',
      pageType: 'feature',
      pageKey: 'ExternalTrainings',
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
        component: ListComponent,
        data: {
          pageId: 'home/external-trainings/list',
          module: 'external-trainings',
          pageType: 'feature',
          pageKey: 'ExternalTrainings',
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
export class ExternalTrainingsRoutingModule { }