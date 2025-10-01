import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ProfileCertificateDialogComponent } from './profile-certificate-dialog.component'
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button'
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card'
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog'
import { MatIconModule } from '@angular/material/icon'
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu'
import { MatLegacySnackBarModule as MatSnackBarModule } from '@angular/material/legacy-snack-bar'
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip'
import { PipeSafeSanitizerModule } from '@sunbird-cb/utils-v2'

@NgModule({
    declarations: [ProfileCertificateDialogComponent],
    imports: [
        CommonModule,
        CommonModule,
        MatButtonModule,
        MatCardModule,
        MatIconModule,
        MatTooltipModule,
        MatDialogModule,
        MatMenuModule,
        MatSnackBarModule,
        PipeSafeSanitizerModule,
    ],
    exports: [
        ProfileCertificateDialogComponent,
    ]
})
export class ProfileCertificateDialogModule { }
