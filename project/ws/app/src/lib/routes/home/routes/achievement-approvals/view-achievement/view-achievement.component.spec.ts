import { ViewAchievementComponent } from './view-achievement.component'

describe('ViewAchievementComponent', () => {
  let component: ViewAchievementComponent

  beforeEach(() => {
    component = new ViewAchievementComponent()
    component.achievement = {}
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should initialize showFullDescription as false', () => {
    expect(component.showFullDescription).toBe(false)
  })

  it('should initialize achievement as empty object', () => {
    const fresh = new ViewAchievementComponent()
    expect(fresh.achievement).toEqual({})
  })

  describe('toggleDescription', () => {
    it('should toggle showFullDescription from false to true', () => {
      component.showFullDescription = false
      component.toggleDescription()
      expect(component.showFullDescription).toBe(true)
    })

    it('should toggle showFullDescription from true to false', () => {
      component.showFullDescription = true
      component.toggleDescription()
      expect(component.showFullDescription).toBe(false)
    })
  })

  describe('truncatedDescription', () => {
    it('should return empty string when achievement has no contextData', () => {
      component.achievement = {}
      expect(component.truncatedDescription).toBe('')
    })

    it('should return empty string when description is empty', () => {
      component.achievement = { contextData: { description: '' } }
      expect(component.truncatedDescription).toBe('')
    })

    it('should return full description when length is <= 200', () => {
      const shortDesc = 'Short description'
      component.achievement = { contextData: { description: shortDesc } }
      expect(component.truncatedDescription).toBe(shortDesc)
    })

    it('should return truncated description with ellipsis when length > 200 and showFullDescription is false', () => {
      const longDesc = 'A'.repeat(250)
      component.achievement = { contextData: { description: longDesc } }
      component.showFullDescription = false
      expect(component.truncatedDescription).toBe('A'.repeat(200) + '...')
    })

    it('should return full description when showFullDescription is true even if length > 200', () => {
      const longDesc = 'B'.repeat(250)
      component.achievement = { contextData: { description: longDesc } }
      component.showFullDescription = true
      expect(component.truncatedDescription).toBe(longDesc)
    })
  })

  describe('isLongDescription', () => {
    it('should return false when achievement has no contextData', () => {
      component.achievement = {}
      expect(component.isLongDescription).toBe(false)
    })

    it('should return false when description length is <= 200', () => {
      component.achievement = { contextData: { description: 'Short' } }
      expect(component.isLongDescription).toBe(false)
    })

    it('should return true when description length is > 200', () => {
      component.achievement = { contextData: { description: 'C'.repeat(201) } }
      expect(component.isLongDescription).toBe(true)
    })
  })

  describe('onClose', () => {
    it('should emit closeSidenav event', () => {
      const emitSpy = jest.spyOn(component.closeSidenav, 'emit')
      component.onClose()
      expect(emitSpy).toHaveBeenCalled()
    })
  })
})
