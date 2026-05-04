import { ConsultancyComponent } from './consultancy.component'

describe('ConsultancyComponent', () => {
    let component: ConsultancyComponent
    let mockOrgSvc: any
    let mockConfigSvc: any
    let mockRouter: any
    let mockDialog: any
    let mockSnackBar: any

    const makeComponent = () => new ConsultancyComponent(
        mockOrgSvc,
        mockConfigSvc,
        mockRouter,
        mockDialog,
        mockSnackBar
    )

    beforeEach(() => {
        mockOrgSvc = {
            updateFormStatus: jest.fn(),
            updateLocalFormValue: jest.fn(),
            formValues: { rolesAndFunctions: {} },
        }
        mockConfigSvc = {
            unMappedUser: {
                orgProfile: null,
                profileDetails: null,
            },
            userProfile: null,
        }
        mockRouter = { navigate: jest.fn() }
        mockDialog = { open: jest.fn() }
        mockSnackBar = { open: jest.fn() }

        component = makeComponent()
    })

    it('should create the component', () => {
        expect(component).toBeDefined()
    })

    it('should initialize consultancy form with Ongoing status and true industrySponsored', () => {
        expect(component.consultancyForm.get('projectName')).toBeDefined()
        expect(component.consultancyForm.get('programeStatus')?.value).toBe('Ongoing')
        expect(component.consultancyForm.get('industrySponsored')?.value).toBe(true)
        expect(component.consultancyForm.get('govtSponsored')?.value).toBe('')
    })

    it('should call orgSvc.updateFormStatus with consultancy=true on construction', () => {
        expect(mockOrgSvc.updateFormStatus).toHaveBeenCalledWith('consultancy', true)
    })

    describe('ngOnInit()', () => {
        it('should not crash when no orgProfile', () => {
            expect(() => component.ngOnInit()).not.toThrow()
        })

        it('should populate addedconsultancies from orgProfile when present', () => {
            mockConfigSvc.unMappedUser = {
                orgProfile: {
                    profileDetails: {
                        consultancy: { projects: [{ projectName: 'P1' }] },
                        rolesAndFunctions: null,
                    },
                },
            }
            component = makeComponent()
            component.ngOnInit()
            expect(component.addedconsultancies).toEqual([{ projectName: 'P1' }])
        })

        it('should set isConsultancy=true when rolesAndFunctions.consultancy is true', () => {
            mockOrgSvc.formValues = {
                rolesAndFunctions: { consultancy: true },
            }
            mockConfigSvc.unMappedUser = {
                orgProfile: { profileDetails: { consultancy: { projects: [] } } },
            }
            component = makeComponent()
            component.ngOnInit()
            expect(component.isConsultancy).toBe(true)
        })
    })

    describe('addProject()', () => {
        it('should add a project when form is valid (industrySponsored=true)', () => {
            component.consultancyForm.setValue({
                projectName: 'Test Project',
                programeStatus: 'Ongoing',
                industrySponsored: true,
                govtSponsored: false,
                otherSponsored: false,
                projectDetail: 'Details',
            })
            component.addProject()
            expect(component.addedconsultancies.length).toBe(1)
            expect(mockOrgSvc.updateLocalFormValue).toHaveBeenCalledWith('consultancy', { projects: component.addedconsultancies })
        })

        it('should show snackbar when projectName is missing', () => {
            component.consultancyForm.setValue({
                projectName: '',
                programeStatus: 'Ongoing',
                industrySponsored: true,
                govtSponsored: false,
                otherSponsored: false,
                projectDetail: '',
            })
            component.addProject()
            expect(component.addedconsultancies.length).toBe(0)
            expect(mockSnackBar.open).toHaveBeenCalledWith('Project name, program status, sponsers type are required')
        })

        it('should show snackbar when no sponsor is selected', () => {
            component.consultancyForm.setValue({
                projectName: 'Test',
                programeStatus: 'Ongoing',
                industrySponsored: false,
                govtSponsored: false,
                otherSponsored: false,
                projectDetail: '',
            })
            component.addProject()
            expect(mockSnackBar.open).toHaveBeenCalledWith('Project name, program status, sponsers type are required')
        })

        it('should update existing project in edit mode', () => {
            const project = {
                projectName: 'Old Name',
                programeStatus: 'Ongoing',
                industrySponsored: true,
                govtSponsored: false,
                otherSponsored: false,
                projectDetail: 'Old details',
            }
            component.addedconsultancies = [project]
            component.editValue = project
            mockConfigSvc.userProfile = { userId: 'u1' }
            mockConfigSvc.unMappedUser.profileDetails = {}
            component.consultancyForm.setValue({
                projectName: 'New Name',
                programeStatus: 'Completed',
                industrySponsored: true,
                govtSponsored: false,
                otherSponsored: false,
                projectDetail: 'New details',
            })
            component.addProject()
            expect(component.addedconsultancies[0].projectName).toBe('New Name')
            expect(mockSnackBar.open).toHaveBeenCalledWith('Updated successfully')
        })
    })

    describe('editProject()', () => {
        it('should patch form with project values and navigate', () => {
            const project = {
                projectName: 'P1',
                programeStatus: 'Completed',
                industrySponsored: true,
                govtSponsored: false,
                otherSponsored: false,
                projectDetail: 'Details',
            }
            component.editProject(project)
            expect(component.editValue).toBe(project)
            expect(component.consultancyForm.get('projectName')?.value).toBe('P1')
            expect(component.textBoxActive).toBe(true)
            expect(mockRouter.navigate).toHaveBeenCalledWith(['app', 'setup', 'consultancy'], { fragment: 'maindiv' })
        })

        it('should not do anything when project is null/undefined', () => {
            component.editProject(null)
            expect(component.editValue).toBeUndefined()
            expect(mockRouter.navigate).not.toHaveBeenCalled()
        })
    })

    describe('deleteProject()', () => {
        it('should open dialog and delete project on confirm', () => {
            const mockAfterClosed = { subscribe: jest.fn((cb: any) => cb(true)) }
            mockDialog.open.mockReturnValue({ afterClosed: () => mockAfterClosed })
            const project = { projectName: 'P1' }
            component.addedconsultancies = [{ projectName: 'P1' }]
            component.deleteProject(project)
            expect(mockDialog.open).toHaveBeenCalled()
            expect(component.addedconsultancies.length).toBe(0)
            expect(mockOrgSvc.updateLocalFormValue).toHaveBeenCalledWith('consultancy', { projects: [] })
        })

        it('should not delete when dialog returns false', () => {
            const mockAfterClosed = { subscribe: jest.fn((cb: any) => cb(false)) }
            mockDialog.open.mockReturnValue({ afterClosed: () => mockAfterClosed })
            const project = { projectName: 'P1' }
            component.addedconsultancies = [{ projectName: 'P1' }]
            component.deleteProject(project)
            expect(component.addedconsultancies.length).toBe(1)
        })

        it('should not open dialog when project is null/undefined', () => {
            component.deleteProject(null)
            expect(mockDialog.open).not.toHaveBeenCalled()
        })
    })

    describe('updateValuesToStore()', () => {
        it('should call updateLocalFormValue with projects', () => {
            component.addedconsultancies = [{ projectName: 'P1' }]
            component.updateValuesToStore()
            expect(mockOrgSvc.updateLocalFormValue).toHaveBeenCalledWith('consultancy', { projects: [{ projectName: 'P1' }] })
        })

        it('should set status to projects.length > 0 when isConsultancy=true', () => {
            component.isConsultancy = true
            component.addedconsultancies = [{ projectName: 'P1' }]
            component.updateValuesToStore()
            expect(mockOrgSvc.updateFormStatus).toHaveBeenCalledWith('consultancy', true)
        })

        it('should set status to true when isConsultancy=false', () => {
            component.isConsultancy = false
            component.addedconsultancies = []
            component.updateValuesToStore()
            expect(mockOrgSvc.updateFormStatus).toHaveBeenCalledWith('consultancy', true)
        })
    })

    describe('resetConsultancyForm()', () => {
        it('should reset form to default values', () => {
            component.consultancyForm.setValue({
                projectName: 'Test',
                programeStatus: 'Completed',
                industrySponsored: false,
                govtSponsored: true,
                otherSponsored: true,
                projectDetail: 'Details',
            })
            component.resetConsultancyForm()
            expect(component.consultancyForm.get('programeStatus')?.value).toBe('Ongoing')
            expect(component.consultancyForm.get('industrySponsored')?.value).toBe(true)
        })
    })

    describe('openActivityDialog()', () => {
        it('should open dialog with consultancy view', () => {
            const mockAfterClosed = { subscribe: jest.fn((cb: any) => cb(undefined)) }
            mockDialog.open.mockReturnValue({ afterClosed: () => mockAfterClosed })
            component.openActivityDialog()
            expect(mockDialog.open).toHaveBeenCalledWith(
                expect.anything(),
                { data: { view: 'consultancy' }, hasBackdrop: false, width: '550px' }
            )
        })
    })
})
