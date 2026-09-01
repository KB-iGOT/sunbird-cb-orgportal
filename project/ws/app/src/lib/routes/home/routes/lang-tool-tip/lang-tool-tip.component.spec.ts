import { LangToolTipComponent } from './lang-tool-tip.component'

describe('LangToolTipComponent', () => {
  let component: LangToolTipComponent

  beforeEach(() => {
    component = new LangToolTipComponent()
  })

  it('should create the component', () => {
    expect(component).toBeTruthy()
  })

  it('should have undefined tooltipTemplate by default', () => {
    expect(component.tooltipTemplate).toBeUndefined()
  })

  it('should have undefined tooltipData by default', () => {
    expect(component.tooltipData).toBeUndefined()
  })

  describe('getStatusClass', () => {
    it('should return empty string for falsy status', () => {
      expect(component.getStatusClass('')).toBe('')
    })

    it('should return "live" for status "live"', () => {
      expect(component.getStatusClass('live')).toBe('live')
    })

    it('should return "live" for uppercase "LIVE"', () => {
      expect(component.getStatusClass('LIVE')).toBe('live')
    })

    it('should return "under-review" for status containing "review"', () => {
      expect(component.getStatusClass('review')).toBe('under-review')
    })

    it('should return "under-review" for status "Under Review"', () => {
      expect(component.getStatusClass('Under Review')).toBe('under-review')
    })

    it('should return "under-review" for status "InReview"', () => {
      expect(component.getStatusClass('InReview')).toBe('under-review')
    })

    it('should return "draft" for status "draft"', () => {
      expect(component.getStatusClass('draft')).toBe('draft')
    })

    it('should return "draft" for any other status like "published"', () => {
      expect(component.getStatusClass('published')).toBe('draft')
    })
  })
})
