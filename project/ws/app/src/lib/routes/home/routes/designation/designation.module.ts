import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule, Routes } from '@angular/router'
import { DesignationsComponent } from './components/designations/designations.component'
import { ImportDesignationComponent } from './components/import-designation/import-designation.component'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { MatCardModule } from '@angular/material/card'
import { MatCheckboxModule } from '@angular/material/checkbox'
import { MatDialogModule } from '@angular/material/dialog'
import { MatIconModule } from '@angular/material/icon'
import { MatInputModule } from '@angular/material/input'
import { MatPaginatorModule } from '@angular/material/paginator'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatSelectModule } from '@angular/material/select'
import { MatTableModule } from '@angular/material/table'
import { UIORGTableModule } from '@sunbird-cb/collection'
import { SelectedDesignationPopupComponent } from './dialog-boxes/selected-designation-popup/selected-designation-popup.component'
import { ConformationPopupComponent } from './dialog-boxes/conformation-popup/conformation-popup.component'
import { PageResolve, PipeOrderByModule } from '@sunbird-cb/utils-v2'
import { ConfigResolveService } from '../../resolvers/config-resolve.service'
import { BulkUploadComponent } from './components/bulk-upload/bulk-upload.component'
import { MatTooltipModule } from '@angular/material/tooltip'
const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: DesignationsComponent,
    data: {
      pageId: 'home/odcs-mapping',
      module: 'odcs-mapping',
      pageType: 'feature',
      pageKey: 'my_designations',
    },
    resolve: {
      configService: ConfigResolveService,
      pageData: PageResolve,
    },
  },
  {
    path: 'import-designation',
    pathMatch: 'full',
    data: {
      pageId: 'home/odcs-mapping',
      module: 'odcs-mapping',
      pageType: 'feature',
      pageKey: 'my_designations',
    },
    component: ImportDesignationComponent,
    resolve: {
      configService: ConfigResolveService,
      pageData: PageResolve,
    },
  },
  {
    path: 'bulk-upload',
    pathMatch: 'full',
    data: {
      pageId: 'home/odcs-mapping',
      module: 'odcs-mapping',
      pageType: 'feature',
      pageKey: 'my_designations',
    },
    component: BulkUploadComponent,
    resolve: {
      configService: ConfigResolveService,
      pageData: PageResolve,
    },
  },
]

@NgModule({
  declarations: [
    DesignationsComponent,
    ImportDesignationComponent,
    SelectedDesignationPopupComponent,
    ConformationPopupComponent,
    BulkUploadComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FormsModule,
    MatIconModule,
    MatCardModule,
    MatCheckboxModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatTableModule,
    UIORGTableModule,
    MatPaginatorModule,
    MatDialogModule,
    PipeOrderByModule,
    MatTooltipModule,
  ],
  exports: [
    RouterModule,
    SelectedDesignationPopupComponent
  ],
})
export class DesignationModule { }
