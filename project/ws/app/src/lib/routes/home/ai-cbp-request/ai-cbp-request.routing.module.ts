import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'
import { AiCbpComponent, ReviewRequestComponent } from '@sunbird-cb/cbp-ai'
import { PageResolve } from '@sunbird-cb/utils-v2'
import { ConfigResolveService } from '../resolvers/config-resolve.service'
import { AICBPRequestListComponent } from './components/ai-cbp-request-list/ai-cbp-request-list.component'
import { AICBPRequestComponent } from './ai-cbp-request.component'
import { AICBPConfigResolver } from './ai-cbp-request.resolver'
const routes: Routes = [
  {
    path: '',
    component: AICBPRequestComponent,
    children: [
      {
        path: '',
        component: AICBPRequestListComponent,
      },
      {
        path: 'acbp-list',
        component: AiCbpComponent,
        children: [
          { path: 'review-request/:request_id', component: ReviewRequestComponent, resolve: { parentData: AICBPConfigResolver } },

        ]
      }
    ],
    resolve: {
      pageData: PageResolve,
      configService: ConfigResolveService,
    },
  },

]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [],
})
export class AICBPRequestRoutingModule { }
