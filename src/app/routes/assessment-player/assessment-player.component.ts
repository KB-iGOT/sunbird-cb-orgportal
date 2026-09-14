import { Component } from '@angular/core'

/**
 * A bare page for the assessment player.
 *
 * The player normally lives under `app/home`, whose `HomeComponent` wraps every child in a
 * `mat-sidenav` holding the portal's left menu. The comprehensive assessment builder frames
 * the player inside one of its own steps, where that menu — and the player's own way back
 * out to the toc — are chrome the builder already provides around it.
 *
 * So the player is mounted here instead: the same `ViewerModule`, on a route that is not a
 * child of the home shell, in a component that renders nothing but the player itself.
 */
@Component({
  selector: 'ws-app-assessment-player',
  templateUrl: './assessment-player.component.html',
  styleUrls: ['./assessment-player.component.scss'],
  standalone: false,
})
export class AssessmentPlayerComponent { }
