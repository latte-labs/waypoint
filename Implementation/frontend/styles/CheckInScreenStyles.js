import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  map: {
    flex: 1,
  },
  bottomCard: {
    position: 'absolute',
    minHeight: 125,
    bottom: 0,
    left: 0,
    right: 0,
    padding: 22,
    backgroundColor: '#FFF',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  placeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  placeCategory: {
    color: '#666',
    marginTop: 4,
  },
  checkInButton: {
    marginTop: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: 'green',
    borderRadius: 8,
    alignItems: 'center',
  },
  checkInButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: 'grey',
    opacity: 0.6,
  },
  disabledButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  refreshButton: {
    position: 'absolute',
    top: 80,
    right: 25,
    backgroundColor: '#D6E4FF',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  refreshButtonText: {
    color: '#1E3A8A',
  },
  gpsControlContainer: {
    position: 'absolute',
    top: 80,
    right: 20,
    flexDirection: 'row',
    gap: 10,
    zIndex: 10,
  },
  
  pillButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 24,
    paddingVertical: 8,
    paddingHorizontal: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  
  pillButtonText: {
    marginLeft: 6,
    color: '#1E3A8A',
    fontWeight: '500',
    fontSize: 13,
  },
  infoButtonContainer: {
    position: 'absolute',
    bottom: 150,
    right: 20,
    zIndex: 10,
  },
  
  
});

export default styles;
