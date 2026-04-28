import { NsAutoComplete } from './user-autocomplete.model'

describe('NsAutoComplete.EUserAutoCompleteCategory', () => {
  it('should have EMAIL value', () => {
    expect(NsAutoComplete.EUserAutoCompleteCategory.EMAIL).toBe('email')
  })

  it('should have FIRST_NAME value', () => {
    expect(NsAutoComplete.EUserAutoCompleteCategory.FIRST_NAME).toBe('first_name')
  })

  it('should have LAST_NAME value', () => {
    expect(NsAutoComplete.EUserAutoCompleteCategory.LAST_NAME).toBe('last_name')
  })

  it('should have ROOT_ORG value', () => {
    expect(NsAutoComplete.EUserAutoCompleteCategory.ROOT_ORG).toBe('root_org')
  })

  it('should have DEPARTMENT_NAME value', () => {
    expect(NsAutoComplete.EUserAutoCompleteCategory.DEPARTMENT_NAME).toBe('department_name')
  })
})

describe('NsAutoComplete.IUserAutoComplete', () => {
  it('should create a valid IUserAutoComplete object', () => {
    const user: NsAutoComplete.IUserAutoComplete = {
      department_name: 'Engineering',
      email: 'test@example.com',
      first_name: 'John',
      last_name: 'Doe',
      root_org: 'org1',
      wid: 'wid123',
    }
    expect(user.email).toBe('test@example.com')
    expect(user.first_name).toBe('John')
    expect(user.last_name).toBe('Doe')
    expect(user.department_name).toBe('Engineering')
    expect(user.root_org).toBe('org1')
    expect(user.wid).toBe('wid123')
  })
})
