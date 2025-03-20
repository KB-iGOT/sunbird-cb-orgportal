import { Component, Input } from '@angular/core'
import { FormGroup } from '@angular/forms'
import { MatLegacySnackBar } from '@angular/material/legacy-snack-bar'

import * as _ from 'lodash'
import {
  type EditorConfig,
  ClassicEditor,
  Autosave,
  BlockQuote,
  Bold,
  Code,
  Essentials,
  FontBackgroundColor,
  FontColor,
  FontFamily,
  FontSize,
  Heading,
  Highlight,
  Indent,
  IndentBlock,
  Italic,
  Link,
  List,
  Mention,
  Paragraph,
  RemoveFormat,
  SpecialCharacters,
  Strikethrough,
  Subscript,
  Superscript,
  Table,
  TableCaption,
  TableCellProperties,
  TableColumnResize,
  TableProperties,
  TableToolbar,
  Underline,
  WordCount
} from 'ckeditor5'

@Component({
  selector: 'ws-app-community-basic-details',
  templateUrl: './community-basic-details.component.html',
  styleUrls: ['./community-basic-details.component.scss']
})
export class CommunityBasicDetailsComponent {
  @Input() communityDetailsForm!: FormGroup
  @Input() openMode!: string
  @Input() topicDataList: any[] = []
  communityStatus = 'draft'
  previewUrl: string = ''
  isDragging: boolean = false
  ckEditorConfig: EditorConfig = {};
  public Editor = ClassicEditor;
  previewImageUrl: string = ''

  constructor(private matSnackBar: MatLegacySnackBar) {
    this.ckEditorConfig = {
      toolbar: {
        items: [
          'undo',
          'redo',
          '|',
          'heading',
          '|',
          'bold',
          'italic',
          'underline',
          '|',
          'blockQuote',
          '|',
          'bulletedList',
          'numberedList',
          '|',
          'fontSize',
          'fontFamily',
          'fontColor',
          'fontBackgroundColor',
          '|',
          'outdent',
          'indent',
          'strikethrough',
          'subscript',
          'superscript',
          'code',
          'removeFormat',
          'highlight',
          '|',
          'specialCharacters',
          'insertTable',
        ],
        shouldNotGroupWhenFull: false
      },
      plugins: [
        Autosave,
        BlockQuote,
        Bold,
        Code,
        Essentials,
        FontBackgroundColor,
        FontColor,
        FontFamily,
        FontSize,
        Heading,
        Highlight,
        Indent,
        IndentBlock,
        Italic,
        Link,
        List,
        Mention,
        Paragraph,
        RemoveFormat,
        SpecialCharacters,
        Strikethrough,
        Subscript,
        Superscript,
        Table,
        TableCaption,
        TableCellProperties,
        TableColumnResize,
        TableProperties,
        TableToolbar,
        Underline,
        WordCount
      ],
      fontFamily: {
        supportAllValues: true
      },
      fontSize: {
        options: [10, 12, 14, 'default', 18, 20, 22],
        supportAllValues: true
      },
      heading: {
        options: [
          {
            model: 'paragraph',
            title: 'Paragraph',
            class: 'ck-heading_paragraph'
          },
          {
            model: 'heading1',
            view: 'h1',
            title: 'Heading 1',
            class: 'ck-heading_heading1'
          },
          {
            model: 'heading2',
            view: 'h2',
            title: 'Heading 2',
            class: 'ck-heading_heading2'
          },
          {
            model: 'heading3',
            view: 'h3',
            title: 'Heading 3',
            class: 'ck-heading_heading3'
          },
          {
            model: 'heading4',
            view: 'h4',
            title: 'Heading 4',
            class: 'ck-heading_heading4'
          },
          {
            model: 'heading5',
            view: 'h5',
            title: 'Heading 5',
            class: 'ck-heading_heading5'
          },
          {
            model: 'heading6',
            view: 'h6',
            title: 'Heading 6',
            class: 'ck-heading_heading6'
          }
        ]
      },
      link: {
        addTargetToExternalLinks: true,
        defaultProtocol: 'https://',
        decorators: {
          // toggleDownloadable: {
          // 	mode: 'manual',
          // 	label: 'Downloadable',
          // 	attributes: {
          // 		download: 'file'
          // 	}
          // }
        }
      },
      placeholder: 'What you want to say...!',
      table: {
        contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells', 'tableProperties', 'tableCellProperties']
      },
      typing: {
        transformations: {
          include: []  // This prevents auto-transformations that might bypass our length check
        }
      }
    }
  }


  showValidationMsg(controlName: string, validationType: string): Boolean {
    let showMsg = false
    const control = _.get(this.communityDetailsForm, `controls.${controlName}`)
    if (control && control.touched && control.invalid && control.hasError(validationType)) {
      showMsg = true
    }
    return showMsg
  }


  onFileSelected(event: Event, type: string) {
    const file = (event.target as HTMLInputElement).files?.[0]
    if (file) {
      this.handleFile(file, type)
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault()
    event.stopPropagation()
    this.isDragging = true
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault()
    event.stopPropagation()
    this.isDragging = false
  }

  onDrop(event: DragEvent, type: string) {
    event.preventDefault()
    event.stopPropagation()
    this.isDragging = false

    const files = event.dataTransfer?.files
    if (files?.length) {
      this.handleFile(files[0], type)
    }
  }

  validatePosterImage(file: File): Promise<boolean> {
    return new Promise((resolve) => {
      if (file.size > 10 * 1024 * 1024) { // 10MB
        this.openSnackBar('File size must be less than 10MB')
        resolve(false)
        return
      }

      const img = new Image()
      img.src = URL.createObjectURL(file)

      img.onload = () => {
        URL.revokeObjectURL(img.src)
        if (img.width !== 1152 || img.height !== 288) {
          this.openSnackBar('Image must be exactly 1152x288 pixels')
          resolve(false)
        } else {
          resolve(true)
        }
      }

      img.onerror = () => {
        this.openSnackBar('Invalid image file')
        resolve(false)
      }
    })
  }


  validateCommunityImage(file: File): Promise<boolean> {
    return new Promise((resolve) => {
      // if (file.size > 10 * 1024 * 1024) { // 10MB
      //   this.openSnackBar('File size must be less than 10MB')
      //   resolve(false)
      //   return
      // }

      const img = new Image()
      img.src = URL.createObjectURL(file)

      // img.onload = () => {
      //   URL.revokeObjectURL(img.src)
      //   if (img.width !== 1152 || img.height !== 288) {
      //     this.openSnackBar('Image must be exactly 1152x288 pixels')
      //     resolve(false)
      //   } else {
      //     resolve(true)
      //   }
      // }
      resolve(true)
      img.onerror = () => {
        this.openSnackBar('Invalid image file')
        resolve(false)
      }
    })
  }

  async handleFile(file: File, type: string) {
    if (!file.type.startsWith('image/')) {
      this.openSnackBar('Please upload an image file')
      return
    }
    if (type === 'posterImageUrl') {
      const isValid = await this.validatePosterImage(file)
      if (isValid) {
        const reader = new FileReader()
        reader.onload = () => {
          this.previewUrl = reader.result as string

          this.communityDetailsForm.patchValue({
            posterImageUrl: file
          })
        }
        reader.readAsDataURL(file)
      }
    } else if (type === 'imageUrl') {
      const isValid = await this.validateCommunityImage(file)
      if (isValid) {
        const reader = new FileReader()
        reader.onload = () => {
          this.previewImageUrl = reader.result as string
          this.communityDetailsForm.patchValue({
            imageUrl: file
          })
        }
        reader.readAsDataURL(file)
      }
    }
  }




  private openSnackBar(message: string) {
    this.matSnackBar.open(message)
  }
  getCongif() {
    return this.ckEditorConfig
  }
  onReady(editor: any) {
    // You can customize the editor instance here
    editor.editing.view.change((writer: any) => {
      writer.setStyle(
        'min-height',
        '150px',
        editor.editing.view.document.getRoot()
      )
    })
    const poweredByEl = document.querySelector('.ck.ck-powered-by')
    if (poweredByEl) {
      poweredByEl.remove()
    }
    // public onReady(editor: ClassicEditor): void {
    //   Array.from(this.editorWordCount.nativeElement.children).forEach(child => child.remove());

    //   const wordCount = editor.plugins.get('WordCount');
    //   this.editorWordCount.nativeElement.appendChild(wordCount.wordCountContainer);
    // }
  }
  getEditorTextLength(content: any) {
    let test = content.replace(/<[^>]*>/g, '')
    test = test.replace(/&nbsp;/gi, ' ')
    test = test.trim()
    return test.length
  }
  checkCharacterLimit(event: any) {
    const length = this.getEditorTextLength(this.communityDetailsForm.get('description')?.value)
    if (length > 3000) {
      // Prevent further input
      event.editor.setData(event.editor.getData())
      // Optionally show an error message or handle the overflow
    }
  }
  onEditorChange(event: any): void {
    const editor = event.editor
    const currentLength = this.getEditorTextLength(editor.getData())

    if (currentLength > 3000) {
      // Store the last valid content
      const previousContent = editor.getData()
      // Find the point to truncate by counting characters
      let truncated = ''
      let count = 0
      const tempDiv = document.createElement('div')
      tempDiv.innerHTML = previousContent

      function processNode(node: Node) {
        if (count >= 3000) return
        if (node.nodeType === Node.TEXT_NODE) {
          const remaining = 3000 - count
          const text = node.textContent || ''
          truncated += text.slice(0, remaining)
          count += text.length
        } else {
          const children = Array.from(node.childNodes)
          truncated += node.nodeType === Node.ELEMENT_NODE ? `<${(node as Element).tagName.toLowerCase()}>` : ''
          children.forEach(child => processNode(child))
          truncated += node.nodeType === Node.ELEMENT_NODE ? `</${(node as Element).tagName.toLowerCase()}>` : ''
        }
      }

      Array.from(tempDiv.childNodes).forEach(node => processNode(node))

      // Set the truncated content back to editor
      editor.setData(truncated)

      // Move cursor to end
      const selection = editor.model.document.selection
      const position = editor.model.document.model.createPositionAt(editor.model.document.getRoot(), 'end')
      selection.setTo(position)
    }

  }

  onFocus() {
    const poweredByEl = document.querySelector('.ck.ck-powered-by')
    if (poweredByEl) {
      poweredByEl.remove()
    }
  }

  emptyPosterImage() {
    this.communityDetailsForm.patchValue({
      posterImageUrl: ''
    })
    this.previewUrl = ''
  }
  emptyImageUrl() {
    this.communityDetailsForm.patchValue({
      imageUrl: ''
    })
    this.previewImageUrl = ''
  }
}
