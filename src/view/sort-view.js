import AbstractView from './abstract-view.js';

export default class SortView extends AbstractView {
  getTemplate() {
    return `
      <form class="trip-events__trip-sort  trip-sort" action="#" method="get">
        <div class="trip-sort__item  trip-sort__item--day">
          <input id="sort-day" class="trip-sort__input  visually-hidden" type="radio" name="trip-sort" value="day" checked>
          <label class="trip-sort__btn" for="sort-day">Day</label>
        </div>
        <div class="trip-sort__item  trip-sort__item--event">
          <input id="sort-event" class="trip-sort__input  visually-hidden" type="radio" name="trip-sort" value="event" disabled>
          <label class="trip-sort__btn" for="sort-event">Event</label>
        </div>
        <div class="trip-sort__item  trip-sort__item--time">
          <input id="sort-time" class="trip-sort__input  visually-hidden" type="radio" name="trip-sort" value="time">
          <label class="trip-sort__btn" for="sort-time">Time</label>
        </div>
        <div class="trip-sort__item  trip-sort__item--price">
          <input id="sort-price" class="trip-sort__input  visually-hidden" type="radio" name="trip-sort" value="price">
          <label class="trip-sort__btn" for="sort-price">Price</label>
        </div>
        <div class="trip-sort__item  trip-sort__item--offers">
          <input id="sort-offers" class="trip-sort__input  visually-hidden" type="radio" name="trip-sort" value="offers" disabled>
          <label class="trip-sort__btn" for="sort-offers">Offers</label>
        </div>
      </form>
    `;
  }
}