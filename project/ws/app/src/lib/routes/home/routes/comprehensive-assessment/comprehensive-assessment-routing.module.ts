import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { ConfigResolveService } from '../../resolvers/config-resolve.service'
import { ComprehensiveAssessmentsComponent } from './components/comprehensive-assessments/comprehensive-assessments.component'
import { CreateAssessmentComponent } from './components/create-assessment/create-assessment.component'
import { AssessmentsListComponent } from './components/assessments-list/assessments-list.component'
import { AssessmentResolverService } from './services/assessment-resolver'

const routes: Routes = [
  {
    path: '',
    component: ComprehensiveAssessmentsComponent,
    data: {
      pageId: 'home/comprehensive-assessment',
      module: 'comprehensive-assessment',
      pageType: 'feature',
      pageKey: 'comprehensive-assessment',
      path: '',
    },
    resolve: {
      configService: ConfigResolveService,
    },
    children: [
      {
        path: '',
        redirectTo: 'live',
        pathMatch: 'full',
      },
      {
        path: 'live',
        component: AssessmentsListComponent,
        data: {
          pageId: 'app/home/comprehensive-assessment/live',
          module: 'comprehensive-assessment',
        },
        resolve: {
          configService: ConfigResolveService,
        },
      },
      {
        path: 'draft',
        component: AssessmentsListComponent,
        data: {
          pageId: 'app/home/comprehensive-assessment/draft',
          module: 'comprehensive-assessment',
        },
        resolve: {
          configService: ConfigResolveService,
        },
      },
      {
        path: 'retired',
        component: AssessmentsListComponent,
        data: {
          pageId: 'app/home/comprehensive-assessment/retired',
          module: 'comprehensive-assessment',
        },
        resolve: {
          configService: ConfigResolveService,
        },
      },
    ],
  },
  {
    path: 'edit/:assessmentId',
    pathMatch: 'full',
    component: CreateAssessmentComponent,
    data: {
      pageId: 'home/comprehensive-assessment/edit',
      module: 'comprehensive-assessment',
    },
    resolve: {
      configService: ConfigResolveService,
      assessmentDetails: AssessmentResolverService,
    },
  },
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ComprehensiveAssessmentRoutingModule { }
