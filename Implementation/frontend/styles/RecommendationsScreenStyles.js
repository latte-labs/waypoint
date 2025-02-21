import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 10 },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 },
  filterContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: 10 },
  filterButton: { padding: 10, margin: 5, backgroundColor: '#ddd', borderRadius: 5 },
  selectedFilter: { backgroundColor: '#FF6F00' },
  filterText: { fontSize: 16 },
  card: { flexDirection: 'row', backgroundColor: '#f9f9f9', padding: 10, marginVertical: 5, borderRadius: 8 },
  image: { width: 80, height: 80, borderRadius: 8, marginRight: 10 },
  cardContent: { flex: 1 },
  cardTitle: { fontSize: 18, fontWeight: 'bold' },
  cardCategory: { fontSize: 14, color: 'gray' },
  cardRating: { fontSize: 14, color: '#FF6F00' },
});
