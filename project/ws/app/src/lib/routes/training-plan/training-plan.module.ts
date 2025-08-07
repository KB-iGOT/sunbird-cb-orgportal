import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { PipeFilterModule, PipeHtmlTagRemovalModule, PipeOrderByModule, PipeRelativeTimeModule } from '@sunbird-cb/utils'
import { MatGridListModule } from '@angular/material/grid-list'
import { MatExpansionModule } from '@angular/material/expansion'
import { MatDividerModule } from '@angular/material/divider'
import { WidgetResolverModule } from '@sunbird-cb/resolver'
import { MatLegacyAutocompleteModule as MatAutocompleteModule } from '@angular/material/legacy-autocomplete'
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button'
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox'
import { MatLegacyChipsModule as MatChipsModule } from '@angular/material/legacy-chips'
import { MatDatepickerModule } from '@angular/material/datepicker'
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog'
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field'
import { MatIconModule } from '@angular/material/icon'
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input'
import { MatLegacyListModule as MatListModule } from '@angular/material/legacy-list'
import { MatLegacyProgressBarModule as MatProgressBarModule } from '@angular/material/legacy-progress-bar'
import { MatLegacyProgressSpinnerModule as MatProgressSpinnerModule } from '@angular/material/legacy-progress-spinner'
import { MatLegacyRadioModule as MatRadioModule } from '@angular/material/legacy-radio'
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select'
import { MatSidenavModule } from '@angular/material/sidenav'
import { MatLegacyTabsModule as MatTabsModule } from '@angular/material/legacy-tabs'
import { PipePublicURLModule } from '../pipes/pipe-public-URL/pipe-public-URL.module'
import { PipeDurationTransformModule } from '../pipes/pipe-duration-transform/pipe-duration-transform.module'
import { DefaultThumbnailModule } from '../directives/default-thumbnail/default-thubnail.module'
import { FilterSearchPipeModule } from '../pipes/filter-search/filter-search.module'
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu'
import { MatLegacyPaginatorModule as MatPaginatorModule } from '@angular/material/legacy-paginator'
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card'
import { ReactiveFormsModule, FormsModule } from '@angular/forms'
import { InitResolver } from './resolvers/init-resolve.service'
import { RouterModule } from '@angular/router'
import { AvatarPhotoModule, BreadcrumbsOrgModule, LeftMenuModule, UIORGTableModule, ScrollspyLeftMenuModule } from '@sunbird-cb/collection'
// import { Ng2SearchPipeModule } from 'ng2-search-filter'
import { ExportAsModule } from 'ngx-export-as'
import { WorkallocationModule } from '../workallocation/workallocation.module'
// import { NgxPaginationModule } from 'ngx-pagination'
import { UIAdminTableModule } from '../../head/work-allocation-table/ui-admin-table.module'
import { MatLegacyTableModule as MatTableModule } from '@angular/material/legacy-table'
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip'
import { MatSortModule } from '@angular/material/sort'
import { TrainingPlanRoutingModule } from './training-plan.routing.module'
import { TrainingPlanHomeComponent } from './routes/training-plan-home/training-plan-home.component'
import { CreatePlanComponent } from './routes/create-plan/create-plan.component'
import { BreadcrumbComponent } from './components/breadcrumb/breadcrumb.component'
import { StepperComponent } from './components/stepper/stepper.component'
import { SearchComponent } from './components/search/search.component'
import { StandardCardComponent } from './components/standard-card/standard-card.component'
import { CompetencySummaryComponent } from './components/competency-summary/competency-summary.component'
import { ChipComponent } from './components/chip/chip.component'
import { CreateAssigneeComponent } from './routes/create-assignee/create-assignee.component'
import { UserCardComponent } from './components/user-card/user-card.component'
import { CreateTimelineComponent } from './routes/create-timeline/create-timeline.component'
import { AddTimelineFormComponent } from './components/add-timeline-form/add-timeline-form.component'
import { FilterComponent } from './components/filter/filter.component'
import { PreviewPlanComponent } from './routes/preview-plan/preview-plan.component'
import { CreateContentComponent } from './routes/create-content/create-content.component'
import { CategoryDropDownComponent } from './components/category-drop-down/category-drop-down.component'
import { AddPlanInformationComponent } from './components/add-plan-information/add-plan-information.component'

import { TrainingPlanService } from './services/traininig-plan.service'
import { UpdatePlanResolveService } from './resolvers/update-plan-resolve.service'
import { ResetDataSharingResolveService } from './resolvers/reset-data-sharing-resolve.service'
import { PreviewDialogBoxComponent } from './components/preview-dialog-box/preview-dialog-box.component'
import { AddContentDialogComponent } from './components/add-content-dialog/add-content-dialog.component'
import { PipeAcsendingOrderModule } from '../pipes/pipe-ascendingorder/pipe-ascendingorder.module'
import { AccessControlModule } from '@sunbird-cb/access-settings'

@NgModule({
    declarations: [
        TrainingPlanHomeComponent,
        CreatePlanComponent,
        BreadcrumbComponent,
        StepperComponent,
        SearchComponent,
        StandardCardComponent,
        CompetencySummaryComponent,
        ChipComponent,
        CreateAssigneeComponent,
        UserCardComponent,
        CreateTimelineComponent,
        AddTimelineFormComponent,
        FilterComponent,
        PreviewPlanComponent,
        CreateContentComponent,
        CategoryDropDownComponent,
        AddPlanInformationComponent,
        PreviewDialogBoxComponent,
        AddContentDialogComponent,
    ],
    imports: [
        CommonModule,
        // Ng2SearchPipeModule,
        UIORGTableModule,
        WidgetResolverModule,
        TrainingPlanRoutingModule,
        LeftMenuModule,
        FormsModule,
        RouterModule,
        MatGridListModule,
        MatExpansionModule,
        MatFormFieldModule,
        MatDividerModule,
        MatIconModule,
        MatCardModule,
        MatChipsModule,
        MatListModule,
        MatSelectModule,
        MatCheckboxModule,
        FormsModule,
        ReactiveFormsModule,
        MatInputModule,
        MatDialogModule,
        MatButtonModule,
        MatSidenavModule,
        MatMenuModule,
        MatPaginatorModule,
        MatProgressSpinnerModule,
        MatProgressBarModule,
        PipeFilterModule,
        PipeHtmlTagRemovalModule,
        PipeRelativeTimeModule,
        AvatarPhotoModule,
        PipeOrderByModule,
        BreadcrumbsOrgModule,
        WidgetResolverModule,
        ScrollspyLeftMenuModule,
        MatRadioModule,
        ExportAsModule,
        WorkallocationModule,
        // NgxPaginationModule,
        UIAdminTableModule,
        MatTabsModule,
        MatTableModule,
        MatTooltipModule,
        MatSortModule,
        MatDatepickerModule,
        PipePublicURLModule,
        PipeDurationTransformModule,
        DefaultThumbnailModule,
        FilterSearchPipeModule,
        MatAutocompleteModule,
        PipeAcsendingOrderModule,
        AccessControlModule
    ],
    providers: [
        InitResolver,
        TrainingPlanService,
        UpdatePlanResolveService,
        ResetDataSharingResolveService,
    ]
})
export class TrainingPlanModule {

}
