# Import tables in correct order to avoid Foreign Key issues
from .travel_style_model import TravelStyle  # ✅ Users depend on TravelStyle
from .user_model import User  # ✅ Users must be defined before dependencies

from .place_model import Place  # ✅ Independent
from .itinerary_model import Itinerary  # ✅ Itineraries depend on Users
from .itinerary_detail_model import ItineraryDetail  # ✅ ItineraryDetails depend on Itineraries
from .shared_itinerary_model import SharedItinerary  # ✅ SharedItineraries depend on Itineraries

from .user_favorite_model import UserFavorite  # ✅ Depends on Users & Places
from .user_badge_model import UserBadge  # ✅ Depends on Users & Badges
from .badge_model import Badge  # ✅ Independent
from .api_cache_model import APICache  # ✅ Independent