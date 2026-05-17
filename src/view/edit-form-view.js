import AbstractView from './abstract-view.js';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';

export default class EditFormView extends AbstractView {
  constructor(point = null, destinations = [], offers = []) {
    super();
    this._point = point;
    this._destinations = destinations;
    this._offers = offers;
    this._datepickerFrom = null;
    this._datepickerTo = null;
    this._handleFormSubmit = this._handleFormSubmit.bind(this);
    this._handleDeleteClick = this._handleDeleteClick.bind(this);
    this._handleRollupClick = this._handleRollupClick.bind(this);
  }

  getTemplate() {
    const point = this._point || {
      type: 'flight',
      destination: '',
      destinationName: '',
      dateFrom: '',
      dateTo: '',
      basePrice: 0,
      offers: []
    };
    
    return `
      <li class="trip-events__item">
        <form class="event event--edit" action="#" method="post">
          <header class="event__header">
            <div class="event__type-wrapper">
              <label class="event__type  event__type-btn" for="event-type-toggle-1">
                <span class="visually-hidden">Choose event type</span>
                <img class="event__type-icon" width="17" height="17" src="img/icons/${point.type}.png" alt="Event type icon">
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
              <label class="event__label  event__type-output" for="event-destination-1">${point.type}</label>
              <input class="event__input  event__input--destination" id="event-destination-1" type="text" name="event-destination" value="${point.destinationName}" list="destination-list-1">
              <datalist id="destination-list-1">
                ${this._getDestinationOptions()}
              </datalist>
            </div>
            
            <div class="event__field-group  event__field-group--time">
              <label class="visually-hidden">Time</label>
              <input class="event__input  event__input--time" type="text" name="event-start-time" value="${this._formatDateForInput(point.dateFrom)}">
              &mdash;
              <input class="event__input  event__input--time" type="text" name="event-end-time" value="${this._formatDateForInput(point.dateTo)}">
            </div>
            
            <div class="event__field-group  event__field-group--price">
              <label class="event__label" for="event-price-1">
                <span class="visually-hidden">Price</span>
                €
              </label>
              <input class="event__input  event__input--price" id="event-price-1" type="text" name="event-price" value="${point.basePrice}">
            </div>
            
            <button class="event__save-btn  btn  btn--blue" type="submit">Save</button>
            <button class="event__reset-btn" type="reset">${this._point ? 'Delete' : 'Cancel'}</button>
            <button class="event__rollup-btn" type="button">
              <span class="visually-hidden">Open event</span>
            </button>
          </header>
          
          <section class="event__details">
            ${this._getOffersSection()}
          </section>
        </form>
      </li>
    `;
  }

  _getTypeOptions() {
    const types = ['taxi', 'bus', 'train', 'ship', 'drive', 'flight', 'check-in', 'sightseeing', 'restaurant'];
    return types.map(type => `
      <div class="event__type-item">
        <input id="event-type-${type}-1" class="event__type-input  visually-hidden" type="radio" name="event-type" value="${type}" ${this._point?.type === type ? 'checked' : ''}>
        <label class="event__type-label  event__type-label--${type}" for="event-type-${type}-1">${type}</label>
      </div>
    `).join('');
  }

  _getDestinationOptions() {
    return this._destinations.map(dest => `<option value="${dest}"></option>`).join('');
  }

  _getOffersSection() {
    // Упрощённая версия — позже добавим полную
    return `
      <section class="event__section  event__section--offers">
        <h3 class="event__section-title  event__section-title--offers">Offers</h3>
        <div class="event__available-offers">
          <!-- Здесь будут опции -->
        </div>
      </section>
    `;
  }

  _formatDateForInput(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).replace(',', '');
  }

  _handleFormSubmit(evt) {
    evt.preventDefault();
    this._callback.formSubmit();
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
    const startDateInput = this.getElement().querySelector('input[name="event-start-time"]');
    const endDateInput = this.getElement().querySelector('input[name="event-end-time"]');
    
    if (startDateInput) {
      this._datepickerFrom = flatpickr(startDateInput, {
        enableTime: true,
        dateFormat: 'd/m/Y H:i',
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
        minDate: this._point?.dateFrom ? new Date(this._point.dateFrom) : null
      });
    }
  }
}