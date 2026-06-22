import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { CreateWorkallocationComponent } from './routes/create-workallocation/create-workallocation.component'
import { DownloadAllocationComponent } from './routes/download-allocation/download-allocation.component'
import { RouterModule } from '@angular/router'
import { WorkallocationRoutingModule } from './workallocation-routing.module'
import { BreadcrumbsOrgModule, ScrollspyLeftMenuModule, UIORGTableModule } from '@sunbird-cb/collection'
import { MatButtonModule } from '@angular/material/button'
import { MatCardModule } from '@angular/material/card'
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
import { MatTableModule } from '@angular/material/table'
import { MatExpansionModule } from '@angular/material/expansion'
import { MatDividerModule } from '@angular/material/divider'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { SbUiResolverModule } from '@sunbird-cb/resolver-v2'
import { ExportAsModule } from 'ngx-export-as'
import { UpdateWorkallocationComponent } from './routes/update-workallocation/update-workallocation.component'
import { MatMenuModule } from '@angular/material/menu'
import { AllocationActionsComponent } from './components/allocation-actions/allocation-actions.component'
import { MatTabsModule } from '@angular/material/tabs'

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
