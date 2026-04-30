import { LearnerResponsesComponent } from './learner-responses.component'
import { BlendedApporvalService } from '../../services/blended-approval.service'
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog'
import { of, throwError } from 'rxjs'

// Mock lodash
jest.mock('lodash', () => ({
    get: jest.fn(),
    sortBy: jest.fn()
}))

// Mock environment
jest.mock('../../../../../../../../../src/environments/environment', () => ({
    environment: {
        doptOrg: 'test-org'
    }
}))

describe('LearnerResponsesComponent', () => {
    let component: LearnerResponsesComponent
    let mockBpService: jest.Mocked<BlendedApporvalService>
    let mockDialog: jest.Mocked<MatDialog>

    // Mock data
    const mockContentData = {
        wfSurveyLink: 'https://example.com/surveys/123',
        createdFor: ['test-org']
    }

    const mockSelectedUser = {
        wfInfo: [{
            userId: 'user123',
            currentStatus: 'SEND_FOR_MDO_APPROVAL'
        }]
    }

    const mockBatchData = {
        batchAttributes: {
            bpEnrolMandatoryProfileFields: [
                { field: 'profileDetails.professionalDetails.group' },
                { field: 'profileDetails.professionalDetails.designation' }
            ],
            profileSurveyLink: 'https://example.com/surveys/456'
        }
    }

    const mockUserData = {
        firstName: 'John',
        email: 'john@example.com',
        userId: 'user123',
        avatar: 'avatar-url',
        profileDetails: {
            userId: 'user123',
            employmentDetails: {
                departmentName: 'IT Department'
            },
            professionalDetails: [{
                designation: 'Software Engineer'
            }]
        }
    }

    const mockSurveyResponse = {
        statusInfo: {
            statusCode: 200
        },
        responseData: [
            {
                formId: '123',
                timestamp: '2023-01-01',
                dataObject: {
                    Group: 'Test Group',
                    Designation: 'Test Designation'
                }
            }
        ]
    }

    beforeEach(() => {
        // Create mocked services
        mockBpService = {
            getSurveyByFormId: jest.fn(),
            getUserById: jest.fn(),
            getSurveyByUserID: jest.fn(),
            getSubmissionsByUserId: jest.fn(),
        } as any

        mockDialog = {
            open: jest.fn()
        } as any

        // Create component instance
        component = new LearnerResponsesComponent(mockBpService, mockDialog)

        // Set up input properties
        component.contentData = mockContentData
        component.selectedUser = mockSelectedUser
        component.batchData = mockBatchData

        // Mock lodash functions
        const _ = require('lodash')
        _.get.mockImplementation((obj: any, path: string) => {
            const keys = path.split('.')
            let result = obj
            for (const key of keys) {
                if (result && typeof result === 'object') {
                    if (key.includes('[') && key.includes(']')) {
                        const arrayKey = key.split('[')[0]
                        const index = parseInt(key.split('[')[1].split(']')[0])
                        result = result[arrayKey]?.[index]
                    } else {
                        result = result[key]
                    }
                } else {
                    return undefined
                }
            }
            return result
        })

        _.sortBy.mockImplementation((array: any[], key: string[]) => {
            return [...array].sort((a, b) => a[key[0]] - b[key[0]])
        })
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    describe('Component Initialization', () => {
        it('should create component instance', () => {
            expect(component).toBeTruthy()
        })

        it('should initialize with default values', () => {
            expect(component.showActions).toBe(false)
            expect(component.isReadOnly).toBe(true)
            expect(component.showSpinner).toBe(true)
            expect(component.newForm).toBe(true)
            expect(component.formTitle).toBe('')
            expect(component.surveyGroup).toBe('')
            expect(component.surevyDesignation).toBe('')
        })
    })

    describe('ngOnInit', () => {
        beforeEach(() => {
            jest.spyOn(component, 'fetchLearner').mockImplementation()
            jest.spyOn(component, 'getFormById').mockImplementation()
            jest.spyOn(component, 'getGroupAndDesignationFromSurevyForm').mockImplementation()
        })

        it('should extract formId from contentData', () => {
            component.ngOnInit()

            expect(component.formId).toBe('123')
        })

        it('should set userId and showActions from selectedUser', () => {
            component.ngOnInit()

            expect(component.userId).toBe('user123')
            expect(component.showActions).toBe(true)
        })

        it('should call required methods', () => {
            component.ngOnInit()

            expect(component.fetchLearner).toHaveBeenCalled()
            expect(component.getFormById).toHaveBeenCalled()
            expect(component.getGroupAndDesignationFromSurevyForm).toHaveBeenCalled()
        })
    })

    describe('fetchLearner', () => {
        it('should fetch user data and create learner object', () => {
            mockBpService.getUserById.mockReturnValue(of(mockUserData))

            component.userId = 'user123'
            component.fetchLearner()

            expect(mockBpService.getUserById).toHaveBeenCalledWith('user123')
            expect(component.userData).toEqual(mockUserData)
            expect(component.learner).toEqual({
                department: 'IT Department',
                profileImage: 'avatar-url',
                name: 'John',
                authorType: '',
                email: 'john@example.com',
                profileLink: '/app/profile/user123',
                userId: 'user123',
                designation: 'Software Engineer'
            })
        })

        it('should handle service error gracefully', () => {
            mockBpService.getUserById.mockReturnValue(throwError('Service error'))

            component.userId = 'user123'

            expect(() => component.fetchLearner()).not.toThrow()
        })
    })

    describe('getFormById', () => {
        it('should fetch form data and set component properties', async () => {
            // Component expects: { result: { response: { fields, title, clientVersion } } }
            const mockFormResp = {
                result: {
                    response: {
                        fields: ['field1', 'field2'],
                        title: 'Test Form',
                        clientVersion: 1.1,
                    }
                }
            }
            const mockObservable = of(mockFormResp)
            mockBpService.getSurveyByFormId.mockReturnValue(mockObservable)
            jest.spyOn(component, 'getSurveyReport').mockImplementation()

            component.formId = '123'
            await component.getFormById()

            expect(mockBpService.getSurveyByFormId).toHaveBeenCalledWith('123')
            expect(component.formfields).toEqual(['field1', 'field2'])
            expect(component.formTitle).toBe('Test Form')
            expect(component.newForm).toBe(true)
            expect(component.getSurveyReport).toHaveBeenCalled()
        })

        it('should handle service error gracefully', async () => {
            const mockObservable = throwError('Service error')
            mockBpService.getSurveyByFormId.mockReturnValue(mockObservable)

            component.formId = '123'
            await component.getFormById()

            expect(component.formfields).toBeUndefined()
        })
    })

    describe('getSurveyReport', () => {
        beforeEach(() => {
            component.formId = '123'
            component.userId = 'user123'
            jest.useFakeTimers()
        })

        afterEach(() => {
            jest.useRealTimers()
        })

        it('should fetch survey report and set apiData', async () => {
            // Component uses getSubmissionsByUserId and checks params.status === 'success'
            const mockSubmissionResp = {
                params: { status: 'success' },
                result: {
                    response: {
                        content: [{
                            formId: '123',
                            timestamp: '2023-01-01',
                            responses: [{ question: 'q1', answer: 'a1' }]
                        }]
                    }
                }
            }
            mockBpService.getSubmissionsByUserId.mockReturnValue(of(mockSubmissionResp))

            await component.getSurveyReport()

            expect(mockBpService.getSubmissionsByUserId).toHaveBeenCalledWith({
                filters: {
                    formId: '123',
                    status: 'SUBMITTED',
                    createdBy: 'user123'
                },
                page: 0,
                size: 20,
                sortBy: 'createdDate',
                sortOrder: 'ASC'
            })

            // Fast forward timer
            jest.advanceTimersByTime(1000)
            expect(component.showSpinner).toBe(false)
        })

        it('should handle service error gracefully', async () => {
            mockBpService.getSubmissionsByUserId.mockReturnValue(throwError('Service error'))
            // Pre-set latestData to prevent TypeError when component accesses latestData.formId
            component.latestData = { formId: '123', responses: [] }

            await component.getSurveyReport()

            // showSpinner should remain true since no successful response
            expect(component.showSpinner).toBe(true)
        })
    })

    describe('getProfileSurevyReport', () => {
        it('should fetch profile survey data and set group and designation', async () => {
            const mockObservable = of(mockSurveyResponse)
            mockBpService.getSurveyByUserID.mockReturnValue(mockObservable)

            component.userId = 'user123'
            await component.getProfileSurevyReport('456', true, true)

            expect(mockBpService.getSurveyByUserID).toHaveBeenCalledWith({
                searchObjects: [
                    { key: 'formId', values: '456' },
                    { key: 'updatedBy', values: 'user123' }
                ]
            })

            expect(component.surveyGroup).toBe('Test Group')
            expect(component.surevyDesignation).toBe('Test Designation')
        })

        it('should only set group when hasGroups is true', async () => {
            const mockObservable = of(mockSurveyResponse)
            mockBpService.getSurveyByUserID.mockReturnValue(mockObservable)

            component.userId = 'user123'
            await component.getProfileSurevyReport('456', true, false)

            expect(component.surveyGroup).toBe('Test Group')
            expect(component.surevyDesignation).toBe('')
        })
    })

    describe('Dialog Methods', () => {
        describe('onReject', () => {
            it('should open reject dialog and emit action on confirmation', () => {
                const mockDialogRef = {
                    afterClosed: jest.fn().mockReturnValue(of({ reason: 'Test reason' }))
                }
                mockDialog.open.mockReturnValue(mockDialogRef as any)
                jest.spyOn(component.actionClick, 'emit')

                component.onReject()

                expect(mockDialog.open).toHaveBeenCalled()
                expect(component.actionClick.emit).toHaveBeenCalledWith({
                    action: 'Reject',
                    userData: mockSelectedUser,
                    comment: 'Test reason'
                })
            })

            it('should not emit action when dialog is cancelled', () => {
                const mockDialogRef = {
                    afterClosed: jest.fn().mockReturnValue(of(null))
                }
                mockDialog.open.mockReturnValue(mockDialogRef as any)
                jest.spyOn(component.actionClick, 'emit')

                component.onReject()

                expect(component.actionClick.emit).not.toHaveBeenCalled()
            })
        })

        describe('onApprove', () => {
            it('should open confirm dialog and emit action on confirmation', () => {
                const mockDialogRef = {
                    afterClosed: jest.fn().mockReturnValue(of(true))
                }
                mockDialog.open.mockReturnValue(mockDialogRef as any)
                jest.spyOn(component.actionClick, 'emit')

                component.onApprove()

                expect(mockDialog.open).toHaveBeenCalled()
                expect(component.actionClick.emit).toHaveBeenCalledWith({
                    action: 'Approve',
                    userData: mockSelectedUser
                })
            })
        })
    })

    describe('Utility Methods', () => {
        describe('getProfileLink', () => {
            it('should return profile link when userId exists', () => {
                const profile = { userId: 'user123' } as any
                const result = component.getProfileLink(profile)

                expect(result).toBe('/app/profile/user123')
            })

            it('should return # when profile or userId is missing', () => {
                expect(component.getProfileLink(null as any)).toBe('#')
                expect(component.getProfileLink({} as any)).toBe('#')
            })
        })

        describe('moveBack', () => {
            it('should emit clickBack event', () => {
                jest.spyOn(component.clickBack, 'emit')

                component.moveBack()

                expect(component.clickBack.emit).toHaveBeenCalledWith(true)
            })
        })

        describe('getLearner getter', () => {
            it('should return learner when it exists', () => {
                component.learner = { name: 'Test User' } as any

                expect(component.getLearner).toEqual({ name: 'Test User' })
            })

            it('should return null when learner does not exist', () => {
                component.learner = null

                expect(component.getLearner).toBe(null)
            })
        })

        describe('getDateFromText', () => {
            it('should handle ISO date string with T separator', () => {
                const result = component.getDateFromText('2023-12-25T10:30:00')

                expect(result).toBe('2023-12-25')
            })

            it('should handle DD-MM-YYYY format', () => {
                const result = component.getDateFromText('25-12-2023')

                expect(result).toEqual(new Date('2023-12-25'))
            })

            it('should handle YYYY-MM-DD format', () => {
                const result = component.getDateFromText('2023-12-25')

                expect(result).toEqual(new Date('2023-12-25'))
            })

            it('should return empty string for invalid input', () => {
                expect(component.getDateFromText('')).toBe('')
                expect(component.getDateFromText(null as any)).toBe('')
            })
        })
    })

    describe('getGroupAndDesignationFromSurevyForm', () => {
        it('should call getProfileSurevyReport when conditions are met', () => {
            jest.spyOn(component, 'getProfileSurevyReport').mockImplementation()

            component.getGroupAndDesignationFromSurevyForm()

            // hasGroups and hasDesignation are the found field objects (truthy), not boolean true
            expect(component.getProfileSurevyReport).toHaveBeenCalledWith(
                '456',
                expect.objectContaining({ field: 'profileDetails.professionalDetails.group' }),
                expect.objectContaining({ field: 'profileDetails.professionalDetails.designation' })
            )
        })

        it('should not call getProfileSurevyReport when doptOrg does not match', () => {
            jest.spyOn(component, 'getProfileSurevyReport').mockImplementation()

            // Mock different org
            component.contentData = { ...mockContentData, createdFor: ['different-org'] }
            component.getGroupAndDesignationFromSurevyForm()

            expect(component.getProfileSurevyReport).not.toHaveBeenCalled()
        })

        it('should not call getProfileSurevyReport when no mandatory fields exist', () => {
            jest.spyOn(component, 'getProfileSurevyReport').mockImplementation()

            component.batchData = {
                batchAttributes: {
                    bpEnrolMandatoryProfileFields: [],
                    profileSurveyLink: 'https://example.com/surveys/456'
                }
            }
            component.getGroupAndDesignationFromSurevyForm()

            expect(component.getProfileSurevyReport).not.toHaveBeenCalled()
        })
    })
})