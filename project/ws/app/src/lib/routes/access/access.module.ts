import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { AccessRoutingModule } from './access-routing.module'
import { HomeComponent } from './routes/home/home.component'
import { PrivilegesComponent } from './routes/privileges/privileges.component'
import {
  BreadcrumbsOrgModule,
  LeftMenuWithoutLogoModule,
  GroupCheckboxModule,
  UIORGTableModule,
} from '@sunbird-cb/collection'
import { SbUiResolverModule } from '@sunbird-cb/resolver-v2'
import { HomeModule } from '../home/home.module'
import { RouterModule } from '@angular/router'
import { UsersComponent } from './routes/users/users.component'
import { UsersService } from './services/users.service'
import { MatIconModule } from '@angular/material/icon'
import { MatSidenavModule } from '@angular/material/sidenav'
import { MatCardModule } from '@angular/material/card'

@NgModule({
  declarations: [HomeComponent, PrivilegesComponent, UsersComponent],
  imports: [CommonModule, AccessRoutingModule, BreadcrumbsOrgModule, LeftMenuWithoutLogoModule, SbUiResolverModule,
    MatSidenavModule, MatIconModule, GroupCheckboxModule, HomeModule, RouterModule, UIORGTableModule, MatCardModule],
  exports: [UsersComponent],
  providers: [UsersService],
})
export class AccessModule { }
