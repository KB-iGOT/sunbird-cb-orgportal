import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ClassDiagramComponent } from './class-diagram.component'
import { ClassDiagramRoutingModule } from './class-diagram-routing.module'
import { ClassDiagramModule as ClassDiagramPluginModule } from '../../plugins/class-diagram/class-diagram.module'
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card'
@NgModule({
  declarations: [ClassDiagramComponent],
  imports: [
    CommonModule,
    MatCardModule,
    ClassDiagramPluginModule,
    ClassDiagramRoutingModule,
  ],
  exports: [ClassDiagramComponent],
})
export class ClassDiagramModule { }
