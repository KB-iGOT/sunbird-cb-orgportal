// Mock @sunbird-cb/collection before any imports to prevent pdfjs worker-loader error
jest.mock('@sunbird-cb/collection', () => ({
  WidgetContentService: jest.fn(),
  BtnPlaylistService: jest.fn(),
  NsContent: { EMimeTypes: {} },
  NsPlaylist: { EPlaylistTypes: { PENDING: 'pending' }, EPlaylistVisibilityTypes: { PRIVATE: 'private' } },
}))
jest.mock('@sunbird-cb/utils-v2', () => ({
  ConfigurationsService: jest.fn(),
  TFetchStatus: {},
  NsPage: {},
}))

import { InterestComponent } from './interest.component'
import { of, throwError } from 'rxjs'
// import { ActivatedRoute, Router } from '@angular/router'
// import { WidgetContentService, BtnPlaylistService } from '@sunbird-cb/collection'
// import { ConfigurationsService } from '@sunbird-cb/utils'
// import { MatSnackBar } from '@angular/material/snack-bar'
import { ElementRef } from '@angular/core'

describe('InterestComponent', () => {
  let component: InterestComponent
  let mockActivatedRoute: any
  let mockContentSvc: any
  let mockPlaylistSvc: any
  let mockConfigSvc: any
  let mockRouter: any
  let mockSnackbar: any
  let mockElementRef: any

  beforeEach(() => {
    // Mock services
    mockActivatedRoute = {
      data: of({
        pageData: {
          data: {
            'Technology': ['tech1', 'tech2'],
            'Art': ['art1', 'art2'],
          },
        },
      }),
    }

    mockContentSvc = {
      fetchMultipleContent: jest.fn(),
    }

    mockPlaylistSvc = {
      getAllPlaylists: jest.fn(),
      addPlaylistContent: jest.fn(),
      deletePlaylistContent: jest.fn(),
      upsertPlaylist: jest.fn(),
    }

    mockConfigSvc = {
      pageNavBar: { color: 'primary' },
    }

    mockRouter = {
      navigate: jest.fn(),
    }

    mockSnackbar = {
      open: jest.fn(),
    }

    mockElementRef = {
      nativeElement: {
        value: 'Test message',
      },
    }

    // Create component with mocked dependencies
    component = new InterestComponent(
      mockActivatedRoute,
      mockContentSvc,
      mockPlaylistSvc,
      mockConfigSvc,
      mockRouter,
      mockSnackbar
    )

    // Mock ViewChild elements
    component['createPlaylistSuccessMessage'] = mockElementRef as ElementRef
    component['createPlaylistErrorMessage'] = mockElementRef as ElementRef

    // Setup default behavior for mocks
    mockContentSvc.fetchMultipleContent.mockReturnValue(of([{ identifier: 'content1' }]))
    mockPlaylistSvc.getAllPlaylists.mockReturnValue(of([]))
    mockPlaylistSvc.addPlaylistContent.mockReturnValue(of({}))
    mockPlaylistSvc.deletePlaylistContent.mockReturnValue(of({}))
    mockPlaylistSvc.upsertPlaylist.mockReturnValue(of({}))
  })

  describe('initialization', () => {
    it('should initialize component with interest data from route', () => {
      // Call ngOnInit
      component.ngOnInit()

      // Verify interest data was extracted
      expect(component.interestsData).toEqual(['Technology', 'Art'])
      expect(component.interestRES).toEqual({
        'Technology': ['tech1', 'tech2'],
        'Art': ['art1', 'art2'],
      })
    })

    it('should set up existing playlist if it exists', () => {
      // Mock the playlist service to return an existing playlist
      mockPlaylistSvc.getAllPlaylists.mockReturnValue(
        of([
          {
            name: 'Learn Later',
            contents: [{ identifier: 'tech1' }, { identifier: 'art1' }],
          },
        ])
      )

      // Call ngOnInit
      component.ngOnInit()

      // Verify the playlist was set up
      expect(component.playlistForInterest).not.toBeNull()
      expect(component.addedInterest.has('tech1')).toBeTruthy()
      expect(component.addedInterest.has('art1')).toBeTruthy()
      expect(component.alreadyAddedInterest.has('tech1')).toBeTruthy()
      expect(component.alreadyAddedInterest.has('art1')).toBeTruthy()
    })
  })

  describe('selectInterest', () => {
    beforeEach(() => {
      component.ngOnInit()
    })

    it('should fetch content for the selected interest', () => {
      // Set up the mock to return content
      mockContentSvc.fetchMultipleContent.mockReturnValue(
        of([{ identifier: 'tech1', name: 'Technology 1' }])
      )

      // Call selectInterest with an index
      component.selectInterest(0)

      // Verify the selected interest and content fetch
      expect(component.selectedContent).toBe(0)
      expect(component.selectedInterest).toBe('Technology')
      expect(component.fetchStatus).toBe('done')
      expect(component.interestContent).toEqual([{ identifier: 'tech1', name: 'Technology 1' }])
      expect(mockContentSvc.fetchMultipleContent).toHaveBeenCalledWith(['tech1', 'tech2'])
    })

    // it('should not fetch content if already fetching', () => {

    //   component.fetchStatus = 'fetching'


    //   component.selectInterest(1)

    //   expect(mockContentSvc.fetchMultipleContent).not.toHaveBeenCalled()
    //   expect(component.selectedContent).not.toBe(1)
    // })



    it('should handle error during content fetch', () => {
      // Set up the mock to throw an error
      mockContentSvc.fetchMultipleContent.mockReturnValue(throwError('Error fetching content'))

      // Call selectInterest
      component.selectInterest(0)

      // Verify error state
      expect(component.fetchStatus).toBe('error')
    })
  })

  describe('interestAdd', () => {
    beforeEach(() => {
      component.ngOnInit()
    })

    it('should add interest when checked is true', () => {
      // Add an interest
      component.interestAdd('tech1', true)

      // Verify interest was added to the set
      expect(component.addedInterest.has('tech1')).toBeTruthy()
    })

    it('should remove interest when checked is false', () => {
      // First add the interest
      component.addedInterest.add('tech1')

      // Now remove it
      component.interestAdd('tech1', false)

      // Verify interest was removed from the set
      expect(component.addedInterest.has('tech1')).toBeFalsy()
    })
  })

  describe('isInterestAdded', () => {
    beforeEach(() => {
      component.ngOnInit()
      component.interestRES = {
        'Technology': ['tech1', 'tech2'],
        'Art': ['art1', 'art2'],
      }
    })

    it('should return true if any identifier of the interest is in addedInterest', () => {
      // Add tech1 to addedInterest
      component.addedInterest.add('tech1')

      // Check if Technology interest is added
      const result = component.isInterestAdded('Technology')

      // Verify result
      expect(result).toBeTruthy()
    })

    it('should return false if no identifier of the interest is in addedInterest', () => {
      // Check if Art interest is added (when nothing is added yet)
      const result = component.isInterestAdded('Art')

      // Verify result
      expect(result).toBeFalsy()
    })
  })

  describe('addInterest', () => {
    beforeEach(() => {
      component.ngOnInit()
      component.interestRES = {
        'Technology': ['tech1', 'tech2'],
        'Art': ['art1', 'art2'],
      }
    })

    it('should create a new playlist when none exists', () => {
      // Add an interest
      component.addedInterest.add('tech1')

      // Call addInterest
      component.addInterest()

      // Verify upsertPlaylist was called
      expect(mockPlaylistSvc.upsertPlaylist).toHaveBeenCalledWith({
        playlist_title: 'Learn Later',
        content_ids: ['tech1'],
        visibility: 'private',
      })

      // Verify navigation after successful playlist creation
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/setup/home/done'])
      expect(mockSnackbar.open).toHaveBeenCalledWith('Test message')
    })

    // it('should update existing playlist when one exists', () => {
    //   // Setup existing playlist
    //   component.playlistForInterest = {
    //     name: 'Learn Later',
    //     contents: [{ identifier: 'art1' }],
    //   }

    //   // Set up already added and newly added interests
    //   component.alreadyAddedInterest = new Set(['art1'])
    //   component.addedInterest = new Set(['art1', 'tech1'])

    //   // Call addInterest
    //   component.addInterest()

    //   // Verify add playlist content was called with the new content
    //   expect(mockPlaylistSvc.addPlaylistContent).toHaveBeenCalledWith(
    //     component.playlistForInterest,
    //     ['tech1']
    //   )

    //   // Verify navigation after successful update
    //   expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/setup/home/done'])
    // })

    // it('should remove content from playlist when deselected', () => {
    //   // Setup existing playlist
    //   component.playlistForInterest = {
    //     name: 'Learn Later',
    //     contents: [{ identifier: 'art1' }, { identifier: 'tech1' }],
    //   }

    //   // Set up already added and newly removed interests
    //   component.alreadyAddedInterest = new Set(['art1', 'tech1'])
    //   component.addedInterest = new Set(['art1'])  // tech1 was removed

    //   // Call addInterest
    //   component.addInterest()

    //   // Verify delete playlist content was called with the removed content
    //   expect(mockPlaylistSvc.deletePlaylistContent).toHaveBeenCalledWith(
    //     component.playlistForInterest,
    //     ['tech1']
    //   )
    // })

    // it('should handle playlist update error', () => {
    //   // Setup existing playlist
    //   component.playlistForInterest = {
    //     name: 'Learn Later',
    //     contents: [],
    //     createdOn: '',
    //     duration: 10,
    //     editType: {},



    //   }

    //   // Add an interest
    //   component.addedInterest.add('tech1')

    //   // Mock an error on add
    //   mockPlaylistSvc.addPlaylistContent.mockReturnValue(throwError('Error updating playlist'))

    //   // Call addInterest
    //   component.addInterest()

    //   // Verify error handling
    //   expect(mockSnackbar.open).toHaveBeenCalledWith('Test message')
    //   expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/setup/home/done'])
    // })

    it('should navigate to done when no interests are selected', () => {
      // Call addInterest with empty addedInterest
      component.addInterest()

      // Verify direct navigation
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/setup/home/done'])
      expect(mockPlaylistSvc.upsertPlaylist).not.toHaveBeenCalled()
    })
  })
})