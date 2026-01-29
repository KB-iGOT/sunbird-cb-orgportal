import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatCardModule } from '@angular/material/card'
import { MatIconModule } from '@angular/material/icon'
import { MatToolbarModule } from '@angular/material/toolbar'
import { BreadcrumbsOrgModule } from '@sunbird-cb/collection'
import { MyDashboardHomeComponent } from './components/my-dashboard-home/my-dashboard-home.component'
import { MyDashboardRoutingModule } from './my-dashboard-routing.module'
import { TrainingPlanDashboardviewComponent } from './components/training-plan-dashboardview/training-plan-dashboardview/training-plan-dashboardview.component'

@NgModule({
  declarations: [MyDashboardHomeComponent, TrainingPlanDashboardviewComponent],
  imports: [
    CommonModule,
    MyDashboardRoutingModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    BreadcrumbsOrgModule,
  ], exports: [MyDashboardHomeComponent],
})
export class MyDashboardModule { }
