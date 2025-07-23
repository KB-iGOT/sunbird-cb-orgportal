import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { CreateWorkallocationComponent } from './routes/create-workallocation/create-workallocation.component'
import { DownloadAllocationComponent } from './routes/download-allocation/download-allocation.component'
import { RouterModule } from '@angular/router'
import { WorkallocationRoutingModule } from './workallocation-routing.module'
import { BreadcrumbsOrgModule, ScrollspyLeftMenuModule, UIORGTableModule } from '@sunbird-cb/collection'
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button'
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card'
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog'
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field'
import { MatGridListModule } from '@angular/material/grid-list'
import { MatIconModule } from '@angular/material/icon'
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input'
import { MatLegacyListModule as MatListModule } from '@angular/material/legacy-list'
import { MatLegacyPaginatorModule as MatPaginatorModule } from '@angular/material/legacy-paginator'
import { MatLegacyProgressSpinnerModule as MatProgressSpinnerModule } from '@angular/material/legacy-progress-spinner'
import { MatLegacyRadioModule as MatRadioModule } from '@angular/material/legacy-radio'
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select'
import { MatSidenavModule } from '@angular/material/sidenav'
import { MatLegacyTableModule as MatTableModule } from '@angular/material/legacy-table'
import { MatExpansionModule } from '@angular/material/expansion'
import { MatDividerModule } from '@angular/material/divider'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { SbUiResolverModule } from '@sunbird-cb/resolver-v2'
import { ExportAsModule } from 'ngx-export-as'
import { UpdateWorkallocationComponent } from './routes/update-workallocation/update-workallocation.component'
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu'
import { AllocationActionsComponent } from './components/allocation-actions/allocation-actions.component'
import { MatLegacyTabsModule as MatTabsModule } from '@angular/material/legacy-tabs'

@NgModule({
    declarations: [CreateWorkallocationComponent, DownloadAllocationComponent, UpdateWorkallocationComponent, AllocationActionsComponent],
    imports: [
        CommonModule, RouterModule, WorkallocationRoutingModule, BreadcrumbsOrgModule,
        MatSidenavModule, MatListModule, ScrollspyLeftMenuModule, MatCardModule, FormsModule,
        MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatGridListModule,
        MatRadioModule, MatDialogModule, ReactiveFormsModule, MatSelectModule, MatProgressSpinnerModule,
        MatExpansionModule, MatDividerModule, MatPaginatorModule, MatTableModule, SbUiResolverModule,
        UIORGTableModule, ExportAsModule, MatMenuModule, MatTabsModule,
    ],
    exports: [DownloadAllocationComponent]
})
export class WorkallocationModule { }
