import { NgModule } from "@angular/core"
import { RouterModule, Routes } from "@angular/router"
import { ConfigResolveService } from "../../resolvers/config-resolve.service"
import { BaseComponent } from "./base/base.component"
import { ListComponent } from "./list/list.component"
import { BatchesComponent } from "./batches/batches.component"
import { DetailsComponent } from "./details/details.component"
import { TrainingViewComponent } from "./training-view/training-view.component"
import { CreateBatchComponent } from "./create-batch/create-batch.component"
import { NewExternalTrainingComponent } from "./new-external-training/new-external-training.component"
import { BatchDetailsComponent } from "./batch-details/batch-details.component"

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

      {
        path: 'new',
        component: NewExternalTrainingComponent,
        data: {
          pageId: 'home/external-trainings/new',
          module: 'external-trainings',
          pageType: 'feature',
          pageKey: 'ExternalTrainings',
          path: '',
        },
        resolve: {
          configService: ConfigResolveService,
        },
      },
      {
        path: ':id/batches/:batchId',
        component: BatchDetailsComponent,
        data: {
          pageId: 'home/external-trainings/id/batches/:batchId',
          module: 'external-trainings',
          pageType: 'feature',
          pageKey: 'ExternalTrainings',
          path: '',
        },
        resolve: {
          configService: ConfigResolveService,
        },
      },

      {
        path: ':id',
        component: TrainingViewComponent,
        data: {
          pageId: 'home/external-trainings/id',
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
            redirectTo: 'details',
            pathMatch: 'full',
          },
          {
            path: 'details',
            component: DetailsComponent,
            data: {
              pageId: 'home/external-trainings/id/details',
              module: 'external-trainings',
              pageType: 'feature',
              pageKey: 'ExternalTrainings',
              path: '',
            },
            resolve: {
              configService: ConfigResolveService,
            },
          },
          {
            path: 'create-batch',
            component: CreateBatchComponent,
            data: {
              pageId: 'home/external-trainings/id/batches/new',
              module: 'external-trainings',
              pageType: 'feature',
              pageKey: 'ExternalTrainings',
              path: '',
            },
            resolve: {
              configService: ConfigResolveService,
            },
          },
          {
            path: 'batches',
            component: BatchesComponent,
            data: {
              pageId: 'home/external-trainings/id/batches',
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
  },

]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ExternalTrainingsRoutingModule { }