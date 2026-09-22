
import { CommonModule } from '@angular/common'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog'
import { MatIconModule } from '@angular/material/icon'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { TrainingPlanDataSharingService } from '../../services/training-plan-data-share.service'
import { ConfirmationBoxComponent } from './confirmation.box.component'

describe('ConfirmationBoxComponent', () => {
    let component: ConfirmationBoxComponent

    const data: any = {}
    const dialogRef: Partial<MatDialogRef<ConfirmationBoxComponent>> = {}
    const tpdsSvc: Partial<TrainingPlanDataSharingService> = {}

    beforeAll(() => {
        component = new ConfirmationBoxComponent(
            data as undefined,
            dialogRef as MatDialogRef<ConfirmationBoxComponent>,
            tpdsSvc as TrainingPlanDataSharingService
        )
    })

    beforeEach(() => {
        jest.clearAllMocks()
        jest.resetAllMocks()
    })

    it('should create a instance of component', () => {
        expect(component).toBeTruthy()
    })

    // A warning is answered the same way a confirmation is, so the caller can tell an
    // acknowledged box from a dismissed one
    it('should close a warning as confirmed', () => {
        const close = jest.fn()
        const warningBox = new ConfirmationBoxComponent(
            {} as any,
            { close } as unknown as MatDialogRef<ConfirmationBoxComponent>,
            {} as TrainingPlanDataSharingService
        )

        warningBox.performAction({ type: 'warning' })

        expect(close).toHaveBeenCalledWith('confirmed')
    })
})

describe('ConfirmationBoxComponent warning box', () => {
    let fixture: ComponentFixture<ConfirmationBoxComponent>

    // Rebuilt for every test, the ones below drop fields from it to reach the smaller layouts
    let data: any

    beforeEach(async () => {
        data = {
            type: 'warning',
            icon: 'warning_amber',
            title: 'No mandatory course selected',
            subTitle: 'The comprehensive assessment unlocks as soon as the plan reaches a Karmayogi.',
            subTitle2: 'Mark the relevant contents as mandatory, or continue without setting.',
            primaryAction: 'Continue anyway',
            secondaryAction: 'Go back',
        }

        await TestBed.resetTestingModule().configureTestingModule({
            declarations: [ConfirmationBoxComponent],
            imports: [CommonModule, MatDialogModule, MatIconModule, MatProgressSpinnerModule],
            providers: [
                { provide: MAT_DIALOG_DATA, useValue: data },
                { provide: MatDialogRef, useValue: { close: jest.fn() } },
                { provide: TrainingPlanDataSharingService, useValue: {} },
            ],
        }).compileComponents()

        fixture = TestBed.createComponent(ConfirmationBoxComponent)
        fixture.detectChanges()
    })

    it('should render the warning with both actions', () => {
        const el: HTMLElement = fixture.nativeElement
        expect(el.querySelector('.warning-container')).toBeTruthy()
        expect(el.querySelector('.warning-icon')?.textContent).toContain('warning_amber')
        expect(el.querySelector('.warning-title')?.textContent).toContain('No mandatory course selected')
        expect(el.querySelectorAll('.warning-btn').length).toBe(2)
    })

    // The no-gating warning says what is at stake, then what to do about it
    it('should render both paragraphs of the body', () => {
        const paragraphs = (fixture.nativeElement as HTMLElement).querySelectorAll('.warning-subtitle')

        expect(paragraphs.length).toBe(2)
        expect(paragraphs[0].textContent).toContain('comprehensive assessment unlocks')
        expect(paragraphs[1].textContent).toContain('continue without setting')
    })

    it('should render one paragraph when there is no second one', () => {
        data.subTitle2 = undefined
        fixture.detectChanges()

        expect((fixture.nativeElement as HTMLElement).querySelectorAll('.warning-subtitle').length).toBe(1)
    })

    // The 25 gating courses warning only informs, it has nothing to decide
    it('should render a single action when there is no secondary action', () => {
        data.secondaryAction = undefined
        fixture.detectChanges()

        expect((fixture.nativeElement as HTMLElement).querySelectorAll('.warning-btn').length).toBe(1)
    })
})
