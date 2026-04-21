import { AtDeskCardComponent } from './at-desk-card.component'

describe('AtDeskCardComponent', () => {
  let component: AtDeskCardComponent

  beforeEach(() => {
    component = new AtDeskCardComponent()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should initialize', () => {
    component.ngOnInit()
    expect(component).toBeTruthy()
  })
})
