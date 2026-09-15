import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { MatPaginatorModule } from '@angular/material/paginator'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatSnackBarModule } from '@angular/material/snack-bar'
import { MatSortModule } from '@angular/material/sort'
import { MatTableModule } from '@angular/material/table'
import { MatDialogModule } from '@angular/material/dialog'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { MatRadioModule } from '@angular/material/radio'
import { MatSelectModule } from '@angular/material/select'
import { MatTooltipModule } from '@angular/material/tooltip'
import { FormsModule } from '@angular/forms'
import { AccessControlModule } from '@sunbird-cb/access-settings'
import { ComponentSharedModule } from '../workallocation-v2/components/component-shared.module'
import { AparYearSelectModule } from '../../common/apar-year-select/apar-year-select.module'

import { ReusableUserGroupsRoutingModule } from './reusable-user-groups-routing.module'
import { ReusableUserGroupsComponent } from './routes/reusable-user-groups/reusable-user-groups.component'
import { UserGroupsListComponent } from './routes/user-groups-list/user-groups-list.component'
import { CreateUserGroupsComponent } from './routes/create-user-groups/create-user-groups.component'
import { UseInPlanDialogComponent } from './components/use-in-plan-dialog/use-in-plan-dialog.component'

@NgModule({
  declarations: [
    ReusableUserGroupsComponent,
    UserGroupsListComponent,
    CreateUserGroupsComponent,
    UseInPlanDialogComponent,
  ],
  imports: [
    CommonModule,
    ReusableUserGroupsRoutingModule,
    MatButtonModule,
    MatIconModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatSortModule,
    MatTableModule,
    AccessControlModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatRadioModule,
    MatSelectModule,
    MatTooltipModule,
    FormsModule,
    ComponentSharedModule,
    AparYearSelectModule,
  ],
})
export class ReusableUserGroupsModule { }
