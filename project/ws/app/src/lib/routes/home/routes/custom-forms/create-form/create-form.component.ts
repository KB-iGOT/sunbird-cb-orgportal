import { Component, OnInit } from '@angular/core'
import { FormArray, UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms'
import { preventHtmlAndJs } from '../../../../validators/prevent-html-and-js.validator'
import { Router } from '@angular/router'

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
      title: 'Master List',
      subTitle: 'Add fields in profile',
      type: 'masterList',
    },
    {
      icon: 'dashboard',
      title: 'Multi Master List',
      subTitle: 'Add fields in profile',
      type: 'multiMasterList',
    },
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

  constructor(private formBuilder: UntypedFormBuilder, private router: Router) {

  }

  ngOnInit() {
    this.createForm()
  }

  createForm() {
    this.customForm = this.formBuilder.group({
      //title: ['', [Validators.required, this.noWhitespaceValidator, preventHtmlAndJs()]],
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
    if (type === 'inputText') {
      this.addQuestion(type)
    } else if (type === 'masterList' || type === 'multiMasterList') {
      this.addQuestion(type)
      this.addQuestion(type)
    }
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
      isRequired: [false],
    })
    this.getQuestions.push(questionGroup)
    console.log(this.customForm.value)
  }

  onSave() {
    console.log(this.customForm.value)
    this.router.navigate(['/app/home/custom-forms'])
  }

  onCancel() {
    this.router.navigate(['/app/home/custom-forms'])
  }

}
