import { render } from '../render.js';
import FiltersView from '../view/filters-view.js';
import SortView from '../view/sort-view.js';
import TripListView from '../view/trip-list-view.js';
import TripPointView from '../view/trip-point-view.js';
import CreateFormView from '../view/create-form-view.js';
import EditFormView from '../view/edit-form-view.js';

export default class TripPresenter {
  constructor(container, model) {
    this.container = container;
    this.model = model;
    this.filtersComponent = null;
    this.sortComponent = null;
    this.tripListComponent = null;
    this.points = [];
    this.filteredPoints = [];
    this.destinations = [];
    this.offersByType = {};
    this.isCreating = false;
    this.currentEditPoint = null;
    this.editFormComponent = null;
    this.createFormComponent = null;
    this.currentFilter = 'everything';
    this.currentSort = 'day';
    this.isLoading = true;
    
    this._handleModelEvent = this._handleModelEvent.bind(this);
  }

  init() {
    this.model.addObserver(this._handleModelEvent);
    this.renderFilters();
    this.renderSort();
    this.renderTripList();
    this.showLoading();
    this.initNewEventButton();
  }

  _handleModelEvent(event, data) {
    switch (event) {
      case 'init':
        this.points = data.points;
        this.destinations = data.destinations;
        this.offersByType = {};
        data.offers.forEach(offerGroup => {
          this.offersByType[offerGroup.type] = offerGroup.offers;
        });
        this.filterPoints();
        this.sortPoints();
        this.isLoading = false;
        this.renderPoints();
        break;
      case 'update':
        this.points = this.model.getPoints();
        this.filterPoints();
        this.sortPoints();
        this.renderPoints();
        break;
      case 'add':
        this.points = this.model.getPoints();
        this.filterPoints();
        this.sortPoints();
        this.renderPoints();
        break;
      case 'delete':
        this.points = this.model.getPoints();
        this.filterPoints();
        this.sortPoints();
        this.renderPoints();
        break;
      case 'error':
        this.showError();
        break;
    }
  }

  showLoading() {
    const listElement = this.tripListComponent.getElement();
    listElement.innerHTML = '<p class="trip-events__msg">Loading...</p>';
  }

  showError() {
    const listElement = this.tripListComponent.getElement();
    listElement.innerHTML = '<p class="trip-events__msg">Failed to load latest route information</p>';
  }

  renderFilters() {
    this.filtersComponent = new FiltersView();
    this.filtersComponent.setFilterChangeHandler((filterType) => {
      this.currentFilter = filterType;
      this.filterPoints();
      this.sortPoints();
      this.renderPoints();
    });

    const filtersContainer = this.container.querySelector('.trip-controls__filters');
    render(this.filtersComponent, filtersContainer);
  }

  renderSort() {
    this.sortComponent = new SortView();
    this.sortComponent.setSortChangeHandler((sortType) => {
      this.currentSort = sortType;
      this.sortPoints();
      this.renderPoints();
    });

    const eventsContainer = this.container.querySelector('.trip-events');
    render(this.sortComponent, eventsContainer);
  }

  renderTripList() {
    this.tripListComponent = new TripListView();
    const eventsContainer = this.container.querySelector('.trip-events');
    render(this.tripListComponent, eventsContainer);
  }

  filterPoints() {
    const now = new Date();
    
    switch (this.currentFilter) {
      case 'future':
        this.filteredPoints = this.points.filter(point => new Date(point.date_from) > now);
        break;
      case 'present':
        this.filteredPoints = this.points.filter(point => 
          new Date(point.date_from) <= now && new Date(point.date_to) >= now
        );
        break;
      case 'past':
        this.filteredPoints = this.points.filter(point => new Date(point.date_to) < now);
        break;
      default:
        this.filteredPoints = [...this.points];
    }
  }

  sortPoints() {
    switch (this.currentSort) {
      case 'time':
        this.filteredPoints.sort((a, b) => {
          const durationA = new Date(a.date_to) - new Date(a.date_from);
          const durationB = new Date(b.date_to) - new Date(b.date_from);
          return durationB - durationA;
        });
        break;
      case 'price':
        this.filteredPoints.sort((a, b) => b.base_price - a.base_price);
        break;
      default:
        this.filteredPoints.sort((a, b) => new Date(a.date_from) - new Date(b.date_from));
    }
  }

  renderPoints() {
    const listElement = this.tripListComponent.getElement();
    listElement.innerHTML = '';
    
    if (this.isLoading) {
      listElement.innerHTML = '<p class="trip-events__msg">Loading...</p>';
      return;
    }
    
    if (this.filteredPoints.length === 0) {
      let emptyMessage = 'Click New Event to create your first point';
      if (this.currentFilter === 'future') emptyMessage = 'There are no future events now';
      if (this.currentFilter === 'present') emptyMessage = 'There are no present events now';
      if (this.currentFilter === 'past') emptyMessage = 'There are no past events now';
      
      listElement.innerHTML = `<p class="trip-events__msg">${emptyMessage}</p>`;
      this.updateTotalPrice();
      return;
    }
    
    this.filteredPoints.forEach(point => {
      const pointComponent = new TripPointView(point, this.destinations, this.offersByType);
      
      pointComponent.setEditClickHandler(() => {
        this.closeCreateForm();
        this.showEditForm(point);
      });
      
      pointComponent.setFavoriteClickHandler(async () => {
        point.is_favorite = !point.is_favorite;
        try {
          await this.model.updatePoint(point);
        } catch (error) {
          point.is_favorite = !point.is_favorite;
          this.renderPoints();
        }
      });
      
      render(pointComponent, listElement);
    });
    
    this.updateTotalPrice();
  }

  updateTotalPrice() {
    let totalPriceElement = document.querySelector('.trip-info__cost-value');
    if (!totalPriceElement) {
      totalPriceElement = document.querySelector('.trip-main__cost-value');
    }
    if (!totalPriceElement) return;
    
    let total = 0;
    this.filteredPoints.forEach(point => {
      total += point.base_price;
      
      const offers = this.offersByType[point.type];
      if (offers && point.offers && point.offers.length > 0) {
        point.offers.forEach(offerId => {
          const offer = offers.find(o => o.id === offerId);
          if (offer) {
            total += offer.price;
          }
        });
      }
    });
    
    totalPriceElement.textContent = total;
  }

  initNewEventButton() {
    const newEventButton = this.container.querySelector('.trip-main__event-add-btn');
    if (!newEventButton) return;
    
    newEventButton.addEventListener('click', () => {
      this.closeEditForm();
      if (this.currentFilter !== 'everything') {
        this.currentFilter = 'everything';
        if (this.filtersComponent) {
          const everythingRadio = this.filtersComponent.getElement().querySelector('#filter-everything');
          if (everythingRadio) everythingRadio.checked = true;
        }
      }
      if (this.currentSort !== 'day') {
        this.currentSort = 'day';
        if (this.sortComponent) {
          const dayRadio = this.sortComponent.getElement().querySelector('#sort-day');
          if (dayRadio) dayRadio.checked = true;
        }
      }
      this.filterPoints();
      this.sortPoints();
      this.renderPoints();
      this.showCreateForm();
    });
  }

  showCreateForm() {
    if (this.isCreating) return;
    
    this.isCreating = true;
    const listElement = this.tripListComponent.getElement();
    
    const newEventButton = this.container.querySelector('.trip-main__event-add-btn');
    if (newEventButton) newEventButton.disabled = true;
    
    this.createFormComponent = new CreateFormView(this.destinations, this.offersByType);
    
    if (listElement.firstChild) {
      listElement.insertBefore(this.createFormComponent.getElement(), listElement.firstChild);
    } else {
      render(this.createFormComponent, listElement);
    }
    
    if (this.createFormComponent.initDatepickers) {
      this.createFormComponent.initDatepickers();
    }
    if (this.createFormComponent.initEventHandlers) {
      this.createFormComponent.initEventHandlers();
    }
    
    this.createFormComponent.setFormSubmitHandler(async (formData) => {
      await this.createPoint(formData);
    });
    
    this.createFormComponent.setCancelClickHandler(() => {
      this.closeCreateForm();
    });
  }

  showEditForm(point) {
    console.log('showEditForm вызван', point);
    if (this.currentEditPoint === point) return;
    
    this.closeCreateForm();
    
    if (this.editFormComponent) {
      this.editFormComponent.getElement().remove();
      this.editFormComponent.removeElement();
    }
    
    this.currentEditPoint = point;
    this.editFormComponent = new EditFormView(point, this.destinations, this.offersByType);
    
    const listElement = this.tripListComponent.getElement();
    const items = listElement.querySelectorAll('.trip-events__item');
    console.log('Найдено элементов в списке:', items.length);
    
    let targetItem = null;
    
    for (const item of items) {
      const title = item.querySelector('.event__title');
      console.log('Заголовок элемента:', title ? title.textContent : 'нет');
      if (title && title.textContent.includes(point.destination || '')) {
        targetItem = item;
        console.log('Найден целевой элемент!');
        break;
      }
    }
    
    if (targetItem) {
      console.log('Заменяем элемент на форму');
      targetItem.replaceWith(this.editFormComponent.getElement());
    } else {
      console.log('Элемент не найден, добавляем форму в начало списка');
      listElement.insertBefore(this.editFormComponent.getElement(), listElement.firstChild);
    }
    
    if (this.editFormComponent.initDatepickers) {
      this.editFormComponent.initDatepickers();
    }
    if (this.editFormComponent.initEventHandlers) {
      this.editFormComponent.initEventHandlers();
    }
    
    this.editFormComponent.setFormSubmitHandler(async (formData) => {
      await this.updatePoint(point, formData);
    });
    
    this.editFormComponent.setDeleteClickHandler(async () => {
      await this.deletePoint(point);
    });
    
    this.editFormComponent.setRollupClickHandler(() => {
      this.closeEditForm();
    });
  }

  async createPoint(formData) {
    const parseDate = (dateStr) => {
      if (!dateStr) return new Date().toISOString();
      const [day, month, year, hour, minute] = dateStr.split(/[\/ :]/);
      const date = new Date(Date.UTC(year, month - 1, day, hour, minute));
      return date.toISOString();
    };
    
    const destination = this.destinations.find(d => d.name === formData.destinationName);
    
    const newPoint = {
      base_price: parseInt(formData.basePrice, 10) || 0,
      date_from: parseDate(formData.dateFrom),
      date_to: parseDate(formData.dateTo),
      destination: destination ? destination.id : formData.destinationName,
      is_favorite: false,
      offers: formData.offers || [],
      type: formData.type
    };
    
    console.log('Отправляем точку:', newPoint);
    
    try {
      await this.model.addPoint(newPoint);
      this.closeCreateForm();
    } catch (error) {
      console.error('Ошибка создания:', error);
      const formElement = this.createFormComponent.getElement();
      formElement.style.animation = 'shake 0.5s';
      setTimeout(() => {
        formElement.style.animation = '';
      }, 500);
    }
  }

  async updatePoint(point, formData) {
    const parseDate = (dateStr) => {
      if (!dateStr) return new Date().toISOString();
      const [day, month, year, hour, minute] = dateStr.split(/[\/ :]/);
      const date = new Date(Date.UTC(year, month - 1, day, hour, minute));
      return date.toISOString();
    };
    
    const destination = this.destinations.find(d => d.name === formData.destinationName);
    
    const updatedPoint = {
      ...point,
      base_price: parseInt(formData.basePrice, 10) || 0,
      date_from: parseDate(formData.dateFrom),
      date_to: parseDate(formData.dateTo),
      destination: destination ? destination.id : formData.destinationName,
      offers: formData.offers || [],
      type: formData.type
    };
    
    console.log('Обновляем точку:', updatedPoint);
    
    try {
      await this.model.updatePoint(updatedPoint);
      this.closeEditForm();
    } catch (error) {
      console.error('Ошибка обновления:', error);
      const formElement = this.editFormComponent.getElement();
      formElement.style.animation = 'shake 0.5s';
      setTimeout(() => {
        formElement.style.animation = '';
      }, 500);
    }
  }

  async deletePoint(point) {
    try {
      await this.model.deletePoint(point.id);
      this.closeEditForm();
    } catch (error) {
      console.error('Ошибка удаления:', error);
      const formElement = this.editFormComponent.getElement();
      formElement.style.animation = 'shake 0.5s';
      setTimeout(() => {
        formElement.style.animation = '';
      }, 500);
    }
  }

  closeCreateForm() {
    if (!this.isCreating) return;
    
    if (this.createFormComponent) {
      this.createFormComponent.getElement().remove();
      this.createFormComponent.removeElement();
    }
    this.isCreating = false;
    
    const newEventButton = this.container.querySelector('.trip-main__event-add-btn');
    if (newEventButton) newEventButton.disabled = false;
  }

  closeEditForm() {
    if (!this.editFormComponent) return;
    
    this.editFormComponent.getElement().remove();
    this.editFormComponent.removeElement();
    this.editFormComponent = null;
    this.currentEditPoint = null;
    
    this.filterPoints();
    this.sortPoints();
    this.renderPoints();
  }
}