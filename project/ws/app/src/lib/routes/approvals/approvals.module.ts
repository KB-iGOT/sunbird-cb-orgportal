import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { HomeComponent } from './routes/home/home.component'

import { RouterModule } from '@angular/router'
import { ApprovalsRoutingModule } from './approvals.routing.module'
import { BreadcrumbsOrgModule, ScrollspyLeftMenuModule } from '@sunbird-cb/collection'
import { MatButtonModule } from '@angular/material/button'
import { MatCardModule } from '@angular/material/card'
import { MatChipsModule } from '@angular/material/chips'
import { MatDialogModule } from '@angular/material/dialog'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatGridListModule } from '@angular/material/grid-list'
import { MatIconModule } from '@angular/material/icon'
import { MatInputModule } from '@angular/material/input'
import { MatListModule } from '@angular/material/list'
import { MatRadioModule } from '@angular/material/radio'
import { MatSidenavModule } from '@angular/material/sidenav'
import { NeedsApprovalComponent } from './routes/needs-approval/needs-approval.component'
import { BasicInfoComponent } from './routes/basic-info/basic-info.component'
import { PositionComponent } from './routes/position/position.component'
import { EducationComponent } from './routes/education/education.component'
import { FormsModule } from '@angular/forms'
import { CertificationAndSkillsComponent } from './routes/certification-and-skills/certification-and-skills.component'
@NgModule({
  declarations: [HomeComponent, NeedsApprovalComponent, BasicInfoComponent, PositionComponent,
    EducationComponent, CertificationAndSkillsComponent],
  imports: [
    CommonModule, RouterModule, ApprovalsRoutingModule, BreadcrumbsOrgModule,
    MatSidenavModule, MatListModule, ScrollspyLeftMenuModule, MatCardModule, FormsModule,
    MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatGridListModule,
    MatRadioModule, MatDialogModule, MatChipsModule,
  ],
})
export class ApprovalsModule { }
