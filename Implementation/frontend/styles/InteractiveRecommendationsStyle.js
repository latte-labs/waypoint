import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

const InteractiveRecommendationsStyle = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  /* Map Styles */
  mapContainer: { width: '100%', height: height * 0.4 }, 
  map: { flex: 1 }, // Ensures map fills its container
  fullscreenMap: { position: 'absolute', top: 0, left: 0, width, height },

  /* Filter Styles */
  filterContainer: { flexDirection: 'row', justifyContent: 'center', marginVertical: 10, height: height * 0.05 },
  filterScrollContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    minWidth: "100%", 
    paddingHorizontal: 5, 
    paddingVertical: 2,  
    marginVertical: 0, 
    zIndex: 10,  
    minHeight: 40, 
    flexShrink: 1,  
},
  filterButton: { padding: 8, marginVertical: 5, marginHorizontal: 5, backgroundColor: '#ddd', borderRadius: 12 },
  selectedFilter: { backgroundColor: '#FF6F00' },
  filterText: { fontSize: 14, color: '#333' },

  /* Recommendations List Styles */
  listContainer: { width: '100%', paddingHorizontal: 10, height: height*0.29},
  card: { flexDirection: 'row', backgroundColor: '#f9f9f9', padding: 12, marginVertical: 6, borderRadius: 8, alignItems: 'center' },
  image: { width: 80, height: 80, borderRadius: 8, marginRight: 12 },
  cardContent: { flex: 1 },
  cardTitle: { fontSize: 16 },
  cardCategory: { fontSize: 14, color: 'gray' },
  cardRating: { fontSize: 14, color: '#FF6F00' },

  /* Zoom & Fullscreen Controls */
  zoomControls: { position: 'absolute', bottom: 80, right: 20, flexDirection: 'column', alignItems: 'center' },
  zoomButton: {
    backgroundColor: '#FF6F00',
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginVertical: 6,
    borderRadius: 4,
    alignItems: 'center',
  },
  fullscreenButton: {
    backgroundColor: '#FF6F00',
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 6,
    borderRadius: 4,
    alignItems: 'center',
  },
  zoomText: { color: '#fff', fontSize: 14 },

  /* Loading & Back Button */
  loading: { position: 'absolute', top: '50%', left: '50%', transform: [{ translateX: -25 }, { translateY: -25 }] },
  backButton: { position: 'absolute', bottom: 40, left: 20, backgroundColor: '#FF6F00', borderRadius: 8 },
  backButtonText: { color: '#fff', fontWeight: 'bold' },

  /* Zoom & Fullscreen Controls Placement */
  zoomControlsContainer: { position: 'absolute', bottom: 20, right: 20, flexDirection: 'column', alignItems: 'center' },

  warningBox: {
    backgroundColor: '#FFEB3B',
    padding: 10,
    marginHorizontal: 15,
    marginTop: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  warningText: {
      color: '#333',
      fontSize: 14,
      fontWeight: 'bold',
      textAlign: 'center',
  },

});



export default InteractiveRecommendationsStyle;
