import { CommunityManageComponent } from './community-manage.component'
import { of, throwError } from 'rxjs'

describe('CommunityManageComponent', () => {
  let component: CommunityManageComponent
  let mockDialog: any
  let mockCommunityService: any
  let mockActivatedRoute: any
  let mockSnackBar: any
  let mockRouter: any

  beforeEach(() => {
    // Mock dependencies
    mockDialog = {
      open: jest.fn().mockReturnValue({
        afterClosed: jest.fn().mockReturnValue(of(true))
      })
    }

    mockCommunityService = {
      getAllReportedDiscussion: jest.fn().mockReturnValue(of({
        result: {
          search_results: {
            data: [{ id: 1, description: 'test discussion' }],
            totalCount: 1
          }
        }
      })),
      getHiddenDiscussions: jest.fn().mockReturnValue(of({
        result: {
          search_results: {
            data: [{ id: 2, description: 'hidden discussion' }],
            totalCount: 1
          }
        }
      })),
      displayReportedPost: jest.fn().mockReturnValue(of({ success: true })),
      hideReportedPost: jest.fn().mockReturnValue(of({ success: true })),
      getReportedIssuesStats: jest.fn().mockReturnValue(of({
        result: {
          reportReasons: {
            'spam': { percentage: 60, count: 3 },
            'inappropriate': { percentage: 40, count: 2 }
          }
        }
      }))
    }

    mockActivatedRoute = {
      params: of({ communityId: 'test-community-id' })
    }

    mockSnackBar = {
      open: jest.fn()
    }

    mockRouter = {
      navigate: jest.fn()
    }

    // Create component instance
    component = new CommunityManageComponent(
      mockDialog,
      mockCommunityService,
      mockActivatedRoute,
      mockSnackBar,
      mockRouter
    )
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('Constructor and Initialization', () => {
    it('should create component', () => {
      expect(component).toBeTruthy()
    })

    it('should initialize with default values', () => {
      expect(component.selectedTabIndex).toBe(0)
      expect(component.pageNumber).toBe(0)
      expect(component.allDisussionObjCount).toBe(0)
      expect(component.hiddenDisussionObjCount).toBe(0)
      expect(component.viewMoreLength).toBe(410)
      expect(component.getAllItemsCount).toBe(0)
      expect(component.getPostItemsCount).toBe(0)
      expect(component.getCommentItemsCount).toBe(0)
      expect(component.getReplyItemsCount).toBe(0)
      expect(component.activeFilter).toBe('all')
      expect(component.totalDiscussionsCount).toBe(0)
      expect(component.visibleCardCount).toBe(5)
      expect(component.currentStatus).toBe('active')
    })

    it('should set communityId from route params', () => {
      expect(component.communityId).toBe('test-community-id')
    })

    it('should initialize tabs array correctly', () => {
      expect(component.tabs).toEqual([
        { label: 'Pending', status: 'pending', icon: '' },
        { label: 'Hidden', status: 'hidden', icon: '' }
      ])
    })
  })

  describe('ngOnInit', () => {
    it('should call all initialization methods', () => {
      jest.spyOn(component, 'getReportedDiscussionItems')
      jest.spyOn(component, 'getHiddenDiscussionItems')
      jest.spyOn(component, 'getPostFilterItems')
      jest.spyOn(component, 'getCommentFilterItems')
      jest.spyOn(component, 'getReplyFilterItems')

      component.ngOnInit()

      expect(component.getReportedDiscussionItems).toHaveBeenCalled()
      expect(component.getHiddenDiscussionItems).toHaveBeenCalled()
      expect(component.getPostFilterItems).toHaveBeenCalled()
      expect(component.getCommentFilterItems).toHaveBeenCalled()
      expect(component.getReplyFilterItems).toHaveBeenCalled()
    })
  })

  describe('onTabChange', () => {
    it('should update selectedTabIndex, currentStatus and reset pageNumber', () => {
      const event = { index: 1 }

      component.onTabChange(event)

      expect(component.selectedTabIndex).toBe(1)
      expect(component.currentStatus).toBe('hidden')
      expect(component.pageNumber).toBe(0)
    })
  })

  describe('showMoreCards', () => {
    it('should increase visibleCardCount by 5', () => {
      const initialCount = component.visibleCardCount

      component.showMoreCards()

      expect(component.visibleCardCount).toBe(initialCount + 5)
    })
  })

  describe('openReportDialog', () => {
    it('should open dialog with report issues data', () => {
      const discussionId = 'test-discussion-id'
      jest.spyOn(component, 'getReportedIssueList').mockReturnValue(of([
        { reason: 'spam', percentage: 60, count: 3 }
      ]))

      component.openReportDialog(discussionId)

      expect(component.getReportedIssueList).toHaveBeenCalledWith(discussionId)
      expect(mockDialog.open).toHaveBeenCalled()
    })

    it('should handle dialog close with result', () => {
      const discussionId = 'test-discussion-id'
      const mockDialogRef = {
        afterClosed: jest.fn().mockReturnValue(of(true))
      }
      mockDialog.open.mockReturnValue(mockDialogRef)
      jest.spyOn(component, 'getReportedIssueList').mockReturnValue(of([
        { reason: 'spam', percentage: 60, count: 3 }
      ]))

      component.openReportDialog(discussionId)

      expect(mockDialogRef.afterClosed).toHaveBeenCalled()
    })
  })

  describe('openDialog', () => {
    it('should open confirm dialog for showPlatform', () => {
      const discussionId = 'test-id'
      const itemType = 'question'

      component.openDialog('showPlatform', discussionId, itemType)

      expect(mockDialog.open).toHaveBeenCalled()
      const dialogConfig = mockDialog.open.mock.calls[0][1]
      expect(dialogConfig.data.body).toContain('show this on the platform')
    })

    it('should open confirm dialog for hideContent', () => {
      const discussionId = 'test-id'
      const itemType = 'question'

      component.openDialog('hideContent', discussionId, itemType)

      expect(mockDialog.open).toHaveBeenCalled()
      const dialogConfig = mockDialog.open.mock.calls[0][1]
      expect(dialogConfig.data.body).toContain('keep this hidden from the platform')
    })

    it('should call showOnPlatform when confirmed for showPlatform', () => {
      jest.spyOn(component, 'showOnPlatform')
      const discussionId = 'test-id'
      const itemType = 'question'

      component.openDialog('showPlatform', discussionId, itemType)

      expect(component.showOnPlatform).toHaveBeenCalledWith(discussionId, itemType)
    })

    it('should call hideContent when confirmed for hideContent', () => {
      jest.spyOn(component, 'hideContent')
      const discussionId = 'test-id'
      const itemType = 'question'

      component.openDialog('hideContent', discussionId, itemType)

      expect(component.hideContent).toHaveBeenCalledWith(discussionId, itemType)
    })
  })

  describe('viewMoreOrLess', () => {
    it('should toggle expanded when description length exceeds viewMoreLength', () => {
      const item = {
        description: 'a'.repeat(500),
        expanded: false
      }

      component.viewMoreOrLess(item)

      expect(item.expanded).toBe(true)
    })

    it('should not toggle expanded when description length is within limit', () => {
      const item = {
        description: 'short description',
        expanded: false
      }

      component.viewMoreOrLess(item)

      expect(item.expanded).toBe(false)
    })
  })

  describe('getEditorTextLength', () => {
    it('should return correct length after cleaning HTML and spaces', () => {
      const content = '<p>Hello &nbsp; <b>World</b></p>   '

      const length = component.getEditorTextLength(content)

      expect(length).toBe(11) // "Hello World"
    })

    it('should handle empty content', () => {
      const length = component.getEditorTextLength('')
      expect(length).toBe(0)
    })

    it('should handle content with only HTML tags', () => {
      const content = '<p></p><div></div>'
      const length = component.getEditorTextLength(content)
      expect(length).toBe(0)
    })
  })

  describe('navigateBack', () => {
    it('should navigate to community home', () => {
      component.navigateBack()

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/home/community'])
    })
  })

  describe('getReportedDiscussionItems', () => {
    it('should fetch and set reported discussion items successfully', () => {
      component.getReportedDiscussionItems()

      expect(mockCommunityService.getAllReportedDiscussion).toHaveBeenCalledWith({
        filterCriteriaMap: {
          status: ['reported'],
          communityId: component.communityId,
          type: ['question', 'answerPost', 'answerPostReply']
        },
        requestedFields: [],
        pageNumber: 0,
        pageSize: 10,
        orderBy: 'recentReportedOn',
        orderDirection: 'DESC',
        facets: ['type']
      })

      expect(component.allDisussionObj).toEqual([{ id: 1, description: 'test discussion' }])
      expect(component.allDisussionObjCount).toBe(1)
    })

    it('should handle empty response', () => {
      mockCommunityService.getAllReportedDiscussion.mockReturnValue(of({
        result: { search_results: { data: [] } }
      }))

      component.getReportedDiscussionItems()

      expect(component.allDisussionObj).toEqual([])
      expect(component.allDisussionObjCount).toBe(0)
    })
  })

  describe('getPostFilterItems', () => {
    it('should fetch and set post filter items successfully', () => {
      component.getPostFilterItems()

      expect(mockCommunityService.getAllReportedDiscussion).toHaveBeenCalledWith({
        filterCriteriaMap: {
          status: ['reported'],
          communityId: component.communityId,
          type: ['question']
        },
        requestedFields: [],
        pageNumber: 0,
        pageSize: 10,
        orderBy: 'recentReportedOn',
        orderDirection: 'DESC',
        facets: ['type']
      })

      expect(component.getPostItems).toEqual([{ id: 1, description: 'test discussion' }])
      expect(component.getPostItemsCount).toBe(1)
    })

    it('should handle empty response', () => {
      mockCommunityService.getAllReportedDiscussion.mockReturnValue(of({
        result: { search_results: { data: [] } }
      }))

      component.getPostFilterItems()

      expect(component.getPostItems).toEqual([])
      expect(component.getPostItemsCount).toBe(0)
    })
  })

  describe('getCommentFilterItems', () => {
    it('should fetch and set comment filter items successfully', () => {
      component.getCommentFilterItems()

      expect(mockCommunityService.getAllReportedDiscussion).toHaveBeenCalledWith({
        filterCriteriaMap: {
          status: ['reported'],
          communityId: component.communityId,
          type: ['answerPost']
        },
        requestedFields: [],
        pageNumber: 0,
        pageSize: 10,
        orderBy: 'recentReportedOn',
        orderDirection: 'DESC',
        facets: ['type']
      })

      expect(component.getCommentItems).toEqual([{ id: 1, description: 'test discussion' }])
      expect(component.getCommentItemsCount).toBe(1)
    })

    it('should handle empty response', () => {
      mockCommunityService.getAllReportedDiscussion.mockReturnValue(of({
        result: { search_results: { data: [] } }
      }))

      component.getCommentFilterItems()

      expect(component.getCommentItems).toEqual([])
      expect(component.getCommentItemsCount).toBe(0)
    })
  })

  describe('getReplyFilterItems', () => {
    it('should fetch and set reply filter items successfully', () => {
      component.getReplyFilterItems()

      expect(mockCommunityService.getAllReportedDiscussion).toHaveBeenCalledWith({
        filterCriteriaMap: {
          status: ['reported'],
          communityId: component.communityId,
          type: ['answerPostReply']
        },
        requestedFields: [],
        pageNumber: 0,
        pageSize: 10,
        orderBy: 'recentReportedOn',
        orderDirection: 'DESC',
        facets: ['type']
      })

      expect(component.getReplyItems).toEqual([{ id: 1, description: 'test discussion' }])
      expect(component.getReplyItemsCount).toBe(1)
    })

    it('should handle empty response', () => {
      mockCommunityService.getAllReportedDiscussion.mockReturnValue(of({
        result: { search_results: { data: [] } }
      }))

      component.getReplyFilterItems()

      expect(component.getReplyItems).toEqual([])
      expect(component.getReplyItemsCount).toBe(0)
    })
  })

  describe('getHiddenDiscussionItems', () => {
    it('should fetch and set hidden discussion items successfully', () => {
      component.getHiddenDiscussionItems()

      expect(mockCommunityService.getHiddenDiscussions).toHaveBeenCalledWith({
        filterCriteriaMap: {
          type: ['question', 'answerPost', 'answerPostReply'],
          status: ['suspended'],
          communityId: component.communityId
        },
        requestedFields: [],
        pageNumber: 0,
        pageSize: 10,
        orderBy: 'recentReportedOn',
        orderDirection: 'DESC',
        facets: ['type']
      })

      expect(component.hiddenDisussionObj).toEqual([{ id: 2, description: 'hidden discussion' }])
      expect(component.hiddenDisussionObjCount).toBe(1)
    })

    it('should handle empty response', () => {
      mockCommunityService.getHiddenDiscussions.mockReturnValue(of({
        result: { search_results: { data: [] } }
      }))

      component.getHiddenDiscussionItems()

      expect(component.hiddenDisussionObj).toEqual([])
      expect(component.hiddenDisussionObjCount).toBe(0)
    })
  })

  describe('showOnPlatform', () => {
    it('should display reported post successfully', () => {
      jest.spyOn(component, 'getReportedDiscussionItems')
      jest.spyOn(component, 'getHiddenDiscussionItems')
      jest.spyOn(component, 'getPostFilterItems')
      jest.spyOn(component, 'getCommentFilterItems')
      jest.spyOn(component, 'getReplyFilterItems')

      component.showOnPlatform('test-id', 'question')

      expect(mockCommunityService.displayReportedPost).toHaveBeenCalledWith({
        discussionId: 'test-id',
        type: 'question'
      })

      expect(mockSnackBar.open).toHaveBeenCalledWith(
        'Post has been published on platform successfully!',
        'Close',
        { duration: 3000 }
      )

      expect(component.getReportedDiscussionItems).toHaveBeenCalled()
      expect(component.getHiddenDiscussionItems).toHaveBeenCalled()
      expect(component.getPostFilterItems).toHaveBeenCalled()
      expect(component.getCommentFilterItems).toHaveBeenCalled()
      expect(component.getReplyFilterItems).toHaveBeenCalled()
    })

    it('should handle error when displaying reported post', () => {
      mockCommunityService.displayReportedPost.mockReturnValue(throwError('Error'))

      component.showOnPlatform('test-id', 'question')

      expect(mockSnackBar.open).toHaveBeenCalledWith('Error', 'Close', { duration: 3000 })
    })
  })

  describe('hideContent', () => {
    it('should hide reported post successfully', () => {
      jest.spyOn(component, 'getReportedDiscussionItems')
      jest.spyOn(component, 'getHiddenDiscussionItems')
      jest.spyOn(component, 'getPostFilterItems')
      jest.spyOn(component, 'getCommentFilterItems')
      jest.spyOn(component, 'getReplyFilterItems')

      component.hideContent('test-id', 'question')

      expect(mockCommunityService.hideReportedPost).toHaveBeenCalledWith({
        discussionId: 'test-id',
        type: 'question'
      })

      expect(mockSnackBar.open).toHaveBeenCalledWith(
        'Post has been hidden from platform successfully!',
        'Close',
        { duration: 3000 }
      )

      expect(component.getReportedDiscussionItems).toHaveBeenCalled()
      expect(component.getHiddenDiscussionItems).toHaveBeenCalled()
      expect(component.getPostFilterItems).toHaveBeenCalled()
      expect(component.getCommentFilterItems).toHaveBeenCalled()
      expect(component.getReplyFilterItems).toHaveBeenCalled()
    })

    it('should handle error when hiding reported post', () => {
      mockCommunityService.hideReportedPost.mockReturnValue(throwError('Error'))

      component.hideContent('test-id', 'question')

      expect(mockSnackBar.open).toHaveBeenCalledWith('Error', 'Close', { duration: 3000 })
    })
  })

  describe('getReportedIssueList', () => {
    it('should return sorted reported issues', () => {
      const result$ = component.getReportedIssueList('test-id')

      result$.subscribe(result => {
        expect(result).toEqual([
          { reason: 'spam', percentage: 60, count: 3 },
          { reason: 'inappropriate', percentage: 40, count: 2 }
        ])
      })

      expect(mockCommunityService.getReportedIssuesStats).toHaveBeenCalledWith({
        discussionId: 'test-id',
        type: 'question'
      })
    })

    it('should return empty array when no reasons exist', () => {
      mockCommunityService.getReportedIssuesStats.mockReturnValue(of({
        result: { reportReasons: null }
      }))

      const result$ = component.getReportedIssueList('test-id')

      result$.subscribe(result => {
        expect(result).toEqual([])
      })
    })
  })

  describe('filterItems', () => {
    it('should set activeFilter and call getReportedDiscussionItems for "all"', () => {
      jest.spyOn(component, 'getReportedDiscussionItems')

      component.filterItems('all')

      expect(component.activeFilter).toBe('all')
      expect(component.getReportedDiscussionItems).toHaveBeenCalled()
    })

    it('should set activeFilter and call getPostFilterItems for "posts"', () => {
      jest.spyOn(component, 'getPostFilterItems')

      component.filterItems('posts')

      expect(component.activeFilter).toBe('posts')
      expect(component.getPostFilterItems).toHaveBeenCalled()
    })

    it('should set activeFilter and call getCommentFilterItems for "comments"', () => {
      jest.spyOn(component, 'getCommentFilterItems')

      component.filterItems('comments')

      expect(component.activeFilter).toBe('comments')
      expect(component.getCommentFilterItems).toHaveBeenCalled()
    })

    it('should set activeFilter and call getReplyFilterItems for "reply"', () => {
      jest.spyOn(component, 'getReplyFilterItems')

      component.filterItems('reply')

      expect(component.activeFilter).toBe('reply')
      expect(component.getReplyFilterItems).toHaveBeenCalled()
    })
  })

  describe('openDocument', () => {
    it('should prevent default and open document in new tab', () => {
      const mockEvent = {
        preventDefault: jest.fn()
      } as any
      const url = 'https://example.com/document.pdf'

      // Mock window.open
      const mockOpen = jest.fn()
      Object.defineProperty(window, 'open', {
        writable: true,
        value: mockOpen
      })

      component.openDocument(mockEvent, url)

      expect(mockEvent.preventDefault).toHaveBeenCalled()
      expect(mockOpen).toHaveBeenCalledWith(url, '_blank')
    })
  })

  describe('getFileExtension', () => {
    it('should return file extension for valid filename', () => {
      expect(component.getFileExtension('document.pdf')).toBe('pdf')
      expect(component.getFileExtension('file.doc')).toBe('doc')
      expect(component.getFileExtension('archive.zip')).toBe('zip')
    })

    it('should return empty string for invalid filename', () => {
      expect(component.getFileExtension('')).toBe('')
      expect(component.getFileExtension('undefined')).toBe('')
      expect(component.getFileExtension('filename')).toBe('')
      expect(component.getFileExtension('filename.')).toBe('')
    })

    it('should handle null or undefined filename', () => {
      expect(component.getFileExtension(null as any)).toBe('')
      expect(component.getFileExtension(undefined as any)).toBe('')
    })
  })

  describe('getFileName', () => {
    it('should extract and decode filename from URL', () => {
      const url = 'https://example.com/path/to/My%20Document.pdf'
      expect(component.getFileName(url)).toBe('My Document.pdf')
    })

    it('should handle URL without filename', () => {
      const url = 'https://example.com/'
      expect(component.getFileName(url)).toBe('')
    })

    it('should handle simple filename', () => {
      const url = 'https://example.com/document.pdf'
      expect(component.getFileName(url)).toBe('document.pdf')
    })
  })

  describe('getFileIcon', () => {
    it('should return correct icon for PDF files', () => {
      expect(component.getFileIcon('document.pdf')).toBe('picture_as_pdf')
    })

    it('should return correct icon for DOC files', () => {
      expect(component.getFileIcon('document.doc')).toBe('description')
      expect(component.getFileIcon('document.docx')).toBe('description')
    })

    it('should return default icon for unknown file types', () => {
      expect(component.getFileIcon('file.txt')).toBe('insert_drive_file')
      expect(component.getFileIcon('file.unknown')).toBe('insert_drive_file')
      expect(component.getFileIcon('file')).toBe('insert_drive_file')
    })
  })

  describe('Error Handling in Dialogs', () => {
    it('should handle error in openDialog showPlatform flow', () => {
      const mockDialogRef = {
        afterClosed: jest.fn().mockReturnValue(throwError('Dialog error'))
      }
      mockDialog.open.mockReturnValue(mockDialogRef)

      component.openDialog('showPlatform', 'test-id', 'question')

      // The error handling is in the subscribe callback
      // We can verify the dialog was opened
      expect(mockDialog.open).toHaveBeenCalled()
    })

    it('should handle error in openDialog hideContent flow', () => {
      const mockDialogRef = {
        afterClosed: jest.fn().mockReturnValue(throwError('Dialog error'))
      }
      mockDialog.open.mockReturnValue(mockDialogRef)

      component.openDialog('hideContent', 'test-id', 'question')

      // The error handling is in the subscribe callback
      // We can verify the dialog was opened
      expect(mockDialog.open).toHaveBeenCalled()
    })
  })

  describe('Edge Cases', () => {
    it('should handle route params without communityId', () => {
      mockActivatedRoute.params = of({})

      const newComponent = new CommunityManageComponent(
        mockDialog,
        mockCommunityService,
        mockActivatedRoute,
        mockSnackBar,
        mockRouter
      )

      expect(newComponent.communityId).toBeUndefined()
    })

    it('should handle null response in service calls', () => {
      mockCommunityService.getAllReportedDiscussion.mockReturnValue(of(null))

      component.getReportedDiscussionItems()

      expect(component.allDisussionObj).toEqual([])
      expect(component.allDisussionObjCount).toBe(0)
    })

    it('should handle response without search_results', () => {
      mockCommunityService.getAllReportedDiscussion.mockReturnValue(of({
        result: {}
      }))

      component.getReportedDiscussionItems()

      expect(component.allDisussionObj).toEqual([])
      expect(component.allDisussionObjCount).toBe(0)
    })
  })
})