import { NgModule } from '@angular/core'
import { CommonModule, DatePipe } from '@angular/common'
import { CreateUserComponent } from './routes/create-user/create-user.component'
import { ViewUserComponent } from './routes/view-user/view-user.component'
import { RouterModule } from '@angular/router'
import { UsersRoutingModule } from './users.routing.module'
import { BreadcrumbsOrgModule, ScrollspyLeftMenuModule, UIORGTableModule } from '@sunbird-cb/collection'
import { MatButtonModule } from '@angular/material/button'
import { MatCardModule } from '@angular/material/card'
import { MatChipsModule } from '@angular/material/chips'
import { MatDialogModule } from '@angular/material/dialog'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatGridListModule } from '@angular/material/grid-list'
import { MatIconModule } from '@angular/material/icon'
import { MatInputModule } from '@angular/material/input'
import { MatListModule } from '@angular/material/list'
import { MatPaginatorModule } from '@angular/material/paginator'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatRadioModule } from '@angular/material/radio'
import { MatSelectModule } from '@angular/material/select'
import { MatSidenavModule } from '@angular/material/sidenav'
import { MatSortModule } from '@angular/material/sort'
import { MatTableModule } from '@angular/material/table'
import { MatExpansionModule } from '@angular/material/expansion'
import { MatDividerModule } from '@angular/material/divider'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { SbUiResolverModule } from '@sunbird-cb/resolver-v2'
import { RolesService } from './services/roles.service'
import { FileService } from './services/upload.service'
import { UsersUploadComponent } from './components/users-upload/users-upload.component'
import { PipeEmailModule } from '../pipes/pipe-email/pipe-email.module'
import { PipeDurationTransformModule } from '@sunbird-cb/utils-v2'
import { OtpService } from './services/otp.service'

@NgModule({
  declarations: [CreateUserComponent, ViewUserComponent, UsersUploadComponent],
  imports: [
    CommonModule, RouterModule, UsersRoutingModule, BreadcrumbsOrgModule,
    MatSidenavModule, MatListModule, ScrollspyLeftMenuModule, MatCardModule, FormsModule,
    MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatGridListModule,
    MatRadioModule, MatDialogModule, ReactiveFormsModule, MatSelectModule, MatProgressSpinnerModule,
    MatExpansionModule, MatDividerModule, MatPaginatorModule, MatTableModule, SbUiResolverModule, MatSortModule, PipeEmailModule,
    UIORGTableModule, MatChipsModule, PipeDurationTransformModule,
  ],
  providers: [RolesService, FileService, DatePipe, OtpService],
  exports: [UsersUploadComponent],
})
export class UsersModule { }
