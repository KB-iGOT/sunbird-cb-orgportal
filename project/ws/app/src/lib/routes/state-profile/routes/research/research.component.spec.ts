import { of } from 'rxjs'
import { ResearchComponent } from './research.component'

// Mock lodash
jest.mock('lodash', () => ({
    get: jest.fn(),
    each: jest.fn(),
    findIndex: jest.fn(),
}))

import * as _ from 'lodash'

// Mock classes
class MockOrgProfileService {
    formValues = { rolesAndFunctions: {} };
    updateFormStatus = jest.fn();
    updateLocalFormValue = jest.fn();
}

class MockMatSnackBar {
    open = jest.fn();
}

class MockConfigurationsService {
    unMappedUser = {
        orgProfile: {
            profileDetails: {
                research: {
                    researchPrograms: [],
                    researchPapers: []
                },
                rolesAndFunctions: { research: false }
            }
        },
        profileDetails: {}
    };
    userProfile = {};
}

class MockRouter {
    navigate = jest.fn().mockReturnValue(Promise.resolve(true));
}

class MockMatDialog {
    open = jest.fn();
}

class MockDialogRef {
    afterClosed = jest.fn().mockReturnValue(of(true));
}

class MockElementRef {
    nativeElement = {
        value: 'Mock element value'
    };
}

describe('ResearchComponent', () => {
    let component: ResearchComponent
    let mockOrgSvc: MockOrgProfileService
    let mockSnackBar: MockMatSnackBar
    let mockConfigSvc: MockConfigurationsService
    let mockRouter: MockRouter
    let mockDialog: MockMatDialog
    let mockDialogRef: MockDialogRef

    beforeEach(() => {
        mockOrgSvc = new MockOrgProfileService()
        mockSnackBar = new MockMatSnackBar()
        mockConfigSvc = new MockConfigurationsService()
        mockRouter = new MockRouter()
        mockDialog = new MockMatDialog()
        mockDialogRef = new MockDialogRef();

        // Reset lodash mocks
        (_.get as jest.Mock).mockReturnValue(undefined);
        (_.each as jest.Mock).mockImplementation((collection, iteratee) => {
            if (Array.isArray(collection)) {
                collection.forEach(iteratee)
            }
        });
        (_.findIndex as jest.Mock).mockReturnValue(-1)

        component = new ResearchComponent(
            mockOrgSvc as any,
            mockSnackBar as any,
            mockConfigSvc as any,
            mockRouter as any,
            mockDialog as any
        )

        // Mock ViewChild elements
        component.deleteProgramTitleRef = new MockElementRef() as any
        component.deleteProgramBodyRef = new MockElementRef() as any
        component.deletePaperTitleRef = new MockElementRef() as any
        component.deletePaperBodyRef = new MockElementRef() as any
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    describe('Constructor', () => {
        it('should initialize forms and default values', () => {
            expect(component.researchProgramForm).toBeDefined()
            expect(component.researchPaperForm).toBeDefined()
            expect(component.addedPrograms).toEqual([])
            expect(component.addedPapers).toEqual([])
            expect(component.textBoxActive).toBe(false)
            expect(component.textBoxActive1).toBe(false)
            expect(component.isResearch).toBe(false)
            expect(mockOrgSvc.updateFormStatus).toHaveBeenCalledWith('research', true)
        })

        it('should initialize research program form with correct validators', () => {
            expect(component.researchProgramForm.get('projectName')).toBeDefined()
            expect(component.researchProgramForm.get('programeStatus')?.value).toBe('Ongoing')
            expect(component.researchProgramForm.get('industrySponsored')?.value).toBe(true)
            expect(component.researchProgramForm.get('govtSponsored')?.value).toBe(false)
            expect(component.researchProgramForm.get('otherSponsored')?.value).toBe(false)
            expect(component.researchProgramForm.get('projectDetail')).toBeDefined()
        })

        it('should initialize research paper form', () => {
            expect(component.researchPaperForm.get('researchPaperName')).toBeDefined()
            expect(component.researchPaperForm.get('researchPaperDetail')).toBeDefined()
        })
    })

    describe('ngOnInit', () => {
        it('should populate forms when data is available', () => {
            const mockResearchData = {
                researchPrograms: [{ projectName: 'Test Project' }],
                researchPapers: [{ researchPaperName: 'Test Paper' }]
            };

            (_.get as jest.Mock)
                .mockReturnValueOnce(mockResearchData) // for researchData
                .mockReturnValueOnce(mockResearchData.researchPapers) // for researchPapers
                .mockReturnValueOnce(mockResearchData.researchPrograms) // for researchPrograms

            const updateSpy = jest.spyOn(component, 'updateValuesToStore')

            component.ngOnInit()

            expect(component.addedPapers).toEqual(mockResearchData.researchPapers)
            expect(component.addedPrograms).toEqual(mockResearchData.researchPrograms)
            expect(updateSpy).toHaveBeenCalled()
            expect(mockOrgSvc.updateFormStatus).toHaveBeenCalledWith('research', true)
        })

        it('should handle empty research data', () => {
            (_.get as jest.Mock).mockReturnValue(undefined)

            component.ngOnInit()

            expect(component.addedPapers).toEqual([])
            expect(component.addedPrograms).toEqual([])
        })

        it('should set isResearch to true when research role is selected from orgSvc', () => {
            mockOrgSvc.formValues = { rolesAndFunctions: { research: true } };
            (_.get as jest.Mock).mockReturnValue({ research: true })

            component.ngOnInit()

            expect(component.isResearch).toBe(true)
            expect(mockOrgSvc.updateFormStatus).toHaveBeenCalledWith('research', false)
        })

        it('should set isResearch to true when research role is selected from configSvc', () => {
            mockOrgSvc.formValues = { rolesAndFunctions: {} };
            (_.get as jest.Mock).mockReturnValue({ research: true })

            component.ngOnInit()

            expect(component.isResearch).toBe(true)
        })

        it('should handle empty rolesAndFunctions from orgSvc', () => {
            mockOrgSvc.formValues.rolesAndFunctions = {};
            (_.get as jest.Mock).mockReturnValue(undefined)

            component.ngOnInit()

            expect(component.isResearch).toBe(false)
        })
    })

    describe('addProgram', () => {
        beforeEach(() => {
            component.researchProgramForm.patchValue({
                projectName: 'Test Project',
                programeStatus: 'Ongoing',
                industrySponsored: true,
                govtSponsored: false,
                otherSponsored: false,
                projectDetail: 'Test Detail'
            })
        })

        it('should add program when form is valid and not in edit mode', () => {
            const resetSpy = jest.spyOn(component, 'resetProgramForm')
            const updateSpy = jest.spyOn(component, 'updateValuesToStore')

            component.addProgram()

            expect(component.addedPrograms.length).toBe(1)
            expect(component.addedPrograms[0].projectName).toBe('Test Project')
            expect(resetSpy).toHaveBeenCalled()
            expect(updateSpy).toHaveBeenCalled()
        })

        it('should show error message when form is invalid', () => {
            component.researchProgramForm.patchValue({
                projectName: '',
                industrySponsored: false,
                govtSponsored: false,
                otherSponsored: false
            })

            component.addProgram()

            expect(mockSnackBar.open).toHaveBeenCalledWith('Project name, program status, sponsers type are required')
            expect(component.addedPrograms.length).toBe(0)
        })

        it('should show error when no sponsor type is selected', () => {
            component.researchProgramForm.patchValue({
                projectName: 'Test Project',
                industrySponsored: false,
                govtSponsored: false,
                otherSponsored: false
            })

            component.addProgram()

            expect(mockSnackBar.open).toHaveBeenCalledWith('Project name, program status, sponsers type are required')
        })

        it('should update program when in edit mode', () => {
            component.editProgramValue = { projectName: 'Existing Project' }
            component.addedPrograms = [{ projectName: 'Existing Project' }]
            mockConfigSvc.userProfile = {}
            mockConfigSvc.unMappedUser.profileDetails = {};

            (_.each as jest.Mock).mockImplementation((collection, iteratee) => {
                collection.forEach((item: any) => iteratee(item))
            })

            const resetSpy = jest.spyOn(component, 'resetProgramForm')
            const updateSpy = jest.spyOn(component, 'updateValuesToStore')

            component.addProgram()

            expect(mockSnackBar.open).toHaveBeenCalledWith('Updated successfully')
            expect(component.editProgramValue).toBeUndefined()
            expect(resetSpy).toHaveBeenCalled()
            expect(updateSpy).toHaveBeenCalled()
        })
    })

    describe('editProgram', () => {
        it('should set edit mode and patch form values', () => {
            const program = {
                projectName: 'Test Project',
                programeStatus: 'Completed',
                industrySponsored: false,
                govtSponsored: true,
                otherSponsored: false,
                projectDetail: 'Test Detail'
            }

            const updateSpy = jest.spyOn(component, 'updateValuesToStore')

            component.editProgram(program)

            expect(component.editProgramValue).toEqual(program)
            expect(component.researchProgramForm.value.projectName).toBe('Test Project')
            expect(component.researchProgramForm.value.programeStatus).toBe('Completed')
            expect(component.textBoxActive).toBe(true)
            expect(mockRouter.navigate).toHaveBeenCalledWith(['app', 'setup', 'research'], { fragment: 'maindiv' })
            expect(updateSpy).toHaveBeenCalled()
        })

        it('should not do anything when program is falsy', () => {
            component.editProgram(null)

            expect(component.editProgramValue).toBeUndefined()
            expect(component.textBoxActive).toBe(false)
        })
    })

    describe('deleteProgram', () => {
        it('should open dialog and delete program when confirmed', () => {
            const program = { projectName: 'Test Project' }
            component.addedPrograms = [program]

            mockDialog.open.mockReturnValue(mockDialogRef as any);
            (_.findIndex as jest.Mock).mockReturnValue(0)

            const updateSpy = jest.spyOn(component, 'updateValuesToStore')

            component.deleteProgram(program)

            expect(mockDialog.open).toHaveBeenCalledWith(expect.any(Function), {
                data: {
                    title: 'Mock element value',
                    body: 'Mock element value'
                }
            })

            // Simulate dialog confirmation
            mockDialogRef.afterClosed().subscribe(() => {
                expect(component.addedPrograms.length).toBe(0)
                expect(updateSpy).toHaveBeenCalled()
            })
        })

        it('should not delete program when dialog is cancelled', () => {
            const program = { projectName: 'Test Project' }
            component.addedPrograms = [program]

            mockDialogRef.afterClosed.mockReturnValue(of(false))
            mockDialog.open.mockReturnValue(mockDialogRef as any)

            component.deleteProgram(program)

            mockDialogRef.afterClosed().subscribe(() => {
                expect(component.addedPrograms.length).toBe(1)
            })
        })

        it('should handle null ViewChild elements', () => {
            component.deleteProgramTitleRef = null
            component.deleteProgramBodyRef = null
            const program = { projectName: 'Test Project' }

            mockDialog.open.mockReturnValue(mockDialogRef as any)

            component.deleteProgram(program)

            expect(mockDialog.open).toHaveBeenCalledWith(expect.any(Function), {
                data: {
                    title: '',
                    body: ''
                }
            })
        })

        it('should not do anything when program is falsy', () => {
            component.deleteProgram(null)

            expect(mockDialog.open).not.toHaveBeenCalled()
        })
    })

    describe('addPaper', () => {
        beforeEach(() => {
            component.researchPaperForm.patchValue({
                researchPaperName: 'Test Paper',
                researchPaperDetail: 'Test Detail'
            })
        })

        it('should add paper when form is valid and not in edit mode', () => {
            const resetSpy = jest.spyOn(component, 'resetPaperForm')
            const updateSpy = jest.spyOn(component, 'updateValuesToStore')

            component.addPaper()

            expect(component.addedPapers.length).toBe(1)
            expect(component.addedPapers[0].researchPaperName).toBe('Test Paper')
            expect(resetSpy).toHaveBeenCalled()
            expect(updateSpy).toHaveBeenCalled()
        })

        it('should show error message when paper name is empty', () => {
            component.researchPaperForm.patchValue({
                researchPaperName: ''
            })

            component.addPaper()

            expect(mockSnackBar.open).toHaveBeenCalledWith('Research paper name is required')
            expect(component.addedPapers.length).toBe(0)
        })

        it('should update paper when in edit mode', () => {
            component.editPaperValue = { researchPaperName: 'Existing Paper' }
            component.addedPapers = [{ researchPaperName: 'Existing Paper' }]
            mockConfigSvc.userProfile = {}
            mockConfigSvc.unMappedUser.profileDetails = {};

            (_.each as jest.Mock).mockImplementation((collection, iteratee) => {
                collection.forEach((item: any) => iteratee(item))
            })

            const resetSpy = jest.spyOn(component, 'resetPaperForm')
            const updateSpy = jest.spyOn(component, 'updateValuesToStore')

            component.addPaper()

            expect(mockSnackBar.open).toHaveBeenCalledWith('Updated successfully')
            expect(component.editPaperValue).toBeUndefined()
            expect(resetSpy).toHaveBeenCalled()
            expect(updateSpy).toHaveBeenCalled()
        })
    })

    describe('editPaper', () => {
        it('should set edit mode and patch form values', () => {
            const paper = {
                researchPaperName: 'Test Paper',
                researchPaperDetail: 'Test Detail'
            }

            const updateSpy = jest.spyOn(component, 'updateValuesToStore')

            component.editPaper(paper)

            expect(component.editPaperValue).toEqual(paper)
            expect(component.researchPaperForm.value.researchPaperName).toBe('Test Paper')
            expect(component.researchPaperForm.value.researchPaperDetail).toBe('Test Detail')
            expect(component.textBoxActive1).toBe(true)
            expect(mockRouter.navigate).toHaveBeenCalledWith(['app', 'setup', 'research'], { fragment: 'maindiv1' })
            expect(updateSpy).toHaveBeenCalled()
        })

        it('should not do anything when paper is falsy', () => {
            component.editPaper(null)

            expect(component.editPaperValue).toBeUndefined()
            expect(component.textBoxActive1).toBe(false)
        })
    })

    describe('deletePaper', () => {
        it('should open dialog and delete paper when confirmed', () => {
            const paper = { researchPaperName: 'Test Paper' }
            component.addedPapers = [paper]

            mockDialog.open.mockReturnValue(mockDialogRef as any);
            (_.findIndex as jest.Mock).mockReturnValue(0)

            const updateSpy = jest.spyOn(component, 'updateValuesToStore')

            component.deletePaper(paper)

            expect(mockDialog.open).toHaveBeenCalledWith(expect.any(Function), {
                data: {
                    title: 'Mock element value',
                    body: 'Mock element value'
                }
            })

            // Simulate dialog confirmation
            mockDialogRef.afterClosed().subscribe(() => {
                expect(component.addedPapers.length).toBe(0)
                expect(updateSpy).toHaveBeenCalled()
            })
        })

        it('should not delete paper when dialog is cancelled', () => {
            const paper = { researchPaperName: 'Test Paper' }
            component.addedPapers = [paper]

            mockDialogRef.afterClosed.mockReturnValue(of(false))
            mockDialog.open.mockReturnValue(mockDialogRef as any)

            component.deletePaper(paper)

            mockDialogRef.afterClosed().subscribe(() => {
                expect(component.addedPapers.length).toBe(1)
            })
        })

        it('should handle null ViewChild elements', () => {
            component.deletePaperTitleRef = null
            component.deletePaperBodyRef = null
            const paper = { researchPaperName: 'Test Paper' }

            mockDialog.open.mockReturnValue(mockDialogRef as any)

            component.deletePaper(paper)

            expect(mockDialog.open).toHaveBeenCalledWith(expect.any(Function), {
                data: {
                    title: '',
                    body: ''
                }
            })
        })

        it('should not do anything when paper is falsy', () => {
            component.deletePaper(null)

            expect(mockDialog.open).not.toHaveBeenCalled()
        })
    })

    describe('resetProgramForm', () => {
        it('should reset form to default values', () => {
            component.researchProgramForm.patchValue({
                projectName: 'Test',
                programeStatus: 'Completed',
                industrySponsored: false,
                govtSponsored: true,
                otherSponsored: true,
                projectDetail: 'Test Detail'
            })

            component.resetProgramForm()

            expect(component.researchProgramForm.value.projectName).toBe('')
            expect(component.researchProgramForm.value.programeStatus).toBe('Ongoing')
            expect(component.researchProgramForm.value.industrySponsored).toBe(true)
            expect(component.researchProgramForm.value.govtSponsored).toBe(false)
            expect(component.researchProgramForm.value.otherSponsored).toBe(false)
            expect(component.researchProgramForm.value.projectDetail).toBe('')
        })
    })

    describe('resetPaperForm', () => {
        it('should reset paper form', () => {
            component.researchPaperForm.patchValue({
                researchPaperName: 'Test Paper',
                researchPaperDetail: 'Test Detail'
            })

            component.resetPaperForm()

            expect(component.researchPaperForm.value.researchPaperName).toBe('')
            expect(component.researchPaperForm.value.researchPaperDetail).toBe('')
        })
    })

    describe('updateValuesToStore', () => {
        it('should update local form values and form status when isResearch is true', () => {
            component.isResearch = true
            component.addedPrograms = [{ projectName: 'Test' }]
            component.addedPapers = [{ researchPaperName: 'Test' }]

            component.updateValuesToStore()

            expect(mockOrgSvc.updateLocalFormValue).toHaveBeenCalledWith('research', {
                researchPrograms: component.addedPrograms,
                researchPapers: component.addedPapers
            })
            expect(mockOrgSvc.updateFormStatus).toHaveBeenCalledWith('research', true)
        })

        it('should update form status to true when isResearch is false', () => {
            component.isResearch = false
            component.addedPrograms = []

            component.updateValuesToStore()

            expect(mockOrgSvc.updateFormStatus).toHaveBeenCalledWith('research', true)
        })

        it('should update form status to false when isResearch is true and no programs', () => {
            component.isResearch = true
            component.addedPrograms = []

            component.updateValuesToStore()

            expect(mockOrgSvc.updateFormStatus).toHaveBeenCalledWith('research', false)
        })
    })

    describe('openActivityDialog', () => {
        it('should open dialog with correct configuration', () => {
            mockDialog.open.mockReturnValue(mockDialogRef as any)

            component.openActivityDialog()

            expect(mockDialog.open).toHaveBeenCalledWith(expect.any(Function), {
                data: {
                    view: 'research'
                },
                hasBackdrop: false,
                width: '550px'
            })
        })

        it('should handle dialog close', () => {
            mockDialog.open.mockReturnValue(mockDialogRef as any)
            mockDialogRef.afterClosed.mockReturnValue(of({}))

            component.openActivityDialog()

            expect(mockDialogRef.afterClosed).toHaveBeenCalled()
        })
    })

    describe('Edge Cases', () => {
        it('should handle missing nativeElement in ViewChild', () => {
            component.deleteProgramTitleRef = { nativeElement: null } as any
            component.deleteProgramBodyRef = { nativeElement: null } as any

            const program = { projectName: 'Test Project' }
            mockDialog.open.mockReturnValue(mockDialogRef as any)

            component.deleteProgram(program)

            expect(mockDialog.open).toHaveBeenCalledWith(expect.any(Function), {
                data: {
                    title: '',
                    body: ''
                }
            })
        })

        it('should handle lodash.get returning null/undefined', () => {
            (_.get as jest.Mock).mockReturnValue(null)

            component.ngOnInit()

            expect(component.addedPapers).toEqual([])
            expect(component.addedPrograms).toEqual([])
        })

        // it('should handle empty formValues in ngOnInit', () => {
        //     mockOrgSvc.formValues = {};
        //     (_.get as jest.Mock).mockReturnValue(undefined)

        //     component.ngOnInit()

        //     expect(component.isResearch).toBe(false)
        // })
    })
})