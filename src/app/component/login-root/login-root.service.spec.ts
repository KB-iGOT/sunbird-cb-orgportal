import { LoginRootService } from './login-root.service'
import { LoginComponent } from '../login/login.component'

describe('LoginRootService', () => {
  let service: LoginRootService

  beforeEach(() => {
    service = new LoginRootService()
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  it('should return LoginComponent from getComponent', () => {
    const result = service.getComponent()
    expect(result).toBe(LoginComponent)
  })

  it('should return the same class reference on each call', () => {
    const result1 = service.getComponent()
    const result2 = service.getComponent()
    expect(result1).toBe(result2)
  })
})
