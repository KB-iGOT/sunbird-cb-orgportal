import { SimpleChanges } from '@angular/core'
import { MatLegacyDialog } from '@angular/material/legacy-dialog'
import { MatLegacySnackBar } from '@angular/material/legacy-snack-bar'
import { EventsService } from '../../../events-2/services/events.service'
import { CompetencyAddComponent } from '../../../../../../common/competency-add/competency-add.component'
import { CommunityCompetencyComponent } from './community-competency.component'

// Mocks
jest.mock('@angular/material/legacy-dialog')
jest.mock('@angular/material/legacy-snack-bar')
jest.mock('../../../events-2/services/events.service')

describe('CommunityCompetencyComponent', () => {
  let component: CommunityCompetencyComponent
  let mockMatSnackBar: jest.Mocked<MatLegacySnackBar>
  let mockDialog: jest.Mocked<MatLegacyDialog>
  let mockEventsService: jest.Mocked<EventsService>

  // Sample test data
  const mockCompetenciesList = [
    {
      competencyAreaId: '1',
      competencyAreaName: 'Programming',
      competencyThemes: [
        {
          competencyThemeId: '1-1',
          competencyThemeName: 'Web Development',
          competencySubThemes: [
            {
              competencySubThemeId: '1-1-1',
              competencySubThemeAdditionalProperties: {
                displayName: 'Frontend'
              }
            }
          ]
        }
      ]
    }
  ]

  const mockTreeViewData = [
    {
      competencyAreaId: '1',
      competencyAreaName: 'Programming',
      collapsed: true,
      themes: [
        {
          competencyThemeId: '1-1',
          competencyThemeName: 'Web Development',
          collapsed: true,
          subThems: [
            {
              competencySubThemeId: '1-1-1',
              competencySubThemeAdditionalProperties: {
                displayName: 'Frontend'
              }
            }
          ]
        }
      ]
    }
  ]

  // Mock dialog reference
  const mockDialogRef = {
    afterClosed: jest.fn().mockReturnValue({
      subscribe: jest.fn()
    })
  }

  beforeEach(() => {
    // Create mocks
    mockMatSnackBar = {
      open: jest.fn(),
    } as unknown as jest.Mocked<MatLegacySnackBar>

    mockDialog = {
      open: jest.fn().mockReturnValue(mockDialogRef)
    } as unknown as jest.Mocked<MatLegacyDialog>

    mockEventsService = {
      convertToTreeView: jest.fn().mockReturnValue(mockTreeViewData),
      convertToTabularView: jest.fn().mockReturnValue(mockCompetenciesList)
    } as unknown as jest.Mocked<EventsService>

    // Create component instance
    component = new CommunityCompetencyComponent(
      mockMatSnackBar,
      mockDialog,
      mockEventsService
    )

    // Set default property values
    component.competenciesList = mockCompetenciesList
    component.competencies = mockTreeViewData

    // Reset the dialog afterClosed subscription function
    mockDialogRef.afterClosed.mockReturnValue({
      subscribe: jest.fn().mockImplementation(callback => callback(mockCompetenciesList))
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('constructor', () => {
    it('should create the component with default values', () => {
      expect(component).toBeTruthy()
      expect(component.openMode).toBe('edit')
      expect(component.competenciesList).toEqual(mockCompetenciesList)
      expect(component.searchText).toBe('')
      expect(component.event).toBeUndefined()
      expect(component.eventId).toBeUndefined()
    })
  })

  describe('ngOnChanges', () => {
    it('should convert competenciesList to tree view when changes occur', () => {
      // Setup
      const changes: SimpleChanges = {
        competenciesList: {
          currentValue: mockCompetenciesList,
          previousValue: undefined,
          firstChange: true,
          isFirstChange: () => true
        }
      }

      // Act
      component.ngOnChanges(changes)

      // Assert
      expect(mockEventsService.convertToTreeView).toHaveBeenCalledWith(mockCompetenciesList)
      expect(component.competencies).toEqual(mockTreeViewData)
    })

    it('should not convert to tree view when competenciesList is not changed', () => {
      // Setup
      const changes: SimpleChanges = {
        otherProperty: {
          currentValue: 'something',
          previousValue: undefined,
          firstChange: true,
          isFirstChange: () => true
        }
      }

      // Reset mock to track new calls
      mockEventsService.convertToTreeView.mockClear()

      // Act
      component.ngOnChanges(changes)

      // Assert
      expect(mockEventsService.convertToTreeView).not.toHaveBeenCalled()
    })
  })

  describe('hideAnfShow', () => {
    it('should toggle collapsed state from true to false', () => {
      // Setup
      const row = { collapsed: true }

      // Act
      component.hideAnfShow(row)

      // Assert
      expect(row.collapsed).toBe(false)
    })

    it('should toggle collapsed state from false to true', () => {
      // Setup
      const row = { collapsed: false }

      // Act
      component.hideAnfShow(row)

      // Assert
      expect(row.collapsed).toBe(true)
    })
  })

  describe('removeNode', () => {
    it('should remove a competency area and update competencies', () => {
      // Setup
      const competencyToRemove = mockTreeViewData[0]
      const emitSpy = jest.spyOn(component.addCompetencies, 'emit')

      // Act
      component.removeNode(competencyToRemove)

      // Assert
      expect(component.competencies).toEqual([])
      expect(mockMatSnackBar.open).toHaveBeenCalledWith('Competency area is removed successfully.')
      expect(mockEventsService.convertToTabularView).toHaveBeenCalledWith([])
      expect(emitSpy).toHaveBeenCalled()
    })
  })

  describe('removeTheme', () => {
    it('should remove a theme from a competency area and update competencies', () => {
      // Setup
      const competency = mockTreeViewData[0]
      const themeToRemove = competency.themes[0]
      const emitSpy = jest.spyOn(component.addCompetencies, 'emit')

      // Expected result: competency with empty themes array
      const expectedCompetencies = [
        {
          ...competency,
          themes: []
        }
      ]

      // Act
      component.removeTheme(competency, themeToRemove)

      // Assert
      expect(component.competencies).toEqual(expectedCompetencies)
      expect(mockMatSnackBar.open).toHaveBeenCalledWith('Competency theme is removed successfully.')
      expect(mockEventsService.convertToTabularView).toHaveBeenCalledWith(expectedCompetencies)
      expect(emitSpy).toHaveBeenCalled()
    })

    it('should not modify other competency areas when removing a theme', () => {
      // Setup
      // Add another competency area to test isolation
      component.competencies = [
        ...mockTreeViewData,
        {
          competencyAreaId: '2',
          competencyAreaName: 'Design',
          collapsed: true,
          themes: [
            {
              competencyThemeId: '2-1',
              competencyThemeName: 'UI Design',
              collapsed: true,
              subThems: []
            }
          ]
        }
      ]

      const competency = component.competencies[0]
      const themeToRemove = competency.themes[0]

      // Act
      component.removeTheme(competency, themeToRemove)

      // Assert
      expect(component.competencies[1]).toEqual({
        competencyAreaId: '2',
        competencyAreaName: 'Design',
        collapsed: true,
        themes: [
          {
            competencyThemeId: '2-1',
            competencyThemeName: 'UI Design',
            collapsed: true,
            subThems: []
          }
        ]
      })
    })
  })

  describe('removeSubTheme', () => {
    it('should remove a subtheme from a theme and update competencies', () => {
      // Setup
      const competency = mockTreeViewData[0]
      const theme = competency.themes[0]
      const subThemeToRemove = theme.subThems[0]
      const emitSpy = jest.spyOn(component.addCompetencies, 'emit')

      // Expected result: theme with empty subThems array
      const expectedCompetencies = [
        {
          ...competency,
          themes: [
            {
              ...theme,
              subThems: []
            }
          ]
        }
      ]

      // Act
      component.removeSubTheme(competency, theme, subThemeToRemove)

      // Assert
      expect(component.competencies).toEqual(expectedCompetencies)
      expect(mockMatSnackBar.open).toHaveBeenCalledWith('Competency sub theme is removed successfully.')
      expect(mockEventsService.convertToTabularView).toHaveBeenCalledWith(expectedCompetencies)
      expect(emitSpy).toHaveBeenCalled()
    })

    it('should not modify other themes when removing a subtheme', () => {
      // Setup
      // Add another theme to test isolation
      component.competencies = [
        {
          ...mockTreeViewData[0],
          themes: [
            mockTreeViewData[0].themes[0],
            {
              competencyThemeId: '1-2',
              competencyThemeName: 'Mobile Development',
              collapsed: true,
              subThems: [
                {
                  competencySubThemeId: '1-2-1',
                  competencySubThemeAdditionalProperties: {
                    displayName: 'Android'
                  }
                }
              ]
            }
          ]
        }
      ]

      const competency = component.competencies[0]
      const theme = competency.themes[0]
      const subThemeToRemove = theme.subThems[0]

      // Act
      component.removeSubTheme(competency, theme, subThemeToRemove)

      // Assert
      expect(component.competencies[0].themes[1].subThems).toEqual([
        {
          competencySubThemeId: '1-2-1',
          competencySubThemeAdditionalProperties: {
            displayName: 'Android'
          }
        }
      ])
    })
  })

  describe('updateCompetencies', () => {
    it('should convert tree view back to tabular and emit the result', () => {
      // Setup
      const emitSpy = jest.spyOn(component.addCompetencies, 'emit')

      // Act
      component.updateCompetencies()

      // Assert
      expect(mockEventsService.convertToTabularView).toHaveBeenCalledWith(component.competencies)
      expect(emitSpy).toHaveBeenCalledWith(mockCompetenciesList)
    })
  })

  describe('showAddCompetencyDialog', () => {
    it('should open dialog and update competencies when dialog returns result', () => {
      // Setup
      const emitSpy = jest.spyOn(component.addCompetencies, 'emit')

      // Act
      component.showAddCompetencyDialog()

      // Assert
      expect(mockDialog.open).toHaveBeenCalledWith(
        CompetencyAddComponent,
        expect.objectContaining({
          panelClass: 'dialog_sidenav',
          width: '800px',
          disableClose: true,
          data: component.competencies
        })
      )

      expect(mockEventsService.convertToTreeView).toHaveBeenCalledWith(mockCompetenciesList)
      expect(emitSpy).toHaveBeenCalledWith(mockCompetenciesList)
    })

    it('should not update competencies when dialog returns no result', () => {
      // Setup
      mockDialogRef.afterClosed = jest.fn().mockReturnValue({
        subscribe: jest.fn().mockImplementation(callback => callback(null))
      })

      const convertToTreeViewSpy = jest.spyOn(mockEventsService, 'convertToTreeView')
      const emitSpy = jest.spyOn(component.addCompetencies, 'emit')

      // Reset tracking of previous calls
      convertToTreeViewSpy.mockClear()
      emitSpy.mockClear()

      // Act
      component.showAddCompetencyDialog()

      // Assert
      expect(convertToTreeViewSpy).not.toHaveBeenCalled()
      expect(emitSpy).not.toHaveBeenCalled()
    })

    it('should not open dialog when competencies is null', () => {
      // Setup
      component.competencies = null

      // Act
      component.showAddCompetencyDialog()

      // Assert
      expect(mockDialog.open).not.toHaveBeenCalled()
    })

    it('should not open dialog when competencies is undefined', () => {
      // Setup
      component.competencies = undefined

      // Act
      component.showAddCompetencyDialog()

      // Assert
      expect(mockDialog.open).not.toHaveBeenCalled()
    })
  })

  describe('openSnackBar', () => {
    it('should open snackbar with provided message', () => {
      // Setup
      const message = 'Test message';

      // Act
      (component as any).openSnackBar(message)

      // Assert
      expect(mockMatSnackBar.open).toHaveBeenCalledWith(message)
    })
  })

  describe('ngOnInit', () => {
    it('should initialize without errors', () => {
      // Just ensure it doesn't throw errors, as the method is empty in the component
      expect(() => component.ngOnInit()).not.toThrow()
    })
  })
})