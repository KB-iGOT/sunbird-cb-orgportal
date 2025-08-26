import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule } from '@angular/router'
import { LeftMenuComponent } from './left-menu.component'
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button'
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card'
import { MatLegacyChipsModule as MatChipsModule } from '@angular/material/legacy-chips'
import { MatExpansionModule } from '@angular/material/expansion'
import { MatIconModule } from '@angular/material/icon'
import { MatLegacyListModule as MatListModule } from '@angular/material/legacy-list'
import { MatLegacyProgressSpinnerModule as MatProgressSpinnerModule } from '@angular/material/legacy-progress-spinner'
import { MatSidenavModule } from '@angular/material/sidenav'
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip'
import { UploadLogoDialogComponent } from './upload-logo-dialog/upload-logo-dialog/upload-logo-dialog.component'
import { MatDialogModule } from '@angular/material/dialog'
import { ImageCropperModule } from 'ngx-image-cropper'

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
    ],
    exports: [
        LeftMenuComponent,
    ]
})
export class LeftMenuModule { }
