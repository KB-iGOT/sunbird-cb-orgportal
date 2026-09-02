export namespace events {
  export interface tableData {
    columns: columnData[],
    showSearchBox: boolean,
    showPagination: boolean,
    noDataMessage?: string
  }

  export interface columnData {
    displayName: string,
    key: string,
    cellType: string,
    imageKey?: string,
    cellClass?: string
  }

  export interface pagination {
    startIndex: number,
    lastIndex: number,
    pageSize: number,
    pageIndex: number,
    totalCount: number,
  }

  export interface menuItems {
    icon?: string,
    btnText: string,
    action: string,
  }

  export const IMAGE_MAX_SIZE = (500 * 1024)
}

export interface speaker {
  name: string,
  email: string,
  description: string
}

export interface material {
  title: string,
  content: string,
  isNew?: boolean
}

export const URL_PATRON = /^(https?|http):\/\/[^\s/$.?#].[^\s]*$/
export const YOUTUBE_URL_PATRON = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/|v\/|live\/)|youtu\.be\/)[A-Za-z0-9_\-]+/
export const noSpecialCharEvent = new RegExp(
  /^[\u0900-\u097F\u0980-\u09FF\u0C00-\u0C7F\u0B80-\u0BFF\u0C80-\u0CFF\u0D00-\u0D7F\u0A80-\u0AFF\u0B00-\u0B7F\u0A00-\u0A7Fa-zA-Z0-9\(\)\$\[\]\.\-,:!'\" _\/]*$/ // NOSONAR
)

export const noSpecialChar = new RegExp(
  /^[\u0900-\u097F\u0980-\u09FF\u0C00-\u0C7F\u0B80-\u0BFF\u0C80-\u0CFF\u0D00-\u0D7F\u0A80-\u0AFF\u0B00-\u0B7F\u0A00-\u0A7Fa-zA-Z0-9\(\)\$\[\]\.\-,:!' _\/]*$/ // NOSONAR
)

export const DEFAULT_EVENT_CATEGORIES = ['Webinar', 'Karmayogi Talks', 'Karmayogi Saptah', 'Sadhana Saptah', 'Samuhik Charcha - NLW 2026']

export enum IEventResourceType {
  BharatKalpTalks = 'bharat kalp - talks',
  BharatKalpPodcast = 'bharat kalp - podcast',
}
