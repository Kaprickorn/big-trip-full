import AbstractView from './abstract-view.js';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';

export default class EditFormView extends AbstractView {
  constructor(point, destinations, offersByType) {
    super();
    this._point = point;
    this._destinations = destinations;
    this._offersByType = offersByType;
    this._callback = {};
    this._datepickerFrom = null;
    this._datepickerTo = null;
    this._handleFormSubmit = this._handleFormSubmit.bind(this);
    this._handleDeleteClick = this._handleDeleteClick.bind(this);
    this._handleRollupClick = this._handleRollupClick.bind(this);
    this._handleTypeChange = this._handleTypeChange.bind(this);
    this._handleDestinationChange = this._handleDestinationChange.bind(this);
  }

  _getDestinationName() {
    const destination = this._destinations.find(d => d.id === this._point.destination);
    return destination ? destination.name : this._point.destination;
  }

  _getDestinationInfo() {
    const destination = this._destinations.find(d => d.id === this._point.destination);
    if (!destination || !destination.description) {
      return '';
    }
    
    const photosHtml = destination.pictures && destination.pictures.length > 0 
      ? `
        <div class="event__photos-container">
          <div class="event__photos-tape">
            ${destination.pictures.map(pic => `
              <img class="event__photo" src="${pic.src}" alt="${pic.description || destination.name}">
            `).join('')}
          </div>
        </div>
      `
      : '';
    
    return `
      <section class="event__section  event__section--destination">
        <h3 class="event__section-title  event__section-title--destination">Destination</h3>
        <p class="event__destination-description">${destination.description}</p>
        ${photosHtml}
      </section>
    `;
  }

  _getTypeOptions() {
    const types = ['taxi', 'bus', 'train', 'ship', 'drive', 'flight', 'check-in', 'sightseeing', 'restaurant'];
    return types.map(type => `
      <div class="event__type-item">
        <input id="event-type-${type}-1" class="event__type-input  visually-hidden" type="radio" name="event-type" value="${type}" ${this._point.type === type ? 'checked' : ''}>
        <label class="event__type-label  event__type-label--${type}" for="event-type-${type}-1">${type}</label>
      </div>
    `).join('');
  }

  _getDestinationOptions() {
    if (!this._destinations || this._destinations.length === 0) {
      return '<option value=""></option>';
    }
    return this._destinations.map(dest => `<option value="${dest.name}"></option>`).join('');
  }

  _getOffersSection() {
    const offers = this._offersByType[this._point.type];
    if (!offers || offers.length === 0) {
      return '';
    }
    
    return `
      <section class="event__section  event__section--offers">
        <h3 class="event__section-title  event__section-title--offers">Offers</h3>
        <div class="event__available-offers">
          ${offers.map(offer => `
            <div class="event__offer-selector">
              <input class="event__offer-checkbox  visually-hidden" id="offer-${offer.id}" type="checkbox" name="offer" value="${offer.id}" ${this._point.offers && this._point.offers.includes(offer.id) ? 'checked' : ''}>
              <label class="event__offer-label" for="offer-${offer.id}">
                <span class="event__offer-title">${offer.title}</span>
                &plus;&euro;&nbsp;
                <span class="event__offer-price">${offer.price}</span>
              </label>
            </div>
          `).join('')}
        </div>
      </section>
    `;
  }

  _formatDateForInput(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    }).replace(',', '');
  }

  getTemplate() {
    const destinationName = this._getDestinationName();
    const offersHtml = this._getOffersSection();
    const destinationInfoHtml = this._getDestinationInfo();
    const destinationOptions = this._getDestinationOptions();
    
    return `
      <li class="trip-events__item">
        <form class="event event--edit" action="#" method="post">
          <header class="event__header">
            <div class="event__type-wrapper">
              <label class="event__type  event__type-btn" for="event-type-toggle-1">
                <span class="visually-hidden">Choose event type</span>
                <img class="event__type-icon" width="17" height="17" src="img/icons/${this._point.type}.png" alt="Event type icon">
              </label>
              <input class="event__type-toggle  visually-hidden" id="event-type-toggle-1" type="checkbox">
              <div class="event__type-list">
                <fieldset class="event__type-group">
                  <legend class="visually-hidden">Event type</legend>
                  ${this._getTypeOptions()}
                </fieldset>
              </div>
            </div>
            <div class="event__field-group  event__field-group--destination">
              <label class="event__label  event__type-output" for="event-destination-1">${this._point.type}</label>
              <input class="event__input  event__input--destination" id="event-destination-1" type="text" name="event-destination" value="${destinationName}" list="destination-list-1">
              <datalist id="destination-list-1">
                ${destinationOptions}
              </datalist>
            </div>
            <div class="event__field-group  event__field-group--time">
              <label class="visually-hidden">Time</label>
              <input class="event__input  event__input--time" id="start-time" type="text" name="event-start-time" value="${this._formatDateForInput(this._point.date_from)}">
              &mdash;
              <input class="event__input  event__input--time" id="end-time" type="text" name="event-end-time" value="${this._formatDateForInput(this._point.date_to)}">
            </div>
            <div class="event__field-group  event__field-group--price">
              <label class="event__label" for="event-price-1">
                <span class="visually-hidden">Price</span>
                €
              </label>
              <input class="event__input  event__input--price" id="event-price-1" type="text" name="event-price" value="${this._point.base_price}">
            </div>
            <button class="event__save-btn  btn  btn--blue" type="submit">Save</button>
            <button class="event__reset-btn" type="reset">Delete</button>
            <button class="event__rollup-btn" type="button">
              <span class="visually-hidden">Open event</span>
            </button>
          </header>
          <section class="event__details">
            ${offersHtml}
            ${destinationInfoHtml}
          </section>
        </form>
      </li>
    `;
  }

  _handleTypeChange(evt) {
    if (evt.target.tagName === 'INPUT' && evt.target.name === 'event-type') {
      const type = evt.target.value;
      const typeIcon = this.getElement().querySelector('.event__type-icon');
      if (typeIcon) {
        typeIcon.src = `img/icons/${type}.png`;
      }
      const typeOutput = this.getElement().querySelector('.event__type-output');
      if (typeOutput) {
        typeOutput.textContent = type;
      }
      
      const detailsSection = this.getElement().querySelector('.event__details');
      if (detailsSection) {
        const offers = this._offersByType[type];
        let newOffersHtml = '';
        if (offers && offers.length > 0) {
          newOffersHtml = `
            <section class="event__section  event__section--offers">
              <h3 class="event__section-title  event__section-title--offers">Offers</h3>
              <div class="event__available-offers">
                ${offers.map(offer => `
                  <div class="event__offer-selector">
                    <input class="event__offer-checkbox  visually-hidden" id="offer-${offer.id}" type="checkbox" name="offer" value="${offer.id}">
                    <label class="event__offer-label" for="offer-${offer.id}">
                      <span class="event__offer-title">${offer.title}</span>
                      &plus;&euro;&nbsp;
                      <span class="event__offer-price">${offer.price}</span>
                    </label>
                  </div>
                `).join('')}
              </div>
            </section>
          `;
        }
        detailsSection.innerHTML = newOffersHtml;
      }
    }
  }

  _handleDestinationChange(evt) {
    const destinationName = evt.target.value;
    const destination = this._destinations.find(d => d.name === destinationName);
    
    const detailsSection = this.getElement().querySelector('.event__details');
    if (detailsSection && destination && destination.description) {
      const photosHtml = destination.pictures && destination.pictures.length > 0 
        ? `
          <div class="event__photos-container">
            <div class="event__photos-tape">
              ${destination.pictures.map(pic => `
                <img class="event__photo" src="${pic.src}" alt="${pic.description || destination.name}">
              `).join('')}
            </div>
          </div>
        `
        : '';
      
      const destinationInfoHtml = `
        <section class="event__section  event__section--destination">
          <h3 class="event__section-title  event__section-title--destination">Destination</h3>
          <p class="event__destination-description">${destination.description}</p>
          ${photosHtml}
        </section>
      `;
      detailsSection.innerHTML = destinationInfoHtml;
    }
  }

  _handleFormSubmit(evt) {
    evt.preventDefault();
    
    const selectedOffers = [];
    this.getElement().querySelectorAll('input[name="offer"]:checked').forEach(checkbox => {
      selectedOffers.push(checkbox.value);
    });
    
    const destinationName = this.getElement().querySelector('input[name="event-destination"]').value;
    const destination = this._destinations.find(d => d.name === destinationName);
    
    const formData = {
      type: this.getElement().querySelector('input[name="event-type"]:checked').value,
      destinationName: destinationName,
      destinationId: destination ? destination.id : null,
      dateFrom: this.getElement().querySelector('input[name="event-start-time"]').value,
      dateTo: this.getElement().querySelector('input[name="event-end-time"]').value,
      basePrice: parseInt(this.getElement().querySelector('input[name="event-price"]').value, 10),
      offers: selectedOffers
    };
    
    this._callback.formSubmit(formData);
  }

  _handleDeleteClick(evt) {
    evt.preventDefault();
    this._callback.deleteClick();
  }

  _handleRollupClick(evt) {
    evt.preventDefault();
    this._callback.rollupClick();
  }

  setFormSubmitHandler(callback) {
    this._callback.formSubmit = callback;
    this.getElement().querySelector('form').addEventListener('submit', this._handleFormSubmit);
  }

  setDeleteClickHandler(callback) {
    this._callback.deleteClick = callback;
    this.getElement().querySelector('.event__reset-btn').addEventListener('click', this._handleDeleteClick);
  }

  setRollupClickHandler(callback) {
    this._callback.rollupClick = callback;
    this.getElement().querySelector('.event__rollup-btn').addEventListener('click', this._handleRollupClick);
  }

  initDatepickers() {
    const startDateInput = this.getElement().querySelector('#start-time');
    const endDateInput = this.getElement().querySelector('#end-time');
    
    if (startDateInput) {
      this._datepickerFrom = flatpickr(startDateInput, {
        enableTime: true,
        dateFormat: 'd/m/Y H:i',
        defaultDate: this._point.date_from ? new Date(this._point.date_from) : new Date(),
        onChange: (selectedDates) => {
          if (this._datepickerTo && selectedDates[0]) {
            this._datepickerTo.set('minDate', selectedDates[0]);
          }
        }
      });
    }
    
    if (endDateInput) {
      this._datepickerTo = flatpickr(endDateInput, {
        enableTime: true,
        dateFormat: 'd/m/Y H:i',
        defaultDate: this._point.date_to ? new Date(this._point.date_to) : new Date(),
        minDate: this._point.date_from ? new Date(this._point.date_from) : null
      });
    }
  }

  initEventHandlers() {
    this.getElement().querySelectorAll('input[name="event-type"]').forEach(input => {
      input.addEventListener('change', this._handleTypeChange);
    });
    
    const destinationInput = this.getElement().querySelector('input[name="event-destination"]');
    if (destinationInput) {
      destinationInput.addEventListener('change', this._handleDestinationChange);
    }
  }

  removeElement() {
    if (this._datepickerFrom) {
      this._datepickerFrom.destroy();
      this._datepickerFrom = null;
    }
    if (this._datepickerTo) {
      this._datepickerTo.destroy();
      this._datepickerTo = null;
    }
    super.removeElement();
  }
}