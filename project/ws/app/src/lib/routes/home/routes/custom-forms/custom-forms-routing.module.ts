import { NgModule } from "@angular/core"
import { RouterModule, Routes } from "@angular/router"
import { ConfigResolveService } from "../../resolvers/config-resolve.service"
import { FormsListComponent } from "./forms-list/forms-list.component"
import { BaseComponent } from "./base/base.component"

const routes: Routes = [
  {
    path: '',
    component: BaseComponent,
    data: {
      pageId: 'home/forms',
      module: 'forms',
      pageType: 'feature',
      pageKey: 'Forms',
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
        component: FormsListComponent,
        data: {
          pageId: 'home/forms/list',
          module: 'forms',
          pageType: 'feature',
          pageKey: 'Forms',
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
export class FormsRoutingModule { }