import AbstractView from './abstract-view.js';

export default class TripListView extends AbstractView {
  getTemplate() {
    return '<ul class="trip-events__list"></ul>';
  }
}