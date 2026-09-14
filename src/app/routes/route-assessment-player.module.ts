import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule, Routes } from '@angular/router'
import { AssessmentPlayerComponent } from './assessment-player/assessment-player.component'

/**
 * The player, mounted away from the home shell so it arrives without the portal's left menu.
 * `ViewerModule` is the very same one `app/home/explore-content/viewer` loads, so the routes
 * under here are the player's own — `practice/:resourceId` and the rest.
 */
const routes: Routes = [
  {
    path: '',
    component: AssessmentPlayerComponent,
    children: [
      {
        path: '',
        loadChildren: () => import('@ws/viewer').then(m => m.ViewerModule),
        data: {
          pageId: 'assessment-player',
          module: 'comprehensive-assessment',
        },
      },
    ],
  },
]

@NgModule({
  declarations: [AssessmentPlayerComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
  ],
})
export class RouteAssessmentPlayerModule { }
