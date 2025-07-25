import { CapitalizePipe } from './capitalize.pipe'

describe('CapitalizePipe', () => {
    let pipe: CapitalizePipe

    beforeEach(() => {
        pipe = new CapitalizePipe()
    })

    it('should create an instance', () => {
        expect(pipe).toBeTruthy()
    })

    it('should capitalize the first letter of each word', () => {
        const result = pipe.transform('hello world')
        expect(result).toBe('Hello World')
    })

    it('should capitalize single word', () => {
        const result = pipe.transform('hello')
        expect(result).toBe('Hello')
    })

    it('should handle multiple spaces between words', () => {
        const result = pipe.transform('hello    world')
        expect(result).toBe('Hello    World')
    })

    it('should handle mixed case input', () => {
        const result = pipe.transform('hELLo WoRLd')
        expect(result).toBe('HELLo WoRLd')
    })

    it('should handle string with numbers', () => {
        const result = pipe.transform('hello 123 world')
        expect(result).toBe('Hello 123 World')
    })

    it('should handle string starting with numbers', () => {
        const result = pipe.transform('123hello world')
        expect(result).toBe('123hello World')
    })

    it('should handle empty string', () => {
        const result = pipe.transform('')
        expect(result).toBe('')
    })

    it('should handle null input', () => {
        const result = pipe.transform(null as any)
        expect(result).toBe(null)
    })

    it('should handle undefined input', () => {
        const result = pipe.transform(undefined as any)
        expect(result).toBe(undefined)
    })

    it('should handle string with special characters', () => {
        const result = pipe.transform('hello-world test_case')
        expect(result).toBe('Hello-World Test_Case')
    })

    it('should handle string with punctuation', () => {
        const result = pipe.transform('hello, world! how are you?')
        expect(result).toBe('Hello, World! How Are You?')
    })

    it('should handle single character', () => {
        const result = pipe.transform('a')
        expect(result).toBe('A')
    })

    it('should handle whitespace only string', () => {
        const result = pipe.transform('   ')
        expect(result).toBe('   ')
    })

    it('should handle string with tabs and newlines', () => {
        const result = pipe.transform('hello\tworld\ntest')
        expect(result).toBe('Hello\tWorld\nTest')
    })
})