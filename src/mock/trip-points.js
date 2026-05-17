export const tripPoints = [
  {
    id: '1',
    type: 'flight',
    destination: 'Geneva',
    destinationName: 'Geneva',
    dateFrom: '2024-05-18T10:30:00',
    dateTo: '2024-05-18T12:30:00',
    basePrice: 150,
    isFavorite: true,
    offers: ['flight-luggage', 'flight-wifi']
  },
  {
    id: '2',
    type: 'drive',
    destination: 'Chamonix',
    destinationName: 'Chamonix',
    dateFrom: '2024-05-19T09:00:00',
    dateTo: '2024-05-19T11:00:00',
    basePrice: 80,
    isFavorite: false,
    offers: ['drive-gps']
  },
  {
    id: '3',
    type: 'check-in',
    destination: 'Hotel',
    destinationName: 'Intercontinental Hotel',
    dateFrom: '2024-05-20T14:00:00',
    dateTo: '2024-05-21T11:00:00',
    basePrice: 200,
    isFavorite: false,
    offers: ['checkin-breakfast']
  },
  {
    id: '4',
    type: 'train',
    destination: 'Paris',
    destinationName: 'Paris',
    dateFrom: '2024-05-22T08:00:00',
    dateTo: '2024-05-22T14:30:00',
    basePrice: 120,
    isFavorite: true,
    offers: ['train-business', 'train-meal']
  }
];