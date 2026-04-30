import { InstituteProfileComponent } from './institute-profile.component'
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog'
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar'
import { Router } from '@angular/router'
import { ActivatedRoute } from '@angular/router'
import { ConfigurationsService } from '@sunbird-cb/utils-v2'
import { OrgProfileService } from '../../services/org-profile.service'
import { of } from 'rxjs'
import { DialogConfirmComponent } from '../../../../../../../../../src/app/component/dialog-confirm/dialog-confirm.component'
import { DialogBoxComponent } from '../../components/dialog-box/dialog-box.component'

describe('InstituteProfileComponent', () => {
    let component: InstituteProfileComponent
    let snackBarMock: jest.Mocked<MatSnackBar>
    let dialogMock: jest.Mocked<MatDialog>
    let routerMock: jest.Mocked<Router>
    let routeMock: jest.Mocked<ActivatedRoute>
    let configSvcMock: jest.Mocked<ConfigurationsService>
    let orgSvcMock: jest.Mocked<OrgProfileService>

    beforeEach(() => {
        snackBarMock = {
            open: jest.fn(),
        } as any

        dialogMock = {
            open: jest.fn().mockReturnValue({
                afterClosed: jest.fn().mockReturnValue(of(true)),
            }),
        } as any

        routerMock = {
            navigate: jest.fn(),
        } as any

        routeMock = {
            data: of({
                pageData: {
                    data: {
                        countryCode: ['+91'],
                        states: ['State1'],
                        stdCode: ['123'],
                    },
                },
            }),
        } as any

        configSvcMock = {
            unMappedUser: {
                orgProfile: { profileDetails: { instituteProfile: {} } },
                profileDetails: { instituteProfile: {} },
            },
            userProfile: {},
        } as any

        orgSvcMock = {
            updateLocalFormValue: jest.fn(),
            updateFormStatus: jest.fn(),
        } as any

        component = new InstituteProfileComponent(
            configSvcMock,
            orgSvcMock,
            snackBarMock,
            routerMock,
            dialogMock,
            routeMock
        )
    })

    it('should create the InstituteProfileComponent', () => {
        expect(component).toBeTruthy()
    })

    describe('ngOnInit', () => {
        it('should populate countryCodes, stateNames and stdCodes from route data', () => {
            component.ngOnInit()
            expect(component.countryCodes).toEqual(['+91'])
            expect(component.stateNames).toEqual(['State1'])
            expect(component.stdCodes).toEqual(['123'])
        })

        it('should patch stdCode and countryCode when lists are non-empty', () => {
            component.ngOnInit()
            expect(component.instituteProfileForm.get('stdCode')?.value).toBe('123')
            expect(component.instituteProfileForm.get('countryCode')?.value).toBe('+91')
        })

        it('should not patch form when route data has no pageData', () => {
            routeMock = { data: of({}) } as any
            component = new InstituteProfileComponent(
                configSvcMock, orgSvcMock, snackBarMock, routerMock, dialogMock, routeMock
            )
            component.ngOnInit()
            // No error expected — form stays with defaults
            expect(component.countryCodes).toEqual([])
        })
    })

    describe('buttonSelect', () => {
        it('should toggle isButtonActive', () => {
            component.isButtonActive = false
            component.buttonSelect({})
            expect(component.isButtonActive).toBe(true)
            component.buttonSelect({})
            expect(component.isButtonActive).toBe(false)
        })
    })

    describe('addOrg', () => {
        it('should add new org to addedOrgs list', () => {
            component.attachedOrgForm.patchValue({
                trainingInstitute: 'Training Institute 1',
                attachedTrainingInstitute: 'True',
            })
            component.addOrg()
            expect(orgSvcMock.updateLocalFormValue).toHaveBeenCalled()
            expect(component.addedOrgs.length).toBe(1)
        })

        it('should show snackbar when trainingInstitute is empty', () => {
            component.attachedOrgForm.patchValue({ trainingInstitute: '' })
            component.addOrg()
            expect(snackBarMock.open).toHaveBeenCalledWith(
                'Attached training institute or center name is required'
            )
        })

        it('should edit existing org when editOrgValue is set and userProfile exists', () => {
            const org = { name: 'OldOrg', isAttachedInstitute: true, trainingInstituteDetail: '' }
            component.addedOrgs = [{ ...org }]
            component.editOrg(org)  // sets editOrgValue

            component.attachedOrgForm.patchValue({
                trainingInstitute: 'NewOrg',
                attachedTrainingInstitute: 'Attached',
                trainingInstituteDetail: 'Details',
            })

            component.addOrg()

            expect(snackBarMock.open).toHaveBeenCalledWith('Updated successfully')
            expect(component.addedOrgs[0].name).toBe('NewOrg')
        })
    })

    describe('editOrg', () => {
        it('should set editOrgValue and patch form', () => {
            const org = { name: 'Org1', isAttachedInstitute: true, trainingInstituteDetail: 'Details' }
            component.editOrg(org)
            expect(component.editOrgValue).toEqual(org)
            expect(component.textBoxActive).toBe(true)
            expect(component.attachedOrgForm.get('trainingInstitute')?.value).toBe('Org1')
            expect(routerMock.navigate).toHaveBeenCalledWith(
                ['app', 'setup', 'institute-profile'],
                { fragment: 'maindiv' }
            )
        })
    })

    describe('deleteOrg', () => {
        it('should open confirm dialog when deleteOrg is called', () => {
            const org = { name: 'Org1' }
            component.deleteOrg(org)
            expect(dialogMock.open).toHaveBeenCalledWith(DialogConfirmComponent, expect.any(Object))
        })

        it('should remove org from list when dialog confirms', () => {
            const org = { name: 'Org1' }
            component.addedOrgs = [{ ...org }]
            component.deleteOrg(org)
            expect(component.addedOrgs.length).toBe(0)
            expect(orgSvcMock.updateLocalFormValue).toHaveBeenCalled()
        })

        it('should not remove org when dialog returns false', () => {
            dialogMock.open.mockReturnValue({
                afterClosed: jest.fn().mockReturnValue(of(false)),
            } as any)
            const org = { name: 'Org1' }
            component.addedOrgs = [{ ...org }]
            component.deleteOrg(org)
            expect(component.addedOrgs.length).toBe(1)
        })

        it('should do nothing when org is falsy', () => {
            component.deleteOrg(null)
            expect(dialogMock.open).not.toHaveBeenCalled()
        })
    })

    describe('updateLocalStoreData', () => {
        it('should call orgSvc.updateLocalFormValue and updateFormStatus', () => {
            component.addedOrgs = [{ name: 'Org1' }]
            component.updateLocalStoreData()
            expect(orgSvcMock.updateLocalFormValue).toHaveBeenCalledWith(
                'instituteProfile',
                expect.objectContaining({ attachedOrgs: [{ name: 'Org1' }] })
            )
            expect(orgSvcMock.updateFormStatus).toHaveBeenCalledWith(
                'instituteProfile',
                component.instituteProfileForm.valid
            )
        })
    })

    describe('openActivityDialog', () => {
        it('should open DialogBoxComponent with correct config', () => {
            component.openActivityDialog()
            expect(dialogMock.open).toHaveBeenCalledWith(DialogBoxComponent, {
                data: { view: 'insp' },
                hasBackdrop: false,
                width: '550px',
            })
        })
    })
})

