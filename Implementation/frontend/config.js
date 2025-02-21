const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://waypoint-travel-781359a5fe6a.herokuapp.com'
  : 'http://localhost:8000';

// export default API_BASE_URL;

// Use this to run on production environment, comment this out.
//const API_BASE_URL = 'https://waypoint-travel-781359a5fe6a.herokuapp.com';
export default API_BASE_URL;
