import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'

import { MatTableModule } from '@angular/material/table'
import { MatPaginatorModule } from '@angular/material/paginator'
import { MatCardModule } from '@angular/material/card'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { MatMenuModule } from '@angular/material/menu'


import { AICBPRequestRoutingModule } from './ai-cbp-request.routing.module'
import { AiCbpModule } from '@sunbird-cb/cbp-ai'
import { RouterModule } from '@angular/router'
import { AICBPRequestListComponent } from './components/ai-cbp-request-list/ai-cbp-request-list.component'
import { AICBPRequestComponent } from './ai-cbp-request.component'
import { ViewNonMappingDesignationComponent } from './components/view-non-mapping-designation/view-non-mapping-designation.component'
import { FormsModule } from '@angular/forms'

import { MatFormFieldModule } from '@angular/material/form-field'
import { MatSelectModule } from '@angular/material/select'
import { MatInputModule } from '@angular/material/input'


@NgModule({
  declarations: [AICBPRequestComponent, AICBPRequestListComponent, ViewNonMappingDesignationComponent],
  imports: [CommonModule, AICBPRequestRoutingModule, RouterModule, AiCbpModule, MatTableModule,
    MatPaginatorModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    FormsModule, FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule
  ],
  exports: [AiCbpModule]
})
export class AICBPRequestModule { }
