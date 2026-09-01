import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'

import {
  SlidersLibModule,
  MDOChannelModule,
} from '@sunbird-cb/consumption'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { MicrositeV1Component } from './microsite-v1/microsite-v1.component'
import { MicrositeRoutingModule } from './microsite-routing.module'
import { TranslateModule } from '@ngx-translate/core'
import { MatDialogModule } from '@angular/material/dialog'

// Removed getTranslateModule function as it's no longer needed

@NgModule({
  declarations: [MicrositeV1Component],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MicrositeRoutingModule,
    SlidersLibModule,
    MDOChannelModule,
    TranslateModule.forChild(),
    MatDialogModule
  ],
  providers: [
  ],

  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class MicrositeModule { }
