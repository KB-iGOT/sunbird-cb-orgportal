import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FeaturesComponent } from './features.component'
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button'
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card'
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field'
import { MatIconModule } from '@angular/material/icon'
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input'
import { MatToolbarModule } from '@angular/material/toolbar'
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip'
import { ReactiveFormsModule, FormsModule } from '@angular/forms'
import { RouterModule } from '@angular/router'
import { BtnFeatureModule, BreadcrumbsOrgModule } from '@sunbird-cb/collection'
import { SbUiResolverModule } from '@sunbird-cb/resolver-v2'
import { LogoutModule } from '@sunbird-cb/utils-v2'
// import { AccessControlService } from '../../../../project/ws/author/src/public-api'

@NgModule({
  declarations: [FeaturesComponent],
  imports: [
    CommonModule,
    FormsModule,
    BtnFeatureModule,
    BreadcrumbsOrgModule,
    LogoutModule,
    SbUiResolverModule,
    ReactiveFormsModule,
    RouterModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatButtonModule,
    MatToolbarModule,
    MatTooltipModule,
    MatCardModule,
  ],
  exports: [FeaturesComponent],
  providers: [
    // AccessControlService
  ],
})
export class FeaturesModule { }
