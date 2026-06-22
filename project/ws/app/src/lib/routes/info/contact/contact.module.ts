import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ContactHomeComponent } from './components/contact-home.component'
import { MatButtonModule } from '@angular/material/button'
import { MatCardModule } from '@angular/material/card'
import { MatToolbarModule } from '@angular/material/toolbar'
import { BreadcrumbsOrgModule } from '@sunbird-cb/collection'

@NgModule({
  declarations: [ContactHomeComponent],
  imports: [CommonModule, MatToolbarModule, MatCardModule, BreadcrumbsOrgModule, MatButtonModule],
  exports: [ContactHomeComponent],
})
export class ContactModule { }
