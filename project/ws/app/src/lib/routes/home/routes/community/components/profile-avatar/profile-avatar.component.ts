import { Component, Input } from '@angular/core'

@Component({
  selector: 'ws-app-profile-avatar',
  templateUrl: './profile-avatar.component.html',
  styleUrls: ['./profile-avatar.component.scss']
})
export class ProfileAvatarComponent {

  @Input()
  public photoUrl!: string
  @Input() color = ''
  @Input()
  public name!: string
  @Input() public size = ''
  random = Math.random().toString(36).slice(2)
  public showInitials = false
  public circleColor!: string
  @Input() initials?: string
  @Input() datalen: any
  @Input() randomColor = false

  private colors = [
    '#EB7181', // red
    '#306933', // green
    '#000000', // black
    '#3670B2', // blue
    '#4E9E87',
    '#7E4C8D',
  ]

  private randomcolors = [
    '#EB7181', // red
    '#006400', // green
    '#000000', // black
    '#3670B2', // blue
    '#4E9E87',
    '#7E4C8D',
  ]

  ngOnInit() {
    console.log(this.name, 'name=')
    if (!this.photoUrl || !(this.photoUrl.startsWith('http://') || this.photoUrl.startsWith('https://'))) {
      this.showInitials = true
      if (!this.initials) {
        this.createInititals()
      }
      if (this.datalen === 1) {
        this.randomcolors = [
          '#006400', // green
        ]
      }
      const randomIndex = Math.floor(Math.random() * Math.floor(this.colors.length))
      this.circleColor = this.colors[randomIndex]
      if (this.randomColor) {
        const randomIndex1 = Math.floor(Math.random() * Math.floor(this.randomcolors.length))
        this.circleColor = this.randomcolors[randomIndex1]
      }
    }
  }

  private createInititals(): void {
    let initials = ''
    const array = `${this.name} `.toString().split(' ')
    if (array[0] !== 'undefined' && typeof array[1] !== 'undefined') {
      initials += array[0].charAt(0)
      initials += array[1].charAt(0)
    } else {
      for (let i = 0; i < this.name.length; i += 1) {
        if (this.name.charAt(i) === ' ') {
          continue
        }

        if (this.name.charAt(i) === this.name.charAt(i)) {
          initials += this.name.charAt(i)

          if (initials.length === 2) {
            break
          }
        }
      }
    }
    this.initials = initials.toUpperCase()
  }

  changeToDefaultImg($event: any) {
    $event.target.src = '/assets/instances/eagle/app_logos/default.png'
  }
}
