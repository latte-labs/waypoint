# Import tables in the correct order to avoid Foreign Key issues
from .travel_style_model import TravelStyle  # ✅ Must be first (Users depend on it)
from .user_model import User  # ✅ Users depend on TravelStyle
from .place_model import Place
from .user_favorite_model import UserFavorite
from .itinerary_model import Itinerary  # ✅ Ensure this comes after User
from .itinerary_detail_model import ItineraryDetail
from .shared_itinerary_model import SharedItinerary
from .badge_model import Badge
from .user_badge_model import UserBadge
from .api_cache_model import APICache
from .quiz_model import QuizResult  # ✅ Include QuizResult to avoid missing references