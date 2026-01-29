import { ComponentFixture, TestBed } from '@angular/core/testing'
import { ActivatedRoute } from '@angular/router'
import { of } from 'rxjs'
import { ExploreContentService } from '../../../services/explore-content.service'
import { LoaderService } from '../../../../../../../../../../src/app/services/loader.service'
import { PreviewComponent } from './preview.component'

describe('PreviewComponent', () => {
  let component: PreviewComponent
  let fixture: ComponentFixture<PreviewComponent>

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PreviewComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: () => 'test-id',
              },
            },
          },
        },
        {
          provide: ExploreContentService,
          useValue: {
            extendedContentRead: () => of({}),
          },
        },
        {
          provide: LoaderService,
          useValue: {
            changeLoaderState: (_state: boolean) => { },
            changeLoad: { next: (_state: boolean) => { } },
          },
        },
      ],
    })
    fixture = TestBed.createComponent(PreviewComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
