const END_POINT = 'https://24.objects.htmlacademy.pro/big-trip';

// Генерируем более длинную случайную строку и кодируем в Base64
const generateAuthToken = () => {
  const randomPart = Math.random().toString(36).substring(2, 15);
  const randomPart2 = Math.random().toString(36).substring(2, 15);
  const combined = `${randomPart}${randomPart2}`;
  // Кодируем в Base64 для соответствия стандарту Basic Auth
  return btoa(combined);
};

const AUTHORIZATION = `Basic ${generateAuthToken()}`;

export default class ApiService {
  constructor() {
    this._endPoint = END_POINT;
    this._authorization = AUTHORIZATION;
    console.log('Authorization header:', this._authorization); // Для отладки
  }

  _load({ url, method = 'GET', body = null }) {
    const headers = new Headers();
    headers.append('Authorization', this._authorization);
    headers.append('Content-Type', 'application/json');

    return fetch(`${this._endPoint}/${url}`, { method, body, headers })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`${response.status}: ${response.statusText}`);
        }
        return response.json();
      })
      .catch((error) => {
        console.error('API Error:', error);
        throw error;
      });
  }

  getPoints() {
    return this._load({ url: 'points' });
  }

  getDestinations() {
    return this._load({ url: 'destinations' });
  }

  getOffers() {
    return this._load({ url: 'offers' });
  }

  updatePoint(point) {
    return this._load({
      url: `points/${point.id}`,
      method: 'PUT',
      body: JSON.stringify(point),
    });
  }

  addPoint(point) {
    return this._load({
      url: 'points',
      method: 'POST',
      body: JSON.stringify(point),
    });
  }

  deletePoint(pointId) {
    return this._load({
      url: `points/${pointId}`,
      method: 'DELETE',
    });
  }
}