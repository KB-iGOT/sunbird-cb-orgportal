// Mock @sunbird-cb/collection to prevent pdfjs worker-loader error
jest.mock('@sunbird-cb/collection', () => ({
  NsPlaylist: { EPlaylistTypes: { PENDING: 'pending' }, EPlaylistVisibilityTypes: { PRIVATE: 'private' } },
  BtnPlaylistService: jest.fn(),
}))
jest.mock('@sunbird-cb/utils-v2', () => ({
  TFetchStatus: {},
  NsPage: {},
  ConfigurationsService: jest.fn(),
}))

import { NotificationComponent } from './notification.component'
import { of, throwError } from 'rxjs'

describe('NotificationComponent', () => {
  let component: NotificationComponent
  let playlistServiceMock: any
  let configurationsServiceMock: any

  // Mock data
  const mockPlaylists = [
    {
      id: 'playlist1',
      name: 'First Playlist',
      sharedBy: 'user1@example.com'
    },
    {
      id: 'playlist2',
      name: 'Second Playlist',
      sharedBy: 'user2@example.com'
    }
  ]

  const mockPageNavBar = {
    color: 'white',
    position: 'fixed',
  }

  beforeEach(() => {
    // Create mocks for dependencies
    playlistServiceMock = {
      getPlaylists: jest.fn()
    }

    configurationsServiceMock = {
      pageNavBar: mockPageNavBar
    }

    // Create component with mocked dependencies
    component = new NotificationComponent(
      playlistServiceMock,
      configurationsServiceMock
    )
  })

  it('should create the component', () => {
    expect(component).toBeTruthy()
  })

  describe('ngOnInit', () => {
    it('should call initiate method', () => {
      // Spy on the initiate method
      const initiateSpy = jest.spyOn(component, 'initiate').mockImplementation()

      // Call ngOnInit
      component.ngOnInit()

      // Verify initiate was called
      expect(initiateSpy).toHaveBeenCalled()
    })
  })

  describe('initiate', () => {
    it('should set initial state and call fetch methods', () => {
      // Spy on fetch methods
      const fetchPlaylistSpy = jest.spyOn(component, 'fetchSharedPlaylist').mockImplementation()
      const fetchGoalsSpy = jest.spyOn(component, 'fetchSharedGoals').mockImplementation()

      // Call initiate
      component.initiate()

      // Verify state is set correctly
      expect(component.fetchStatus).toBe('fetching')
      expect(component.statusCount).toBe(0)

      // Verify fetch methods are called
      expect(fetchPlaylistSpy).toHaveBeenCalled()
      expect(fetchGoalsSpy).toHaveBeenCalled()
    })
  })

  describe('fetchSharedPlaylist', () => {
    it('should fetch playlists and transform sharedBy data', () => {
      // Setup playlist service to return mock data
      playlistServiceMock.getPlaylists.mockReturnValue(of([...mockPlaylists]))

      // Spy on checkContentStatus
      const checkStatusSpy = jest.spyOn(component, 'checkContentStatus')

      // Call fetchSharedPlaylist
      component.fetchSharedPlaylist()

      // Verify service was called with correct type
      expect(playlistServiceMock.getPlaylists).toHaveBeenCalledWith('pending')

      // Verify sharedBy is transformed (email part removed)
      expect(component.sharedPlaylists[0].sharedBy).toBe('user1')
      expect(component.sharedPlaylists[1].sharedBy).toBe('user2')

      // Verify checkContentStatus was called
      expect(checkStatusSpy).toHaveBeenCalled()
    })

    it('should handle error when fetching playlists fails', () => {
      // Setup playlist service to throw error
      playlistServiceMock.getPlaylists.mockReturnValue(throwError('Error fetching playlists'))

      // Spy on checkContentStatus
      const checkStatusSpy = jest.spyOn(component, 'checkContentStatus')

      // Call fetchSharedPlaylist
      component.fetchSharedPlaylist()

      // Verify checkContentStatus was called despite error
      expect(checkStatusSpy).toHaveBeenCalled()

      // Verify sharedPlaylists is empty (unchanged)
      expect(component.sharedPlaylists).toEqual([])
    })
  })

  describe('fetchSharedGoals', () => {
    // This method is currently commented out in the component code
    // But we can still test that it's properly structured
    it('should be defined', () => {
      expect(component.fetchSharedGoals).toBeDefined()

      // Call it to ensure it doesn't throw any errors
      component.fetchSharedGoals()
    })
  })

  describe('checkContentStatus', () => {
    it('should increment statusCount and set fetchStatus to done', () => {
      // Setup
      component.statusCount = 1

      // Call checkContentStatus
      component.checkContentStatus()

      // Verify statusCount is incremented
      expect(component.statusCount).toBe(2)

      // Verify fetchStatus is set to done
      expect(component.fetchStatus).toBe('done')
    })

    it('should set fetchStatus to none when all conditions are met', () => {
      // Setup conditions for "none" status
      component.statusCount = 2
      component.recentBadge = null
      component.sharedPlaylists = []

      // Call checkContentStatus
      component.checkContentStatus()

      // Verify statusCount is incremented to 3
      expect(component.statusCount).toBe(3)

      // Verify fetchStatus is set to none
      expect(component.fetchStatus).toBe('none')
    })

    it('should not set fetchStatus to none when not all conditions are met', () => {
      // Setup - recentBadge is set, so condition is NOT fully met
      component.statusCount = 2
      component.recentBadge = { id: 'badge1' } as any

      // Call checkContentStatus
      component.checkContentStatus()

      // Verify statusCount is incremented
      expect(component.statusCount).toBe(3)

      // Verify fetchStatus is still done, not none (recentBadge is not null)
      expect(component.fetchStatus).toBe('done')
    })
  })


  describe('integration tests', () => {
    it('should properly handle the complete flow with data', () => {
      // Setup
      playlistServiceMock.getPlaylists.mockReturnValue(of([...mockPlaylists]))

      // Initialize component
      component.ngOnInit()

      // Verify final state
      expect(component.fetchStatus).toBe('done')
      expect(component.sharedPlaylists.length).toBe(2)
      expect(component.sharedPlaylists[0].sharedBy).toBe('user1')
    })

    it('should handle the complete flow with no data', () => {
      // Setup
      playlistServiceMock.getPlaylists.mockReturnValue(of([]))

      // Initialize component
      component.ngOnInit()

      // fetchSharedGoals is commented out so statusCount only reaches 1 (not 3)
      // fetchStatus stays 'done' because statusCount !== 3
      expect(component.fetchStatus).toBe('done')
      expect(component.sharedPlaylists.length).toBe(0)
    })

    it('should handle errors in the complete flow', () => {
      // Setup
      playlistServiceMock.getPlaylists.mockReturnValue(throwError('Error'))

      // Initialize component
      component.ngOnInit()

      // fetchSharedGoals is commented out so statusCount only reaches 1 (not 3)
      // fetchStatus stays 'done'
      expect(component.fetchStatus).toBe('done')
      expect(component.sharedPlaylists.length).toBe(0)
    })
  })
})