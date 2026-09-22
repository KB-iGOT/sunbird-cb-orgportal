import { Pipe, PipeTransform } from '@angular/core'
import { environment } from 'src/environments/environment'

/**
 * The folders an artifact url is served from. A standalone piece of content keeps its
 * artifacts under `/content`, a collection - a comprehensive assessment among them - under
 * `/collection`.
 */
const ASSET_FOLDERS = ['content', 'collection']

@Pipe({
    name: 'pipePublicURL',
    standalone: false
})
export class PipePublicURL implements PipeTransform {

  transform(value: string): any {
    if (!value) {
      return ''
    }
    /* The stored url is rebuilt against this environment's content host from its asset
       folder on. The folder is read off the url rather than assumed to be `content`: a
       collection keeps its artifacts under `/collection`, and those used to match nothing,
       so the whole url was appended to the host - `<host>/<bucket>/contenthttps://...`,
       not a url at all, which is why such a thumbnail only ever rendered broken. A url
       carrying no known folder has no path to take and is left as it stands. */
    const folderAt = ASSET_FOLDERS
      .map((folder: string) => ({ folder, at: value.lastIndexOf(`/${folder}/`) }))
      .reduce((furthest, candidate) => candidate.at > furthest.at ? candidate : furthest,
              { folder: '', at: -1 })

    if (folderAt.at === -1) {
      return value
    }
    return `${environment.contentHost}/${environment.contentBucket}${value.slice(folderAt.at)}`
  }

}
