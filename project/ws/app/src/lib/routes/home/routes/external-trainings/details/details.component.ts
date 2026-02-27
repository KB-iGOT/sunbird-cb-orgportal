import { Component, OnInit } from '@angular/core'

@Component({
  selector: 'ws-app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss']
})
export class DetailsComponent implements OnInit {
  training: any = {}
  isTableExpanded = true
  listView = true
  competency_v6 = [
    {
      "competencyAreaIdentifier": "kcmfinal_fw_competencyarea_af8caa53-7f84-499e-86b2-e32e5b59908e",
      "competencyAreaRefId": "af8caa53-7f84-499e-86b2-e32e5b59908e",
      "competencyAreaName": "Functional",
      "competencyAreaDescription": "Functional competencies are common among many domains, cutting across MDOs, as well as roles and activities.",
      "competencyThemeIdentifier": "kcmfinal_fw_theme_dd31de2f-b32d-4629-9fb5-2d10fc36bd78",
      "competencyThemeRefId": "dd31de2f-b32d-4629-9fb5-2d10fc36bd78",
      "competencyThemeName": "Cabinet note preparation",
      "competencyThemeType": "theme",
      "competencyThemeDescription": "Cabinet note preparation competency Theme",
      "competencyThemeAdditionalProperties": {
        "displayName": "Cabinet note preparation",
        "timeStamp": 1724329043036
      },
      "competencySubThemeIdentifier": "kcmfinal_fw_subtheme_dceea913-aa36-461c-a140-f6ea86b8cb8c",
      "competencySubThemeRefId": "dceea913-aa36-461c-a140-f6ea86b8cb8c",
      "competencySubThemeName": "Cabinet note writing",
      "competencySubThemeDescription": "",
      "competencySubThemeAdditionalProperties": {
        "displayName": "Cabinet note writing",
        "timeStamp": 1724329232497
      }
    },
    {
      "competencyAreaIdentifier": "kcmfinal_fw_competencyarea_af8caa53-7f84-499e-86b2-e32e5b59908e",
      "competencyAreaRefId": "af8caa53-7f84-499e-86b2-e32e5b59908e",
      "competencyAreaName": "Functional",
      "competencyAreaDescription": "Functional competencies are common among many domains, cutting across MDOs, as well as roles and activities.",
      "competencyThemeIdentifier": "kcmfinal_fw_theme_72efbea5-46cf-4388-a943-2c1528e15abe",
      "competencyThemeRefId": "72efbea5-46cf-4388-a943-2c1528e15abe",
      "competencyThemeName": "Change Management",
      "competencyThemeType": "theme",
      "competencyThemeDescription": "Change Management competency Theme",
      "competencyThemeAdditionalProperties": {
        "displayName": "Change Management",
        "timeStamp": 1724677495550
      },
      "competencySubThemeIdentifier": "kcmfinal_fw_subtheme_c52de6ff-cd77-4028-9e08-a666073dbb14",
      "competencySubThemeRefId": "c52de6ff-cd77-4028-9e08-a666073dbb14",
      "competencySubThemeName": "Change Implementation",
      "competencySubThemeDescription": "Change Implementation Competency Sub-Theme",
      "competencySubThemeAdditionalProperties": {
        "displayName": "Change Implementation",
        "timeStamp": 1724765387059
      }
    },
    {
      "competencyAreaIdentifier": "kcmfinal_fw_competencyarea_af8caa53-7f84-499e-86b2-e32e5b59908e",
      "competencyAreaRefId": "af8caa53-7f84-499e-86b2-e32e5b59908e",
      "competencyAreaName": "Functional",
      "competencyAreaDescription": "Functional competencies are common among many domains, cutting across MDOs, as well as roles and activities.",
      "competencyThemeIdentifier": "kcmfinal_fw_theme_72efbea5-46cf-4388-a943-2c1528e15abe",
      "competencyThemeRefId": "72efbea5-46cf-4388-a943-2c1528e15abe",
      "competencyThemeName": "Change Management",
      "competencyThemeType": "theme",
      "competencyThemeDescription": "Change Management competency Theme",
      "competencyThemeAdditionalProperties": {
        "displayName": "Change Management",
        "timeStamp": 1724677495550
      },
      "competencySubThemeIdentifier": "kcmfinal_fw_subtheme_06de4d20-74c9-4368-955a-42fcff2d0d3a",
      "competencySubThemeRefId": "06de4d20-74c9-4368-955a-42fcff2d0d3a",
      "competencySubThemeName": "Change Impact Assessment",
      "competencySubThemeDescription": "Change Impact Assessment Competency Sub-Theme",
      "competencySubThemeAdditionalProperties": {
        "displayName": "Change Impact Assessment",
        "timeStamp": 1724765359078
      }
    },
    {
      "competencyAreaIdentifier": "kcmfinal_fw_competencyarea_af8caa53-7f84-499e-86b2-e32e5b59908e",
      "competencyAreaRefId": "af8caa53-7f84-499e-86b2-e32e5b59908e",
      "competencyAreaName": "Functional",
      "competencyAreaDescription": "Functional competencies are common among many domains, cutting across MDOs, as well as roles and activities.",
      "competencyThemeIdentifier": "kcmfinal_fw_theme_72efbea5-46cf-4388-a943-2c1528e15abe",
      "competencyThemeRefId": "72efbea5-46cf-4388-a943-2c1528e15abe",
      "competencyThemeName": "Change Management",
      "competencyThemeType": "theme",
      "competencyThemeDescription": "Change Management competency Theme",
      "competencyThemeAdditionalProperties": {
        "displayName": "Change Management",
        "timeStamp": 1724677495550
      },
      "competencySubThemeIdentifier": "kcmfinal_fw_subtheme_4f276c5d-4d7e-4087-84da-9f034f9b5858",
      "competencySubThemeRefId": "4f276c5d-4d7e-4087-84da-9f034f9b5858",
      "competencySubThemeName": "Change Readiness",
      "competencySubThemeDescription": "Change Readiness Competency Sub-Theme",
      "competencySubThemeAdditionalProperties": {
        "displayName": "Change Readiness",
        "timeStamp": 1724765337438
      }
    },
    {
      "competencyAreaIdentifier": "kcmfinal_fw_competencyarea_5ed3587a-2a9b-4e3c-8852-8ffcff5c70b2",
      "competencyAreaRefId": "5ed3587a-2a9b-4e3c-8852-8ffcff5c70b2",
      "competencyAreaName": "Behavioural",
      "competencyAreaDescription": "Behavioural competencies describe the key values and strengths that help an official perform effectively in a range of roles.",
      "competencyThemeIdentifier": "kcmfinal_fw_theme_b88dbaf8-99f8-45da-a4a7-5e23f9e1c001",
      "competencyThemeRefId": "b88dbaf8-99f8-45da-a4a7-5e23f9e1c001",
      "competencyThemeName": "Collaborative Leadership",
      "competencyThemeType": "theme",
      "competencyThemeDescription": "",
      "competencyThemeAdditionalProperties": {
        "displayName": "Collaborative Leadership",
        "timeStamp": 1724328741549
      },
      "competencySubThemeIdentifier": "kcmfinal_fw_subtheme_61c8ba58-0202-4f76-8fbd-c32bb6b3c952",
      "competencySubThemeRefId": "61c8ba58-0202-4f76-8fbd-c32bb6b3c952",
      "competencySubThemeName": "Conflict Management",
      "competencySubThemeDescription": "",
      "competencySubThemeAdditionalProperties": {
        "displayName": "Conflict Management",
        "timeStamp": 1724328873172
      }
    },
    {
      "competencyAreaIdentifier": "kcmfinal_fw_competencyarea_5ed3587a-2a9b-4e3c-8852-8ffcff5c70b2",
      "competencyAreaRefId": "5ed3587a-2a9b-4e3c-8852-8ffcff5c70b2",
      "competencyAreaName": "Behavioural",
      "competencyAreaDescription": "Behavioural competencies describe the key values and strengths that help an official perform effectively in a range of roles.",
      "competencyThemeIdentifier": "kcmfinal_fw_theme_b88dbaf8-99f8-45da-a4a7-5e23f9e1c001",
      "competencyThemeRefId": "b88dbaf8-99f8-45da-a4a7-5e23f9e1c001",
      "competencyThemeName": "Collaborative Leadership",
      "competencyThemeType": "theme",
      "competencyThemeDescription": "",
      "competencyThemeAdditionalProperties": {
        "displayName": "Collaborative Leadership",
        "timeStamp": 1724328741549
      },
      "competencySubThemeIdentifier": "kcmfinal_fw_subtheme_42a53028-112d-43e8-9726-2065b4d36257",
      "competencySubThemeRefId": "42a53028-112d-43e8-9726-2065b4d36257",
      "competencySubThemeName": "Influencing and Negotiation",
      "competencySubThemeDescription": "",
      "competencySubThemeAdditionalProperties": {
        "displayName": "Influencing and Negotiation",
        "timeStamp": 1724328873174
      }
    },
    {
      "competencyAreaIdentifier": "kcmfinal_fw_competencyarea_5ed3587a-2a9b-4e3c-8852-8ffcff5c70b2",
      "competencyAreaRefId": "5ed3587a-2a9b-4e3c-8852-8ffcff5c70b2",
      "competencyAreaName": "Behavioural",
      "competencyAreaDescription": "Behavioural competencies describe the key values and strengths that help an official perform effectively in a range of roles.",
      "competencyThemeIdentifier": "kcmfinal_fw_theme_00611299-a3a7-4079-bec6-f7aba0b89588",
      "competencyThemeRefId": "00611299-a3a7-4079-bec6-f7aba0b89588",
      "competencyThemeName": "Communication",
      "competencyThemeType": "theme",
      "competencyThemeDescription": "",
      "competencyThemeAdditionalProperties": {
        "displayName": "Communication",
        "timeStamp": 1724328741550
      },
      "competencySubThemeIdentifier": "kcmfinal_fw_subtheme_fbc4e950-e909-4325-a32b-456b08dae7ae",
      "competencySubThemeRefId": "fbc4e950-e909-4325-a32b-456b08dae7ae",
      "competencySubThemeName": "Presentation Skills",
      "competencySubThemeDescription": "",
      "competencySubThemeAdditionalProperties": {
        "displayName": "Presentation Skills",
        "timeStamp": 1724328843963
      }
    },
    {
      "competencyAreaIdentifier": "kcmfinal_fw_competencyarea_5ed3587a-2a9b-4e3c-8852-8ffcff5c70b2",
      "competencyAreaRefId": "5ed3587a-2a9b-4e3c-8852-8ffcff5c70b2",
      "competencyAreaName": "Behavioural",
      "competencyAreaDescription": "Behavioural competencies describe the key values and strengths that help an official perform effectively in a range of roles.",
      "competencyThemeIdentifier": "kcmfinal_fw_theme_00611299-a3a7-4079-bec6-f7aba0b89588",
      "competencyThemeRefId": "00611299-a3a7-4079-bec6-f7aba0b89588",
      "competencyThemeName": "Communication",
      "competencyThemeType": "theme",
      "competencyThemeDescription": "",
      "competencyThemeAdditionalProperties": {
        "displayName": "Communication",
        "timeStamp": 1724328741550
      },
      "competencySubThemeIdentifier": "kcmfinal_fw_subtheme_93d06da7-785c-422d-b5a9-00f3f84d4f9a",
      "competencySubThemeRefId": "93d06da7-785c-422d-b5a9-00f3f84d4f9a",
      "competencySubThemeName": "Reading & Comprehension",
      "competencySubThemeDescription": "",
      "competencySubThemeAdditionalProperties": {
        "displayName": "Reading & Comprehension",
        "timeStamp": 1724328843962
      }
    },
    {
      "competencyAreaIdentifier": "kcmfinal_fw_competencyarea_5ed3587a-2a9b-4e3c-8852-8ffcff5c70b2",
      "competencyAreaRefId": "5ed3587a-2a9b-4e3c-8852-8ffcff5c70b2",
      "competencyAreaName": "Behavioural",
      "competencyAreaDescription": "Behavioural competencies describe the key values and strengths that help an official perform effectively in a range of roles.",
      "competencyThemeIdentifier": "kcmfinal_fw_theme_00611299-a3a7-4079-bec6-f7aba0b89588",
      "competencyThemeRefId": "00611299-a3a7-4079-bec6-f7aba0b89588",
      "competencyThemeName": "Communication",
      "competencyThemeType": "theme",
      "competencyThemeDescription": "",
      "competencyThemeAdditionalProperties": {
        "displayName": "Communication",
        "timeStamp": 1724328741550
      },
      "competencySubThemeIdentifier": "kcmfinal_fw_subtheme_17e3ab30-b15a-4345-9540-157d144c3d73",
      "competencySubThemeRefId": "17e3ab30-b15a-4345-9540-157d144c3d73",
      "competencySubThemeName": "Verbal & Non-Verbal Fluency",
      "competencySubThemeDescription": "",
      "competencySubThemeAdditionalProperties": {
        "displayName": "Verbal & Non-Verbal Fluency",
        "timeStamp": 1724328843958
      }
    },
    {
      "competencyAreaIdentifier": "kcmfinal_fw_competencyarea_5ed3587a-2a9b-4e3c-8852-8ffcff5c70b2",
      "competencyAreaRefId": "5ed3587a-2a9b-4e3c-8852-8ffcff5c70b2",
      "competencyAreaName": "Behavioural",
      "competencyAreaDescription": "Behavioural competencies describe the key values and strengths that help an official perform effectively in a range of roles.",
      "competencyThemeIdentifier": "kcmfinal_fw_theme_50d7c626-a490-49e9-852b-9f94e12b8bd4",
      "competencyThemeRefId": "50d7c626-a490-49e9-852b-9f94e12b8bd4",
      "competencyThemeName": "Decision Making",
      "competencyThemeType": "theme",
      "competencyThemeDescription": "",
      "competencyThemeAdditionalProperties": {
        "displayName": "Decision Making",
        "timeStamp": 1724328741548
      },
      "competencySubThemeIdentifier": "kcmfinal_fw_subtheme_88ba564c-bead-4833-90ba-97c4d0b56822",
      "competencySubThemeRefId": "88ba564c-bead-4833-90ba-97c4d0b56822",
      "competencySubThemeName": "Logical Reasoning",
      "competencySubThemeDescription": "",
      "competencySubThemeAdditionalProperties": {
        "displayName": "Logical Reasoning",
        "timeStamp": 1724328903491
      }
    },
    {
      "competencyAreaIdentifier": "kcmfinal_fw_competencyarea_5ed3587a-2a9b-4e3c-8852-8ffcff5c70b2",
      "competencyAreaRefId": "5ed3587a-2a9b-4e3c-8852-8ffcff5c70b2",
      "competencyAreaName": "Behavioural",
      "competencyAreaDescription": "Behavioural competencies describe the key values and strengths that help an official perform effectively in a range of roles.",
      "competencyThemeIdentifier": "kcmfinal_fw_theme_50d7c626-a490-49e9-852b-9f94e12b8bd4",
      "competencyThemeRefId": "50d7c626-a490-49e9-852b-9f94e12b8bd4",
      "competencyThemeName": "Decision Making",
      "competencyThemeType": "theme",
      "competencyThemeDescription": "",
      "competencyThemeAdditionalProperties": {
        "displayName": "Decision Making",
        "timeStamp": 1724328741548
      },
      "competencySubThemeIdentifier": "kcmfinal_fw_subtheme_3e5f6964-138f-4c6e-9748-3983bbadb0c6",
      "competencySubThemeRefId": "3e5f6964-138f-4c6e-9748-3983bbadb0c6",
      "competencySubThemeName": "Sound Judgement",
      "competencySubThemeDescription": "",
      "competencySubThemeAdditionalProperties": {
        "displayName": "Sound Judgement",
        "timeStamp": 1724328903488
      }
    },
    {
      "competencyAreaIdentifier": "kcmfinal_fw_competencyarea_c527d0c7-ab6a-40d8-a06b-298fedc32b6c",
      "competencyAreaRefId": "c527d0c7-ab6a-40d8-a06b-298fedc32b6c",
      "competencyAreaName": "Domain",
      "competencyAreaDescription": "Domain competencies are defined for a specific domain (for example, the Ministry of Personnel or Department of Biotechnology) but that does not mean others will not need them.",
      "competencyThemeIdentifier": "kcmfinal_fw_theme_4453dfe3-4a0b-4022-a852-8607575438a4",
      "competencyThemeRefId": "4453dfe3-4a0b-4022-a852-8607575438a4",
      "competencyThemeName": ",Financial Statements Analysis",
      "competencyThemeType": "theme",
      "competencyThemeDescription": "Financial Statements Analysis competency Theme",
      "competencyThemeAdditionalProperties": {
        "displayName": ",Financial Statements Analysis",
        "timeStamp": 1724648584674
      },
      "competencySubThemeIdentifier": "kcmfinal_fw_subtheme_92b6dac9-9fe2-46c5-bcc6-16aa7c9b8088",
      "competencySubThemeRefId": "92b6dac9-9fe2-46c5-bcc6-16aa7c9b8088",
      "competencySubThemeName": ",Financial Statements Analysis",
      "competencySubThemeDescription": "Financial Statements Analysis competency Theme",
      "competencySubThemeAdditionalProperties": {
        "displayName": ",Financial Statements Analysis",
        "timeStamp": 1724686398031
      }
    },
    {
      "competencyAreaIdentifier": "kcmfinal_fw_competencyarea_c527d0c7-ab6a-40d8-a06b-298fedc32b6c",
      "competencyAreaRefId": "c527d0c7-ab6a-40d8-a06b-298fedc32b6c",
      "competencyAreaName": "Domain",
      "competencyAreaDescription": "Domain competencies are defined for a specific domain (for example, the Ministry of Personnel or Department of Biotechnology) but that does not mean others will not need them.",
      "competencyThemeIdentifier": "kcmfinal_fw_theme_0f6795a5-e8f8-429a-a719-a158d744ca95",
      "competencyThemeRefId": "0f6795a5-e8f8-429a-a719-a158d744ca95",
      "competencyThemeName": "Unit Load Devices Operations",
      "competencyThemeType": "theme",
      "competencyThemeDescription": "Unit Load Devices Operations competency Theme",
      "competencyThemeAdditionalProperties": {
        "displayName": "Unit Load Devices Operations",
        "timeStamp": 1724753477712
      },
      "competencySubThemeIdentifier": "kcmfinal_fw_subtheme_3d4223b3-94e5-4f16-aef7-862734510933",
      "competencySubThemeRefId": "3d4223b3-94e5-4f16-aef7-862734510933",
      "competencySubThemeName": "Unit Load Devices Operations",
      "competencySubThemeDescription": "Unit Load Devices Operations Competency Sub-Theme",
      "competencySubThemeAdditionalProperties": {
        "displayName": "Unit Load Devices Operations",
        "timeStamp": 1724753528020
      }
    },
    {
      "competencyAreaIdentifier": "kcmfinal_fw_competencyarea_c527d0c7-ab6a-40d8-a06b-298fedc32b6c",
      "competencyAreaRefId": "c527d0c7-ab6a-40d8-a06b-298fedc32b6c",
      "competencyAreaName": "Domain",
      "competencyAreaDescription": "Domain competencies are defined for a specific domain (for example, the Ministry of Personnel or Department of Biotechnology) but that does not mean others will not need them.",
      "competencyThemeIdentifier": "kcmfinal_fw_theme_8897ea58-3a4d-4887-8128-746da738054c",
      "competencyThemeRefId": "8897ea58-3a4d-4887-8128-746da738054c",
      "competencyThemeName": "Waste management and Resource Efficiency",
      "competencyThemeType": "theme",
      "competencyThemeDescription": "Waste management and Resource Efficiency competency Theme",
      "competencyThemeAdditionalProperties": {
        "displayName": "Waste management and Resource Efficiency",
        "timeStamp": 1724648432664
      },
      "competencySubThemeIdentifier": "kcmfinal_fw_subtheme_da54a6fe-7687-4d2e-87e4-420816149129",
      "competencySubThemeRefId": "da54a6fe-7687-4d2e-87e4-420816149129",
      "competencySubThemeName": "Waste management and Resource Efficiency",
      "competencySubThemeDescription": "Waste management and Resource Efficiency Competency Sub-Theme",
      "competencySubThemeAdditionalProperties": {
        "displayName": "Waste management and Resource Efficiency",
        "timeStamp": 1724753558725
      }
    }
  ]
  ngOnInit() {

    this.training = {
      title: 'Advanced Leadership Workshop',
      learningType: 'Leadership Development',
      deliveryMode: 'Hybrid / Instructor-Led',
      learningHours: '40 Hours',
      partnerName: 'Global Leadership Institute',
      learningObjective: 'The program is designed to enhance strategic thinking, high-stakes decision making, and team management skills. Participants will emerge with the ability to lead diverse organizational changes and build resilient corporate cultures.',
      certificateName: 'Jane Doe',
      competency_v6: this.competency_v6,
    }
  }

  get competenciesValue(): any[] {
    const control = this.training ? this.training.competency_v6 : null
    return (control && control.value) || []
  }

  get uniqueAreas(): string[] {
    if (!this.training?.competency_v6 || !this.training.competency_v6.length) {
      return []
    }

    return Array.from(new Set(
      this.training.competency_v6.map((comp: any) => comp.competencyAreaName),
    ))
  }

  getUniqueThemesForArea(areaName: string): string[] {
    if (!this.training?.competency_v6 || !this.training.competency_v6.length) {
      return []
    }

    const themesForArea = this.training.competency_v6
      .filter((comp: any) => comp.competencyAreaName === areaName)
      .map((comp: any) => comp.competencyThemeName)

    return Array.from(new Set(themesForArea))
  }

  getSubthemesForAreaAndTheme(areaName: string, themeName: string): string[] {
    if (!this.training?.competency_v6 || !this.training.competency_v6.length) {
      return []
    }

    return this.training.competency_v6
      .filter((comp: any) =>
        comp.competencyAreaName === areaName &&
        comp.competencyThemeName === themeName,
      )
      .map((comp: any) => comp.competencySubThemeName)
  }

  getTotalRowsForArea(areaName: string): number {
    let totalRows = 0
    for (const theme of this.getUniqueThemesForArea(areaName)) {
      totalRows += this.getSubthemesForAreaAndTheme(areaName, theme).length
    }
    return totalRows
  }
}
