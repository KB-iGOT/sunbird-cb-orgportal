import { CommunityCompetencyComponent } from './community-competency.component'
import { MatLegacyDialog } from '@angular/material/legacy-dialog'
import { MatLegacySnackBar } from '@angular/material/legacy-snack-bar'
import { EventsService } from '../../../events-2/services/events.service'
import { CompetencyAddComponent } from '../../../../../../common/competency-add/competency-add.component'
import { SimpleChange } from '@angular/core'
import { of } from 'rxjs'

describe('CommunityCompetencyComponent', () => {
  let component: CommunityCompetencyComponent
  let mockMatSnackBar: jest.Mocked<MatLegacySnackBar>
  let mockMatDialog: jest.Mocked<MatLegacyDialog>
  let mockEventsService: jest.Mocked<EventsService>

  // Sample test data
  const mockCompetenciesList = [
    {
      competencyAreaId: 'area1',
      competencyAreaName: 'Area 1',
      themes: [
        {
          competencyThemeId: 'theme1',
          competencyThemeName: 'Theme 1',
          subThems: [
            {
              competencySubThemeId: 'subtheme1',
              competencySubThemeAdditionalProperties: {
                displayName: 'Sub Theme 1'
              }
            }
          ]
        }
      ]
    }
  ]

  const mockTreeView = [
    {
      competencyAreaId: 'area1',
      competencyAreaName: 'Area 1',
      collapsed: true,
      themes: [
        {
          competencyThemeId: 'theme1',
          competencyThemeName: 'Theme 1',
          collapsed: true,
          subThems: [
            {
              competencySubThemeId: 'subtheme1',
              competencySubThemeAdditionalProperties: {
                displayName: 'Sub Theme 1'
              }
            }
          ]
        }
      ]
    }
  ]

  beforeEach(() => {
    // Create mocks for dependencies
    mockMatSnackBar = {
      open: jest.fn()
    } as any

    mockMatDialog = {
      open: jest.fn()
    } as any

    mockEventsService = {
      convertToTreeView: jest.fn(),
      convertToTabularView: jest.fn()
    } as any

    // Set up default mock behavior
    mockEventsService.convertToTreeView.mockReturnValue(mockTreeView)
    mockEventsService.convertToTabularView.mockReturnValue(mockCompetenciesList)

    // Create component instance with mocked dependencies
    component = new CommunityCompetencyComponent(
      mockMatSnackBar,
      mockMatDialog,
      mockEventsService
    )
  })

  test('should initialize with default values', () => {
    expect(component.openMode).toBe('edit')
    expect(component.competenciesList).toEqual([])
    expect(component.searchText).toBe('')
  })

  test('ngOnChanges should convert competenciesList to tree view', () => {
    // Set up component with initial data
    component.competenciesList = mockCompetenciesList

    // Create a mock SimpleChanges object
    const changes = {
      competenciesList: new SimpleChange(null, mockCompetenciesList, true)
    }

    // Call ngOnChanges
    component.ngOnChanges(changes)

    // Verify that the service was called and the component's data was updated
    expect(mockEventsService.convertToTreeView).toHaveBeenCalledWith(mockCompetenciesList)
    expect(component.competencies).toEqual(mockTreeView)
  })

  test('hideAndShow should toggle collapsed state of a row', () => {
    // Setup
    component.competencies = [...mockTreeView]
    const testRow = { collapsed: true }

    // Execute
    component.hideAnfShow(testRow)

    // Verify
    expect(testRow.collapsed).toBe(false)

    // Execute again
    component.hideAnfShow(testRow)

    // Verify toggle
    expect(testRow.collapsed).toBe(true)
  })

  test('removeNode should remove competency area and update', () => {
    // Setup
    component.competencies = [...mockTreeView]
    const competencyToRemove = mockTreeView[0]

    // Spy on the updateCompetencies method
    const updateSpy = jest.spyOn(component, 'updateCompetencies')

    // Execute
    component.removeNode(competencyToRemove)

    // Verify
    expect(component.competencies).toEqual([])
    expect(mockMatSnackBar.open).toHaveBeenCalledWith('Competency area is removed successfully.')
    expect(updateSpy).toHaveBeenCalled()
  })

  test('removeTheme should remove theme from competency area and update', () => {
    // Setup
    component.competencies = [
      {
        ...mockTreeView[0],
        themes: [...mockTreeView[0].themes]
      }
    ]
    const competency = component.competencies[0]
    const themeToRemove = competency.themes[0]

    // Spy on the updateCompetencies method
    const updateSpy = jest.spyOn(component, 'updateCompetencies')

    // Execute
    component.removeTheme(competency, themeToRemove)

    // Verify
    expect(component.competencies[0].themes).toEqual([])
    expect(mockMatSnackBar.open).toHaveBeenCalledWith('Competency theme is removed successfully.')
    expect(updateSpy).toHaveBeenCalled()
  })

  test('removeSubTheme should remove subtheme from theme and update', () => {
    // Setup
    component.competencies = JSON.parse(JSON.stringify(mockTreeView)) // Deep clone
    const competency = component.competencies[0]
    const theme = competency.themes[0]
    const subThemeToRemove = theme.subThems[0]

    // Spy on the updateCompetencies method
    const updateSpy = jest.spyOn(component, 'updateCompetencies')

    // Execute
    component.removeSubTheme(competency, theme, subThemeToRemove)

    // Verify
    expect(component.competencies[0].themes[0].subThems).toEqual([])
    expect(mockMatSnackBar.open).toHaveBeenCalledWith('Competency sub theme is removed successfully.')
    expect(updateSpy).toHaveBeenCalled()
  })

  test('updateCompetencies should emit converted competencies', () => {
    // Setup
    component.competencies = [...mockTreeView]
    const emitSpy = jest.spyOn(component.addCompetencies, 'emit')

    // Execute
    component.updateCompetencies()

    // Verify
    expect(mockEventsService.convertToTabularView).toHaveBeenCalledWith(component.competencies)
    expect(emitSpy).toHaveBeenCalledWith(mockCompetenciesList)
  })

  test('showAddCompetencyDialog should open dialog and handle result', () => {
    // Setup
    component.competencies = [...mockTreeView]
    const mockDialogRef = {
      afterClosed: jest.fn().mockReturnValue(of(mockCompetenciesList))
    }
    mockMatDialog.open.mockReturnValue(mockDialogRef as any)

    const emitSpy = jest.spyOn(component.addCompetencies, 'emit')

    // Execute
    component.showAddCompetencyDialog()

    // Verify dialog was opened with correct params
    expect(mockMatDialog.open).toHaveBeenCalledWith(
      CompetencyAddComponent,
      {
        panelClass: 'dialog_sidenav',
        width: '800px',
        disableClose: true,
        data: component.competencies
      }
    )

    // Verify result handling
    expect(mockEventsService.convertToTreeView).toHaveBeenCalledWith(mockCompetenciesList)
    expect(emitSpy).toHaveBeenCalledWith(mockCompetenciesList)
  })

  test('showAddCompetencyDialog should not update if no result', () => {
    // Setup
    component.competencies = [...mockTreeView]
    const mockDialogRef = {
      afterClosed: jest.fn().mockReturnValue(of(null))
    }
    mockMatDialog.open.mockReturnValue(mockDialogRef as any)

    const emitSpy = jest.spyOn(component.addCompetencies, 'emit')

    // Execute
    component.showAddCompetencyDialog()

    // Verify
    expect(emitSpy).not.toHaveBeenCalled()
    // The second call would have been for the dialog result, which doesn't happen
    expect(mockEventsService.convertToTreeView).toHaveBeenCalledTimes(0)
  })

  test('openSnackBar should call snackBar.open with message', () => {
    // Setup
    const testMessage = 'Test message';

    // Execute - Call the private method using type assertion
    (component as any).openSnackBar(testMessage)

    // Verify
    expect(mockMatSnackBar.open).toHaveBeenCalledWith(testMessage)
  })

  test('should handle ngOnChanges when competenciesList is not changed', () => {
    // Setup - changes without competenciesList
    const changes = {
      otherProperty: new SimpleChange(null, 'something', true)
    }

    // Set initial state
    component.competencies = 'initial value' as any

    // Execute
    component.ngOnChanges(changes as any)

    // Verify that nothing changed
    expect(component.competencies).toEqual('initial value')
    expect(mockEventsService.convertToTreeView).not.toHaveBeenCalled()
  })

  test('should handle empty competencies list properly', () => {
    // Setup
    mockEventsService.convertToTreeView.mockReturnValue([])
    component.competenciesList = []

    // Create a mock SimpleChanges object
    const changes = {
      competenciesList: new SimpleChange(null, [], true)
    }

    // Call ngOnChanges
    component.ngOnChanges(changes)

    // Verify
    expect(component.competencies).toEqual([])
  })

  test('removeNode should handle case when node is not found', () => {
    // Setup
    component.competencies = [...mockTreeView]
    const nonExistentCompetency = {
      competencyAreaName: 'Non-existent Area'
    }

    // Spy on the updateCompetencies method
    const updateSpy = jest.spyOn(component, 'updateCompetencies')

    // Execute
    component.removeNode(nonExistentCompetency)

    // Verify that original competencies are unchanged
    expect(component.competencies).toEqual(mockTreeView)
    expect(mockMatSnackBar.open).toHaveBeenCalledWith('Competency area is removed successfully.')
    expect(updateSpy).toHaveBeenCalled()
  })
})