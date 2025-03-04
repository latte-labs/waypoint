import { StyleSheet } from 'react-native';

const InteractiveRecommendationsStyle = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  /* Map Styles */
  map: { width: '100%', height: 300 }, // Fixed height for map

  /* Filter Styles */
  filterContainer: { flexDirection: 'row', justifyContent: 'center', marginVertical: 10 },
  filterButton: { padding: 10, margin: 5, backgroundColor: '#ddd', borderRadius: 5 },
  selectedFilter: { backgroundColor: '#FF6F00' },
  filterText: { fontSize: 16 },

  /* Recommendations List Styles */
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 },
  card: { flexDirection: 'row', backgroundColor: '#f9f9f9', padding: 10, marginVertical: 5, borderRadius: 8 },
  image: { width: 80, height: 80, borderRadius: 8, marginRight: 10 },
  cardContent: { flex: 1 },
  cardTitle: { fontSize: 18, fontWeight: 'bold' },
  cardCategory: { fontSize: 14, color: 'gray' },
  cardRating: { fontSize: 14, color: '#FF6F00' },

  /* Zoom Controls */
  zoomControls: { position: 'absolute', bottom: 100, right: 20, flexDirection: 'column' },
  zoomButton: {
    backgroundColor: '#FF6F00',
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginVertical: 5,
    borderRadius: 5,
    alignItems: 'center',
  },
  zoomText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },

  /* Loading & Back Button */
  loading: { position: 'absolute', top: '50%', left: '50%', transform: [{ translateX: -25 }, { translateY: -25 }] },
  backButton: { position: 'absolute', bottom: 40, left: 20, backgroundColor: '#FF6F00', padding: 10, borderRadius: 5 },
  backButtonText: { color: '#fff', fontWeight: 'bold' },
});

export default InteractiveRecommendationsStyle
