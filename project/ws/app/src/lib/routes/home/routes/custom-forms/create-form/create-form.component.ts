import { Component, EventEmitter, OnInit, Output } from '@angular/core'
import { FormArray, UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms'
import { preventHtmlAndJs } from '../../../../validators/prevent-html-and-js.validator'

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
      type: 'inputText',
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
  constructor(private formBuilder: UntypedFormBuilder) {

  }

  ngOnInit() {
    this.createForm()
  }

  createForm() {
    this.customForm = this.formBuilder.group({
      description: ['', [Validators.required, this.noWhitespaceValidator, preventHtmlAndJs()]],
      questions: this.formBuilder.array([]),
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
    const questionGroup = this.formBuilder.group({
      type: [type],
      fieldName: ['', [Validators.required, this.forbiddenCharacterValidator, preventHtmlAndJs()]],
      fieldAttribute: ['', [Validators.required]],
      fieldValidation: ['', [Validators.required]],
      customValidation: [''],
      isRequired: [false],
    })
    this.getQuestions.push(questionGroup)
    console.log(this.customForm.value)
  }

  onSave() {
    console.log(this.customForm.value)
    this.closeForm.emit(true)
  }

  removeItem(index: number) {
    this.getQuestions.removeAt(index)
  }

  close() {
    this.closeForm.emit(true)
  }
  customRegex(event: any) {
    console.log(event)
    const question = this.getQuestions.at(event) as UntypedFormGroup
    const customValidation = question?.controls['customValidation']
    if (event.selected === 'regex') {
      if (customValidation) {
        customValidation.setValidators([Validators.required])
        customValidation.updateValueAndValidity()
      }
    } else {
      if (customValidation) {
        customValidation.clearValidators()
        customValidation.updateValueAndValidity()
      }
    }
  }


}
