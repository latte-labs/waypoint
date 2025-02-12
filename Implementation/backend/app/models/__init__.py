# Import tables in correct order to avoid Foreign Key issues

from .travel_style_model import TravelStyle  # ✅ Must be first (Users depend on it)
from .user_model import User  # ✅ Users depend on TravelStyle
from .badge_model import Badge  # ✅ Users may also depend on badges
from .place_model import Place  # ✅ Places are independent

from .itinerary_model import Itinerary  # ✅ Itineraries depend on Users
from .itinerary_detail_model import ItineraryDetail  # ✅ ItineraryDetails depend on Itineraries
from .shared_itinerary_model import SharedItinerary  # ✅ SharedItineraries depend on Users & Itineraries

from .user_favorite_model import UserFavorite  # ✅ Depends on Users and Places
from .user_badge_model import UserBadge  # ✅ Depends on Users and Badges

from .api_cache_model import APICache  # ✅ Independent of other tables