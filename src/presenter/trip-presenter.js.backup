import { render } from '../render.js';
import FiltersView from '../view/filters-view.js';
import SortView from '../view/sort-view.js';
import TripListView from '../view/trip-list-view.js';
import TripPointView from '../view/trip-point-view.js';
import { tripPoints } from '../mock/trip-points.js';

export default class TripPresenter {
  constructor(container) {
    this.container = container;
    this.filtersComponent = new FiltersView();
    this.sortComponent = new SortView();
    this.tripListComponent = new TripListView();
    this.points = [...tripPoints];
  }

  init() {
    // Рендерим фильтры
    const filtersContainer = this.container.querySelector('.trip-controls__filters');
    render(this.filtersComponent, filtersContainer);

    // Рендерим сортировку
    const eventsContainer = this.container.querySelector('.trip-events');
    render(this.sortComponent, eventsContainer);

    // Рендерим контейнер для списка
    render(this.tripListComponent, eventsContainer);

    // Рендерим все точки маршрута
    this.renderPoints();
  }

  renderPoints() {
    const listElement = this.tripListComponent.getElement();
    
    // Сортируем по дате (от старых к новым)
    const sortedPoints = [...this.points].sort((a, b) => new Date(a.dateFrom) - new Date(b.dateFrom));
    
    sortedPoints.forEach(point => {
      const pointComponent = new TripPointView(point);
      render(pointComponent, listElement);
    });
  }
}