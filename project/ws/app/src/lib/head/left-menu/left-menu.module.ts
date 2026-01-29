import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule } from '@angular/router'
import { LeftMenuComponent } from './left-menu.component'
import { MatButtonModule } from '@angular/material/button'
import { MatCardModule } from '@angular/material/card'
import { MatChipsModule } from '@angular/material/chips'
import { MatExpansionModule } from '@angular/material/expansion'
import { MatIconModule } from '@angular/material/icon'
import { MatListModule } from '@angular/material/list'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatSidenavModule } from '@angular/material/sidenav'
import { MatTooltipModule } from '@angular/material/tooltip'
import { UploadLogoDialogComponent } from './upload-logo-dialog/upload-logo-dialog/upload-logo-dialog.component'
import { MatDialogModule } from '@angular/material/dialog'
import { ImageCropperModule } from 'ngx-image-cropper'
import { MatSliderModule } from '@angular/material/slider'

@NgModule({
    declarations: [LeftMenuComponent, UploadLogoDialogComponent],
    imports: [
        CommonModule,
        RouterModule,
        MatButtonModule,
        MatIconModule,
        MatTooltipModule,
        MatProgressSpinnerModule,
        MatSidenavModule,
        MatChipsModule,
        MatCardModule,
        MatListModule,
        MatExpansionModule,
        MatDialogModule,
        ImageCropperModule,
        MatSliderModule,
    ],
    exports: [
        LeftMenuComponent,
    ]
})
export class LeftMenuModule { }
