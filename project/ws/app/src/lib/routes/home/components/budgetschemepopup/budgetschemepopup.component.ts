import { Component, OnInit, Inject } from '@angular/core'
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { preventHtmlAndJs } from '../../../validators/prevent-html-and-js.validator'

@Component({
    selector: 'ws-app-budgetschemepopup',
    templateUrl: './budgetschemepopup.component.html',
    styleUrls: ['./budgetschemepopup.component.scss'],
    standalone: false
})
export class BudgetschemepopupComponent implements OnInit {
  schemeform: UntypedFormGroup
  formInputData: any
  yearsList = []
  selectedYear: any
  allocatedbudget: any

  constructor(private dialogRef: MatDialogRef<BudgetschemepopupComponent>, @Inject(MAT_DIALOG_DATA) data: any) {
    this.schemeform = new UntypedFormGroup({
      budgetyear: new UntypedFormControl({ value: '', disabled: true }),
      schemename: new UntypedFormControl('', [Validators.required, preventHtmlAndJs()]),
      budgetallocated: new UntypedFormControl({ value: '', disabled: true }, [Validators.required]),
      budgetutilized: new UntypedFormControl('', [Validators.required, preventHtmlAndJs()]),
    })

    this.yearsList = data.yearlist
    this.selectedYear = data.selectedYear
    this.allocatedbudget = data.allocatedbudget
    this.schemeform.controls['budgetyear'].setValue(data.selectedYear)
    this.schemeform.controls['budgetallocated'].setValue(data.allocatedbudget)

    if (data.data) {
      this.formInputData = data.data
      this.schemeform.controls['schemename'].setValue(this.formInputData.schemeName)
      this.schemeform.controls['budgetutilized'].setValue(this.formInputData.trainingBudgetUtilization)
    }
  }

  ngOnInit() {
  }

  addsheme(form: any) {
    if (this.formInputData) {
      this.formInputData.budgetyear = this.selectedYear
      this.formInputData.schemename = this.schemeform.value.schemename
      this.formInputData.trainingBudgetAllocated = this.allocatedbudget
      this.formInputData.trainingBudgetUtilization = this.schemeform.value.budgetutilized
      this.dialogRef.close({ data: this.formInputData })
    } else {
      this.dialogRef.close({ data: form.value })
    }
  }

  // Only Integer Numbers
  keyPressNumbers(event: any) {
    const charCode = (event.which) ? event.which : event.keyCode
    // Only Numbers 0-9
    if ((charCode < 48 || charCode > 57)) {
      event.preventDefault()
      return false
    }
    return true
  }

}
