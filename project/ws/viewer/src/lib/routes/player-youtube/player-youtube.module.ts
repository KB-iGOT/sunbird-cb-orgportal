import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { PlayerYoutubeComponent } from './player-youtube.component'

@NgModule({
    declarations: [PlayerYoutubeComponent],
    imports: [
        CommonModule,
    ],
    exports: [
        PlayerYoutubeComponent
    ]
})
export class PlayerYoutubeModule { }
