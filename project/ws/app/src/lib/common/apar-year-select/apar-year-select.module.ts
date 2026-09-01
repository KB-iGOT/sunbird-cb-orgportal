import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatSelectModule } from '@angular/material/select'

import { AparYearSelectComponent } from './apar-year-select.component'

@NgModule({
  declarations: [AparYearSelectComponent],
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatSelectModule,
  ],
  exports: [AparYearSelectComponent],
})
export class AparYearSelectModule { }
