import AbstractView from './abstract-view.js';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration.js';

dayjs.extend(duration);

export default class TripPointView extends AbstractView {
  constructor(point, destinations, offersByType) {
    super();
    this._point = point;
    this._destinations = destinations;
    this._offersByType = offersByType;
    this._callback = {};
    this._handleEditClick = this._handleEditClick.bind(this);
    this._handleFavoriteClick = this._handleFavoriteClick.bind(this);
  }

  _getDestinationName() {
    const destination = this._destinations.find(d => d.id === this._point.destination);
    return destination ? destination.name : this._point.destination;
  }

  _getDestination() {
    return this._destinations.find(d => d.id === this._point.destination);
  }

  _formatDate(dateString) {
    if (!dateString) return '';
    return dayjs(dateString).format('MMM D');
  }

  _formatTime(dateString) {
    if (!dateString) return '';
    return dayjs(dateString).format('HH:mm');
  }

  _formatDuration(dateFrom, dateTo) {
    if (!dateFrom || !dateTo) return '';
    const diff = dayjs(dateTo).diff(dayjs(dateFrom));
    const dur = dayjs.duration(diff);
    
    const days = Math.floor(dur.asDays());
    const hours = dur.hours();
    const minutes = dur.minutes();
    
    if (days > 0) {
      return `${days}D ${hours.toString().padStart(2, '0')}H ${minutes.toString().padStart(2, '0')}M`;
    }
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}H ${minutes.toString().padStart(2, '0')}M`;
    }
    return `${minutes}M`;
  }

  _getSelectedOffers() {
    const offers = this._offersByType[this._point.type];
    if (!offers || !this._point.offers || this._point.offers.length === 0) return '';
    
    const selectedOfferTitles = offers
      .filter(offer => this._point.offers.includes(offer.id))
      .map(offer => offer.title);
    
    if (selectedOfferTitles.length === 0) return '';
    
    return `
      <div class="event__offer-selector">
        <p class="event__offer-title">Offers:</p>
        <p class="event__offer-text">${selectedOfferTitles.join(', ')}</p>
      </div>
    `;
  }

  _getTotalPrice() {
    let total = this._point.base_price;
    const offers = this._offersByType[this._point.type];
    
    if (offers && this._point.offers && this._point.offers.length > 0) {
      this._point.offers.forEach(offerId => {
        const offer = offers.find(o => o.id === offerId);
        if (offer) {
          total += offer.price;
        }
      });
    }
    return total;
  }

  getTemplate() {
    const destinationName = this._getDestinationName();
    const destination = this._getDestination();
    const date = this._formatDate(this._point.date_from);
    const startTime = this._formatTime(this._point.date_from);
    const endTime = this._formatTime(this._point.date_to);
    const duration = this._formatDuration(this._point.date_from, this._point.date_to);
    const totalPrice = this._getTotalPrice();
    const offersHtml = this._getSelectedOffers();
    
    return `
      <li class="trip-events__item">
        <div class="event">
          <time class="event__date" datetime="${this._point.date_from}">${date}</time>
          <div class="event__type">
            <img class="event__type-icon" width="42" height="42" src="img/icons/${this._point.type}.png" alt="Event type icon">
          </div>
          <div class="event__title">
            <h3 class="event__title">${this._point.type} to ${destinationName || this._point.destination}</h3>
          </div>
          <div class="event__schedule">
            <p class="event__time">
              ${startTime} — ${endTime}
            </p>
            <p class="event__duration">${duration}</p>
          </div>
          <p class="event__price">€ ${totalPrice}</p>
          <button class="event__favorite-btn ${this._point.is_favorite ? 'event__favorite-btn--active' : ''}" type="button">
            <span class="visually-hidden">Add to favorite</span>
            <svg class="event__favorite-icon" width="28" height="28" viewBox="0 0 28 28">
              <path d="M14 21l-8.228 4.326 1.572-9.163L.587 9.674l9.202-1.337L14 .5l4.211 7.837 9.202 1.337-6.757 6.489 1.572 9.163z"/>
            </svg>
          </button>
          <button class="event__rollup-btn" type="button">
            <span class="visually-hidden">Open event</span>
          </button>
        </div>
        ${offersHtml}
      </li>
    `;
  }

  _handleEditClick(evt) {
    evt.preventDefault();
    this._callback.editClick();
  }

  _handleFavoriteClick(evt) {
    evt.preventDefault();
    this._callback.favoriteClick();
  }

  setEditClickHandler(callback) {
    this._callback.editClick = callback;
    this.getElement().querySelector('.event__rollup-btn').addEventListener('click', this._handleEditClick);
  }

  setFavoriteClickHandler(callback) {
    this._callback.favoriteClick = callback;
    this.getElement().querySelector('.event__favorite-btn').addEventListener('click', this._handleFavoriteClick);
  }
}