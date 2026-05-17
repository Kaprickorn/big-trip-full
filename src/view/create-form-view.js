import AbstractView from './abstract-view.js';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';

export default class CreateFormView extends AbstractView {
  constructor(destinations, offersByType) {
    super();
    this._destinations = destinations;
    this._offersByType = offersByType;
    this._callback = {};
    this._datepickerFrom = null;
    this._datepickerTo = null;
    this._handleFormSubmit = this._handleFormSubmit.bind(this);
    this._handleCancelClick = this._handleCancelClick.bind(this);
    this._handleTypeChange = this._handleTypeChange.bind(this);
  }

  getTemplate() {
    const destinationOptions = this._getDestinationOptions();
    const offersHtml = this._getOffersSection('flight');
    
    return `
      <li class="trip-events__item">
        <form class="event event--edit" action="#" method="post">
          <header class="event__header">
            <div class="event__type-wrapper">
              <label class="event__type  event__type-btn" for="event-type-toggle-1">
                <span class="visually-hidden">Choose event type</span>
                <img class="event__type-icon" width="17" height="17" src="img/icons/flight.png" alt="Event type icon">
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
              <label class="event__label  event__type-output" for="event-destination-1">Flight</label>
              <input class="event__input  event__input--destination" id="event-destination-1" type="text" name="event-destination" value="" list="destination-list-1">
              <datalist id="destination-list-1">
                ${destinationOptions}
              </datalist>
            </div>
            <div class="event__field-group  event__field-group--time">
              <label class="visually-hidden">Time</label>
              <input class="event__input  event__input--time" id="start-time" type="text" name="event-start-time" value="">
              &mdash;
              <input class="event__input  event__input--time" id="end-time" type="text" name="event-end-time" value="">
            </div>
            <div class="event__field-group  event__field-group--price">
              <label class="event__label" for="event-price-1">
                <span class="visually-hidden">Price</span>
                €
              </label>
              <input class="event__input  event__input--price" id="event-price-1" type="text" name="event-price" value="0">
            </div>
            <button class="event__save-btn  btn  btn--blue" type="submit">Save</button>
            <button class="event__reset-btn" type="reset">Cancel</button>
          </header>
          <section class="event__details">
            ${offersHtml}
          </section>
        </form>
      </li>
    `;
  }

  _getTypeOptions() {
    const types = ['taxi', 'bus', 'train', 'ship', 'drive', 'flight', 'check-in', 'sightseeing', 'restaurant'];
    return types.map(type => `
      <div class="event__type-item">
        <input id="event-type-${type}-1" class="event__type-input  visually-hidden" type="radio" name="event-type" value="${type}" ${type === 'flight' ? 'checked' : ''}>
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

  _getOffersSection(type) {
    const offers = this._offersByType[type];
    if (!offers || offers.length === 0) {
      return '';
    }
    
    return `
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
        const newOffersHtml = this._getOffersSection(type);
        detailsSection.innerHTML = newOffersHtml;
      }
    }
  }

  _handleFormSubmit(evt) {
    evt.preventDefault();
    
    const selectedOffers = [];
    this.getElement().querySelectorAll('input[name="offer"]:checked').forEach(checkbox => {
      selectedOffers.push(checkbox.value);
    });
    
    const formData = {
      type: this.getElement().querySelector('input[name="event-type"]:checked').value,
      destinationName: this.getElement().querySelector('input[name="event-destination"]').value,
      dateFrom: this.getElement().querySelector('input[name="event-start-time"]').value,
      dateTo: this.getElement().querySelector('input[name="event-end-time"]').value,
      basePrice: parseInt(this.getElement().querySelector('input[name="event-price"]').value, 10),
      offers: selectedOffers
    };
    
    this._callback.formSubmit(formData);
  }

  _handleCancelClick(evt) {
    evt.preventDefault();
    this._callback.cancelClick();
  }

  setFormSubmitHandler(callback) {
    this._callback.formSubmit = callback;
    this.getElement().querySelector('form').addEventListener('submit', this._handleFormSubmit);
  }

  setCancelClickHandler(callback) {
    this._callback.cancelClick = callback;
    this.getElement().querySelector('.event__reset-btn').addEventListener('click', this._handleCancelClick);
  }

  initDatepickers() {
    const startDateInput = this.getElement().querySelector('#start-time');
    const endDateInput = this.getElement().querySelector('#end-time');
    
    if (startDateInput) {
      this._datepickerFrom = flatpickr(startDateInput, {
        enableTime: true,
        dateFormat: 'd/m/Y H:i',
        defaultDate: new Date(),
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
        defaultDate: new Date()
      });
    }
  }

  initEventHandlers() {
    this.getElement().querySelectorAll('input[name="event-type"]').forEach(input => {
      input.addEventListener('change', this._handleTypeChange);
    });
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