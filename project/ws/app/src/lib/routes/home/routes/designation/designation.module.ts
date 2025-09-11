import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule, Routes } from '@angular/router'
import { DesignationsComponent } from './components/designations/designations.component'
import { ImportDesignationComponent } from './components/import-designation/import-designation.component'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button'
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card'
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox'
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog'
import { MatIconModule } from '@angular/material/icon'
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input'
import { MatLegacyPaginatorModule as MatPaginatorModule } from '@angular/material/legacy-paginator'
import { MatLegacyProgressSpinnerModule as MatProgressSpinnerModule } from '@angular/material/legacy-progress-spinner'
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select'
import { MatLegacyTableModule as MatTableModule } from '@angular/material/legacy-table'
import { UIORGTableModule } from '@sunbird-cb/collection'
import { SelectedDesignationPopupComponent } from './dialog-boxes/selected-designation-popup/selected-designation-popup.component'
import { ConformationPopupComponent } from './dialog-boxes/conformation-popup/conformation-popup.component'
import { PageResolve, PipeOrderByModule } from '@sunbird-cb/utils-v2'
import { ConfigResolveService } from '../../resolvers/config-resolve.service'
import { BulkUploadComponent } from './components/bulk-upload/bulk-upload.component'
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip'
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
  ],
})
export class DesignationModule { }
