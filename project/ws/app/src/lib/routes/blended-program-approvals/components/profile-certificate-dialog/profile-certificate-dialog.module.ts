import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ProfileCertificateDialogComponent } from './profile-certificate-dialog.component'
import { MatButtonModule } from '@angular/material/button'
import { MatCardModule } from '@angular/material/card'
import { MatDialogModule } from '@angular/material/dialog'
import { MatIconModule } from '@angular/material/icon'
import { MatMenuModule } from '@angular/material/menu'
import { MatSnackBarModule } from '@angular/material/snack-bar'
import { MatTooltipModule } from '@angular/material/tooltip'
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
