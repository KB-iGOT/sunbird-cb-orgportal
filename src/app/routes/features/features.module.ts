import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FeaturesComponent } from './features.component'
import { MatButtonModule } from '@angular/material/button'
import { MatCardModule } from '@angular/material/card'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatIconModule } from '@angular/material/icon'
import { MatInputModule } from '@angular/material/input'
import { MatToolbarModule } from '@angular/material/toolbar'
import { MatTooltipModule } from '@angular/material/tooltip'
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
