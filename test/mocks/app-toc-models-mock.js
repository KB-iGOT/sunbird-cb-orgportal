// Mock for app-toc model files that don't exist on disk
// Covers: ../models/constant, ../models/search, ../models/api-end-points

const NsContent = {
  MIME_TYPE: {
    collection: 'application/vnd.ekstep.content-collection',
    html: 'application/html',
    pdf: 'application/pdf',
    youtube: 'video/x-youtube',
    quiz: 'application/quiz',
    dragDrop: 'application/drag-drop',
    htmlPicker: 'application/htmlpicker',
    webModule: 'application/web-module',
    handson: 'application/integrated-hands-on',
    iap: 'application/iap-assessment',
    mp3: 'audio/mpeg',
    mp4: 'application/x-mpegURL',
  },
  ICON_TYPE: {
    kBoard: 'amp_stories',
    program: 'library_books',
    course: 'book',
    learningModule: 'folder',
    certificate: 'chrome_reader_mode',
    externalContent: 'open_in_new',
    internalContent: 'input',
    emptyFile: 'insert_drive_file',
    pdf: 'picture_as_pdf',
    youtube: 'subscriptions',
    assessment: 'assessment',
    quiz: 'assignment_turned_in',
    dragNDrop: 'swap_vertical_circle',
    htmlPicker: 'web_asset',
    handsOn: 'code',
    iap: 'assignment_late',
    audio: 'audiotrack',
    video: 'video_library',
    default: 'file_copy',
  },
}

module.exports = {
  NsContent,
  AUTHORING_CONTENT_BASE: '/apis/authContent/',
}
