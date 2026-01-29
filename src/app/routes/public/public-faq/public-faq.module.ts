import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { PublicFaqComponent } from './public-faq.component'
import { MatButtonModule } from '@angular/material/button'
import { MatCardModule } from '@angular/material/card'
import { MatDividerModule } from '@angular/material/divider'
import { MatIconModule } from '@angular/material/icon'
import { MatListModule } from '@angular/material/list'
import { MatSidenavModule } from '@angular/material/sidenav'
import { MatToolbarModule } from '@angular/material/toolbar'
import { RouterModule } from '@angular/router'
import { BreadcrumbsOrgModule } from '@sunbird-cb/collection'

@NgModule({
  declarations: [PublicFaqComponent],
  imports: [
    CommonModule,
    MatToolbarModule,
    MatSidenavModule,
    MatIconModule,
    MatCardModule,
    MatDividerModule,
    MatListModule,
    RouterModule,
    BreadcrumbsOrgModule,
    MatButtonModule,
  ],
  exports: [PublicFaqComponent],
})
export class PublicFaqModule { }
