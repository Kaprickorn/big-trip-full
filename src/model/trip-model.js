import ApiService from '../api/api-service.js';

export default class TripModel {
  constructor(apiService) {
    this._apiService = apiService;
    this._points = [];
    this._destinations = [];
    this._offers = [];
    this._observers = [];
  }

  addObserver(observer) {
    this._observers.push(observer);
  }

  _notifyObservers(event, data) {
    this._observers.forEach(observer => observer(event, data));
  }

  async init() {
    try {
      const [points, destinations, offers] = await Promise.all([
        this._apiService.getPoints(),
        this._apiService.getDestinations(),
        this._apiService.getOffers()
      ]);
      
      this._points = points;
      this._destinations = destinations;
      this._offers = offers;
      
      this._notifyObservers('init', { points: this._points, destinations: this._destinations, offers: this._offers });
    } catch (error) {
      this._notifyObservers('error', error);
      throw error;
    }
  }

  getPoints() {
    return this._points;
  }

  getDestinations() {
    return this._destinations;
  }

  getOffers() {
    return this._offers;
  }

  async updatePoint(point) {
    try {
      const updatedPoint = await this._apiService.updatePoint(point);
      const index = this._points.findIndex(p => p.id === point.id);
      if (index !== -1) {
        this._points[index] = updatedPoint;
      }
      this._notifyObservers('update', updatedPoint);
      return updatedPoint;
    } catch (error) {
      this._notifyObservers('error', error);
      throw error;
    }
  }

  async addPoint(point) {
    try {
      const newPoint = await this._apiService.addPoint(point);
      this._points.push(newPoint);
      this._notifyObservers('add', newPoint);
      return newPoint;
    } catch (error) {
      this._notifyObservers('error', error);
      throw error;
    }
  }

  async deletePoint(pointId) {
    try {
      await this._apiService.deletePoint(pointId);
      const index = this._points.findIndex(p => p.id === pointId);
      if (index !== -1) {
        this._points.splice(index, 1);
      }
      this._notifyObservers('delete', pointId);
    } catch (error) {
      this._notifyObservers('error', error);
      throw error;
    }
  }
}