import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { MatTableModule } from '@angular/material/table'
import { MatIconModule } from '@angular/material/icon'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatButtonModule } from '@angular/material/button'
import { MatMenuModule } from '@angular/material/menu'
import { MatInputModule } from '@angular/material/input'
import { MatRadioModule } from '@angular/material/radio'
import { MatSelectModule } from '@angular/material/select'
import { MatCheckboxModule } from '@angular/material/checkbox'
import { MatCardModule } from '@angular/material/card'
import { MatTabsModule } from '@angular/material/tabs'
import { MatTooltipModule } from '@angular/material/tooltip'
import { MatSnackBarModule } from '@angular/material/snack-bar'
import { MatPaginatorModule } from '@angular/material/paginator'
import { MatSortModule } from '@angular/material/sort'
import { BaseComponent } from './base/base.component'
import { MatSlideToggleModule } from '@angular/material/slide-toggle'
import { UIORGTableModule } from '@sunbird-cb/collection'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatExpansionModule } from '@angular/material/expansion'
import { MatDialogModule } from '@angular/material/dialog'
import { ApprovalsListComponent } from './approvals-list/approvals-list.component'
import { AchievementApprovalsRoutingModule } from './achievement-approvals-routing.module'
import { RejectReasonDialogComponent } from './reject-reason-dialog/reject-reason-dialog.component'
import { ViewAchievementComponent } from './view-achievement/view-achievement.component'
import { AchievementsService } from '../../services/achievements.service'
@NgModule({
  declarations: [
    BaseComponent,
    ApprovalsListComponent,
    RejectReasonDialogComponent,
    ViewAchievementComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AchievementApprovalsRoutingModule,
    MatCardModule,
    MatTableModule,
    MatIconModule,
    MatFormFieldModule,
    MatButtonModule,
    MatMenuModule,
    MatInputModule,
    MatRadioModule,
    MatSelectModule,
    MatCheckboxModule,
    MatTabsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatTooltipModule,
    MatMenuModule,
    MatInputModule,
    MatRadioModule,
    MatSelectModule,
    MatCheckboxModule,
    MatCardModule,
    MatSnackBarModule,
    MatTableModule,
    MatIconModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatTabsModule,
    MatSortModule,
    MatSlideToggleModule,
    UIORGTableModule,
    MatProgressSpinnerModule,
    MatExpansionModule,
  ],
  providers: [
    AchievementsService
  ]
})
export class AchievementApprovalsModule { }
