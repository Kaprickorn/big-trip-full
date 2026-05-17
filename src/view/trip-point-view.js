import AbstractView from './abstract-view.js';
import { formatDuration, formatTime, formatDate } from '../utils/date-utils.js';

export default class TripPointView extends AbstractView {
  constructor(point) {
    super();
    this._point = point;
  }

  getTemplate() {
    return `
      <li class="trip-events__item">
        <div class="event">
          <time class="event__date" datetime="${this._point.dateFrom}">${formatDate(this._point.dateFrom)}</time>
          <div class="event__type">
            <img class="event__type-icon" width="42" height="42" src="img/icons/${this._point.type}.png" alt="Event type icon">
          </div>
          <div class="event__title">
            <h3 class="event__title">${this._point.type} to ${this._point.destinationName}</h3>
          </div>
          <div class="event__schedule">
            <p class="event__time">
              ${formatTime(this._point.dateFrom)} — ${formatTime(this._point.dateTo)}
            </p>
            <p class="event__duration">${formatDuration(this._point.dateFrom, this._point.dateTo)}</p>
          </div>
          <p class="event__price">€ ${this._point.basePrice}</p>
          <button class="event__favorite-btn ${this._point.isFavorite ? 'event__favorite-btn--active' : ''}" type="button">
            <span class="visually-hidden">Add to favorite</span>
            <svg class="event__favorite-icon" width="28" height="28" viewBox="0 0 28 28">
              <path d="M14 21l-8.228 4.326 1.572-9.163L.587 9.674l9.202-1.337L14 .5l4.211 7.837 9.202 1.337-6.757 6.489 1.572 9.163z"/>
            </svg>
          </button>
          <button class="event__rollup-btn" type="button">
            <span class="visually-hidden">Open event</span>
          </button>
        </div>
      </li>
    `;
  }
}