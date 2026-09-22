import { environment } from 'src/environments/environment'
import { PipePublicURL } from './pipe-public-URL.pipe'

describe('PipePublicURL', () => {
  let pipe: PipePublicURL

  beforeEach(() => {
    pipe = new PipePublicURL()
  })

  const publicBase = () => `${environment.contentHost}/${environment.contentBucket}/content`
  const collectionBase = () => `${environment.contentHost}/${environment.contentBucket}/collection`

  it('should rebuild a stored url against this environment', () => {
    expect(pipe.transform('https://mdo.qa.net/assets/public/content/do_1/artifact/icon.png'))
      .toBe(`${publicBase()}/do_1/artifact/icon.png`)
  })

  it('should rebuild a raw storage url the same way', () => {
    expect(pipe.transform('https://storage.googleapis.com/igot/content/do_1/artifact/icon.png'))
      .toBe(`${publicBase()}/do_1/artifact/icon.png`)
  })

  /**
   * A comprehensive assessment is a collection, so its thumbnail is served from
   * `/collection` rather than `/content` - the folder that used to match nothing.
   */
  it('should rebuild a collection artifact url', () => {
    expect(pipe.transform(
      'https://storage.googleapis.com/igot/collection/do_11466364357133926414/artifact/' +
      'do_114663791637037056111_1790013628013_image-17.thumb.png'))
      .toBe(`${collectionBase()}/do_11466364357133926414/artifact/` +
            'do_114663791637037056111_1790013628013_image-17.thumb.png')
  })

  /** The path is taken from the last segment, so a bucket named `/content` does not win. */
  it('should take the path from the last content segment', () => {
    expect(pipe.transform('https://host/content/bucket/content/do_1/icon.png'))
      .toBe(`${publicBase()}/do_1/icon.png`)
  })

  /**
   * There is no path to take, and appending the whole url to the host produced
   * `<host>/<bucket>/contenthttps://...` - which never resolved to an image.
   */
  it('should leave a url carrying no known folder as it stands', () => {
    const url = 'https://storage.googleapis.com/igot/do_1/artifact/icon.png'

    expect(pipe.transform(url)).toBe(url)
  })

  it('should answer an empty string for nothing', () => {
    expect(pipe.transform('')).toBe('')
    expect(pipe.transform(null as any)).toBe('')
    expect(pipe.transform(undefined as any)).toBe('')
  })
})
