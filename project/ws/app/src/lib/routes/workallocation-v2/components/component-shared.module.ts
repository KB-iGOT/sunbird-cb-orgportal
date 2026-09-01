import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { MatAutocompleteModule } from '@angular/material/autocomplete'
import { MatButtonModule } from '@angular/material/button'
import { MatCardModule } from '@angular/material/card'
import { MatDialogModule } from '@angular/material/dialog'
import { MatDividerModule } from '@angular/material/divider'
import { MatExpansionModule } from '@angular/material/expansion'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatGridListModule } from '@angular/material/grid-list'
import { MatIconModule } from '@angular/material/icon'
import { MatInputModule } from '@angular/material/input'
import { MatListModule } from '@angular/material/list'
import { MatMenuModule } from '@angular/material/menu'
import { MatPaginatorModule } from '@angular/material/paginator'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatRadioModule } from '@angular/material/radio'
import { MatSelectModule } from '@angular/material/select'
import { MatSidenavModule } from '@angular/material/sidenav'
import { MatTableModule } from '@angular/material/table'
import { MatTabsModule } from '@angular/material/tabs'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { UserAutocompleteCardComponent } from './user-autocomplete-card/user-autocomplete-card.component'
import { ExportAsModule } from 'ngx-export-as'
import { AutocompleteModule } from './autocomplete/autocomplete.module'
import { InitialAvatarComponent } from './initial-avatar/initial-avatar.component'
import { PublishPopupComponent } from './publish-popup/publish-popup.component'
// import { PdfViewerModule } from 'ng2-pdf-viewer'
import { PlayerDialogComponent } from './player-dialog/player-dialog.component'
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component'

@NgModule({
    declarations: [
        UserAutocompleteCardComponent,
        InitialAvatarComponent,
        PublishPopupComponent,
        PlayerDialogComponent,
        ConfirmDialogComponent,
    ],
    // PdfViewerModule
    imports: [
        CommonModule,
        MatCardModule, FormsModule, ReactiveFormsModule, MatSidenavModule, MatListModule,
        MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatGridListModule,
        MatRadioModule, MatDialogModule, MatSelectModule, MatProgressSpinnerModule,
        MatExpansionModule, MatDividerModule, MatPaginatorModule, MatTableModule,
        ExportAsModule, MatMenuModule, MatTabsModule, MatProgressSpinnerModule, MatAutocompleteModule,
        AutocompleteModule,
    ],
    exports: [
        UserAutocompleteCardComponent,
        InitialAvatarComponent,
        PublishPopupComponent,
        PlayerDialogComponent,
        ConfirmDialogComponent,
    ]
})
export class ComponentSharedModule { }
