import { LoaderService } from './loader.service'

describe('LoaderService', () => {
    let service: LoaderService

    beforeEach(() => {
        service = new LoaderService()
    })

    it('should create a instance of service', () => {
        expect(service).toBeTruthy()
    })

    it('should have a BehaviorSubject initialized to false', () => {
        let currentValue: boolean | undefined
        service.$currentState.subscribe(v => (currentValue = v))
        expect(currentValue).toBe(false)
    })

    describe('changeLoaderState', () => {
        it('should emit true when called with true', () => {
            let emitted: boolean | undefined
            service.$currentState.subscribe(v => (emitted = v))
            service.changeLoaderState(true)
            expect(emitted).toBe(true)
        })

        it('should emit false when called with false', () => {
            let emitted: boolean | undefined
            service.changeLoaderState(true)
            service.$currentState.subscribe(v => (emitted = v))
            service.changeLoaderState(false)
            expect(emitted).toBe(false)
        })
    })
})
