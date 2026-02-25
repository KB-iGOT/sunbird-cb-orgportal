(window as any)['env'] = {
  name: 'test-environment',
  sitePath: '/test-site-path',
  karmYogiPath: '/test-karm-yogi-path',
  cbpPath: '/test-cbp-path'
}
import '@angular/compiler'
import { SimpleChange } from '@angular/core'
import { AppTocContentCardComponent } from './app-toc-content-card.component'
import { ConfigurationsService } from '@ws-widget/utils'

describe('AppTocContentCardComponent', () => {
  let component: AppTocContentCardComponent
  let mockConfigService: jest.Mocked<ConfigurationsService>

  beforeEach(() => {
    mockConfigService = {
      instanceConfig: {
        logos: {
          defaultContent: 'default-thumbnail.jpg'
        }
      }
    } as any


    component = new AppTocContentCardComponent(
      mockConfigService as undefined,
    )
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })



  describe('ngOnChanges', () => {
    it('should update viewChildren when expandAll changes', () => {
      const changes = {
        expandAll: new SimpleChange(false, true, false)
      }

      component.expandAll = true
      component.ngOnChanges(changes)

      expect(component.viewChildren).toBe(true)
    })
  })

  describe('isCollection getter', () => {
    it('should return true for collection mime type', () => {
      component.content = {
        mimeType: 'application/vnd.ekstep.content-collection'
      } as any

      expect(component.isCollection).toBe(true)
    })

    it('should return false for non-collection mime type', () => {
      component.content = {
        mimeType: 'video/mp4'
      } as any

      expect(component.isCollection).toBe(false)
    })
  })

  describe('evaluateImmediateChildrenStructure', () => {
    it('should count different content types correctly', () => {
      component.content = {
        children: [
          {
            primaryCategory: 'Course',
            mimeType: 'application/vnd.ekstep.content-collection'
          },
          {
            primaryCategory: 'Resource',
            mimeType: 'video/mp4'
          },
          {
            primaryCategory: 'Resource',
            mimeType: 'application/pdf'
          }
        ]
      } as any

      component['evaluateImmediateChildrenStructure']()

      expect(component.contentStructure.course).toBe(1)
      expect(component.contentStructure.video).toBe(0)
      expect(component.contentStructure.pdf).toBe(0)
      expect(component.hasContentStructure).toBe(true)
    })

    it('should handle assessment and quiz content types', () => {
      component.content = {
        children: [
          {
            primaryCategory: 'Resource',
            mimeType: 'application/quiz',
            resourceType: 'Assessment'
          },
          {
            primaryCategory: 'Resource',
            mimeType: 'application/quiz',
            resourceType: 'Quiz'
          }
        ]
      } as any

      component['evaluateImmediateChildrenStructure']()

      expect(component.contentStructure.assessment).toBe(0)
      expect(component.contentStructure.quiz).toBe(0)
    })
  })

  describe('contentTrackBy', () => {
    it('should return content identifier', () => {
      const content = { identifier: 'test-id' } as any

      expect(component.contentTrackBy(0, content)).toBe('test-id')
    })

    it('should return null for undefined content', () => {
      expect(component.contentTrackBy(0, undefined as any)).toBeNull()
    })
  })
})
