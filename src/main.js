import TripPresenter from './presenter/trip-presenter.js';
import TripModel from './model/trip-model.js';
import ApiService from './api/api-service.js';

const apiService = new ApiService();
const tripModel = new TripModel(apiService);
const tripPresenter = new TripPresenter(document.body, tripModel);

tripPresenter.init();
tripModel.init().catch(() => {
  const errorMessage = document.createElement('p');
  errorMessage.textContent = 'Failed to load latest route information';
  errorMessage.style.textAlign = 'center';
  errorMessage.style.padding = '50px';
  document.body.appendChild(errorMessage);
});