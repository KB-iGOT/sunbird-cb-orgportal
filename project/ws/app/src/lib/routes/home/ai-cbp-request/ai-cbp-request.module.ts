import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'

import { MatTableModule } from '@angular/material/table'
import { MatPaginatorModule } from '@angular/material/paginator'
import { MatCardModule } from '@angular/material/card'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { MatMenuModule } from '@angular/material/menu'


import { AICBPRequestRoutingModule } from './ai-cbp-request.routing.module'
import { AcbpAiLibModule } from 'sb-cb-ui-acbp-ai'
import { RouterModule } from '@angular/router'
import { AICBPRequestListComponent } from './components/ai-cbp-request-list/ai-cbp-request-list.component'
import { AICBPRequestComponent } from './ai-cbp-request.component'


@NgModule({
  declarations: [AICBPRequestComponent, AICBPRequestListComponent],
  imports: [CommonModule, AICBPRequestRoutingModule, RouterModule, AcbpAiLibModule, MatTableModule,
    MatPaginatorModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule],
  exports: [AcbpAiLibModule]
})
export class AICBPRequestModule { }
