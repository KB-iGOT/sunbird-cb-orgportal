import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ClassDiagramComponent } from './class-diagram.component'
import { ClassDiagramRoutingModule } from './class-diagram-routing.module'
import { ClassDiagramModule as ClassDiagramPluginModule } from '../../plugins/class-diagram/class-diagram.module'
import { MatCardModule } from '@angular/material/card'
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
