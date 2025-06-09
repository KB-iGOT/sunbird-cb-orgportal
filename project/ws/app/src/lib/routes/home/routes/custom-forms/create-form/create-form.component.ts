import { Component, EventEmitter, OnInit, Output } from '@angular/core'
import { FormArray, UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms'
import { preventHtmlAndJs } from '../../../../validators/prevent-html-and-js.validator'
import { FileService } from '../../../../users/services/upload.service'
import { HttpErrorResponse } from '@angular/common/http'
import { takeUntil } from 'rxjs/operators'
import { Subject } from 'rxjs'
import { MatSnackBar } from '@angular/material/snack-bar'
import { ActivatedRoute } from '@angular/router'
import * as _ from 'lodash'
import { CustomFieldsService } from '../../../../users/services/custom-fields.service'

@Component({
  selector: 'ws-app-create-form',
  templateUrl: './create-form.component.html',
  styleUrls: ['./create-form.component.scss']
})

export class CreateFormComponent implements OnInit {

  sections = [
    {
      icon: 'add',
      title: 'Input Text',
      subTitle: 'Add fields in profile',
      type: 'text',
    },
    {
      icon: 'dashboard',
      title: 'List',
      subTitle: 'Add fields in profile',
      type: 'list',
    },
    // {
    //   icon: 'dashboard',
    //   title: 'Multi Master List',
    //   subTitle: 'Add fields in profile',
    //   type: 'multiMasterList',
    // },
    // {
    //   icon: 'dashboard',
    //   title: 'Triplet List',
    //   subTitle: 'Add fields in profile',
    //   type: 'tripletList',
    // },
    // {
    //   icon: 'visibility',
    //   title: 'Preview Form',
    //   subTitle: 'Preview this form',
    //   type: 'preview',
    // },
  ]
  customForm!: UntypedFormGroup
  selectedTab: string = ''
  @Output() closeForm: EventEmitter<any> = new EventEmitter()
  public fileName: any
  fileSelected!: any
  private destroySubject$ = new Subject()
  rootOrgId: any
  constructor(private formBuilder: UntypedFormBuilder, private fileService: FileService,
    private matSnackBar: MatSnackBar, private activeRoute: ActivatedRoute, private customFieldsService: CustomFieldsService
  ) {
    this.rootOrgId = _.get(this.activeRoute, 'snapshot.data.configService.userProfile.rootOrgId')
  }

  ngOnInit() {
    this.createForm()
  }

  createForm() {
    this.customForm = this.formBuilder.group({
      description: ['', [Validators.required, this.noWhitespaceValidator, preventHtmlAndJs()]],
      questions: this.formBuilder.array([]),
      type: [''],
    })
  }

  noWhitespaceValidator(control: any) {
    const isWhitespace = (control && control.value && control.value.toString() || '').trim().length === 0
    const isValid = !isWhitespace
    return isValid ? null : { whitespace: true }
  }

  addContent(type: string) {
    this.selectedTab = type
    const questionsArray = this.customForm.get('questions')
    if (questionsArray && questionsArray instanceof FormArray) {
      questionsArray.clear()
    }
    this.addQuestion(type)
  }

  forbiddenCharacterValidator(control: any) {
    const forbiddenPattern = /<[^>]*>|(function[^\s]+)|(javascript:[^\s]+)|([/.]{2,})|(\\+)/i
    const forbidden = forbiddenPattern.test(control.value)
    return forbidden ? { invalidCharacter: true } : null
  }

  get getQuestions(): UntypedFormArray {
    if (this.customForm) {
      const res = this.customForm.controls.questions as UntypedFormArray
      return res
    }
    return this.formBuilder.array([])
  }

  addQuestion(type: string) {
    this.customForm.controls['type'].setValue(type)
    const questionGroup = this.formBuilder.group({
      name: ['', [Validators.required, this.forbiddenCharacterValidator, preventHtmlAndJs()]],
      attributeName: ['', [Validators.required]],
      validation: ['', [Validators.required]],
      customValidation: [''],
      isMandatory: [false],
    })
    this.getQuestions.push(questionGroup)
  }

  onSave() {
    console.log(this.customForm.value)
    let payload: any
    if (this.customForm.value.type === 'text') {
      payload = this.constructPayload()
    }
    console.log(payload)
    this.customFieldsService.createField(payload).subscribe((res: any) => {
      console.log(res)
      if (res.result) {
        this.matSnackBar.open('Field is created successfully!')
        this.closeForm.emit(true)
      }
    }, error => {
      console.log(error)
    })
  }

  constructPayload() {
    return {
      name: this.customForm.value.questions[0].name,
      description: this.customForm.value.description,
      type: this.customForm.value.type,
      organisationId: this.rootOrgId,
      customFieldData: this.customForm.value.questions[0].name,
      attributeName: this.customForm.value.questions[0].attributeName,
      validation: 'alphaNumeric',
      isMandatory: this.customForm.value.questions[0].isMandatory,
    }
  }

  removeItem(index: number) {
    this.getQuestions.removeAt(index)
  }

  close() {
    this.closeForm.emit(false)
  }
  customRegex(event: any) {
    const question = this.getQuestions.at(event.index) as UntypedFormGroup
    const customValidation = question?.controls['customValidation']
    if (event.selected === 'regex') {
      if (customValidation) {
        customValidation.setValidators([Validators.required])
        customValidation.updateValueAndValidity()
      }
    } else {
      if (customValidation) {
        customValidation.clearValidators()
        customValidation.setValue('')
        customValidation.updateValueAndValidity()
      }
    }
  }

  handleFileClick(event: any): void {
    event.target.value = ''
  }

  handleOnFileChange(event: any): void {
    const fileList = (<HTMLInputElement>event.target).files
    if (fileList && fileList.length > 0) {
      const file: File = fileList[0]
      this.fileName = file.name
      this.fileSelected = file
      if (this.fileService.validateXlFile(this.fileName)) {
        if (this.fileSelected) {
          const formData: FormData = new FormData()
          formData.append('data', this.fileSelected, this.fileName)
          this.fileService.upload(this.fileName, formData)
            .pipe(takeUntil(this.destroySubject$))
            .subscribe((_res: any) => {
              this.matSnackBar.open('File uploaded successfully!')
              this.fileName = ''
              this.fileSelected = ''
            }, (_err: HttpErrorResponse) => {
              if (!_err.ok) {
                this.matSnackBar.open('Uploading CSV file failed due to some error, please try again later!')
              }
            })
        }
      } else {
        console.log('invalid file')
      }
    }
  }

  ngOnDestroy(): void {
    this.destroySubject$.unsubscribe()
  }


}
