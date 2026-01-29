import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { MatButtonModule } from '@angular/material/button'
import { MatCardModule } from '@angular/material/card'
import { MatCheckboxModule } from '@angular/material/checkbox'
import { MatChipsModule } from '@angular/material/chips'
import { MatDialogModule } from '@angular/material/dialog'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatIconModule } from '@angular/material/icon'
import { MatInputModule } from '@angular/material/input'
import { MatSelectModule } from '@angular/material/select'
import { MatSnackBarModule } from '@angular/material/snack-bar'
import { MatListModule } from '@angular/material/list'
import { MatSidenavModule } from '@angular/material/sidenav'
import { RouterModule } from '@angular/router'
import { StateProfileRoutingModule } from './state-profile-routing.module'
import { SetupLeftMenuComponent } from './components/left-menu/left-menu.component'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { TopicService } from './services/topics.service'
// import { PlayerVideoComponent } from '@sunbird-cb/collection/src/lib/player-video/player-video.component'
import { PlatformWalkthroughComponent } from './routes/platform-walkthrough/platform-walkthrough.component'
import { RolesAndActivityService } from './services/rolesandActivities.service'
import { LevelCardComponent } from './components/level-card/level-card.component'
import { LevelInfoComponent } from './components/level-info/level-info.component'
import { CompTooltipDirective } from './directives/tooltip.directive'
import { WelcomeOnboardComponent } from './routes/welcome-onboard/welcome-onboard.component'
import { DialogBoxComponent } from './components/dialog-box/dialog-box.component'
import { CompLocalService } from './services/comp.service'
import { StateProfileHomeComponent } from './routes/state-profile-home/state-profile-home.component'
import { ConsultancyComponent } from './routes/consultancy/consultancy.component'
import { FacultyComponent } from './routes/faculty/faculty.component'
import { InfrastructureComponent } from './routes/infrastructure/infrastructure.component'
import { InstituteProfileComponent } from './routes/institute-profile/institute-profile.component'
import { ResearchComponent } from './routes/research/research.component'
import { RolesAndFunctionsComponent } from './routes/roles-and-functions/roles-and-functions.component'
import { TrainingRogramsComponent } from './routes/training-rograms/training-rograms.component'
import { MatRadioModule } from '@angular/material/radio'
import { OrgProfileService } from './services/org-profile.service'

@NgModule({
    declarations: [
        StateProfileHomeComponent,
        SetupLeftMenuComponent,
        PlatformWalkthroughComponent,
        LevelCardComponent,
        LevelInfoComponent,
        CompTooltipDirective,
        WelcomeOnboardComponent,
        DialogBoxComponent,
        ConsultancyComponent,
        FacultyComponent,
        InfrastructureComponent,
        InstituteProfileComponent,
        ResearchComponent,
        RolesAndFunctionsComponent,
        TrainingRogramsComponent,
    ],
    imports: [
        CommonModule,
        MatCardModule,
        MatListModule,
        MatSidenavModule,
        MatIconModule,
        RouterModule,
        MatButtonModule,
        StateProfileRoutingModule,
        FormsModule,
        MatCheckboxModule,
        MatInputModule,
        // TreeCatalogModule,
        MatSnackBarModule,
        MatDialogModule,
        MatFormFieldModule,
        ReactiveFormsModule,
        MatChipsModule,
        MatSelectModule,
        MatRadioModule,
    ],
    providers: [
        TopicService,
        RolesAndActivityService,
        CompLocalService,
        OrgProfileService,
    ]
})
export class StateProfileModule { }
