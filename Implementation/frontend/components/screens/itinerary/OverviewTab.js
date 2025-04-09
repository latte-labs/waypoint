import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  ActivityIndicator,
  StyleSheet,
  Modal
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

const OverviewTab = ({
  loading,
  itinerary,
  imageUrl,
  selectedImage,
  selectImage,
  user,
  navigation,
  collaborators,
  totalItineraryCost,
  otherCosts,
  isOtherCostsModalVisible,
  setIsOtherCostsModalVisible,
  isNotesModalVisible,
  setIsNotesModalVisible,
  notesPreview,
  isPlacesModalVisible,
  setIsPlacesModalVisible,
  placesList,
  
}) => {
  const [infoModalVisible, setInfoModalVisible] = useState(false);
  const [infoModalText, setInfoModalText] = useState('');
  const handleInfoPress = (type) => {
    if (type === 'planned') {
      setInfoModalText(
        'Planned Budget is the total amount you aim to spend for your entire trip. It can include flights, stays, food, and more.\n\nTo change this amount, tap the "Edit" button on the itinerary screen.'
      );
    } else if (type === 'activities') {
      setInfoModalText(
        'Activities Cost is calculated automatically based on the individual activity costs added under each day of your itinerary.'
      );
    }
    setInfoModalVisible(true);
  };
  
  return (
    <ScrollView style={{ flex: 1 }}>
      <View style={{ flex: 1, backgroundColor: '#fff', paddingBottom: 80 }}>
        {loading ? (
          <ActivityIndicator size="large" color="#007bff" />
        ) : (
          <>
            {selectedImage || imageUrl ? (
              <ImageBackground
                source={{ uri: selectedImage || imageUrl }}
                style={{ width: '100%', height: 250, justifyContent: 'center', alignItems: 'center' }}
                imageStyle={{ width: '100%', height: '100%', resizeMode: 'cover' }}
              >
                <View style={{ ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0, 0, 0, 0.4)' }} />
                <TouchableOpacity style={{ position: 'absolute', top: 10, right: 10, padding: 10, zIndex: 3 }} onPress={selectImage}>
                  <Icon name="camera" size={16} color="#fff" />
                </TouchableOpacity>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', zIndex: 2 }}>
                  <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#fff' }}>{itinerary?.name}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                    <FontAwesome5 name="map-marker-alt" size={16} color="#fff" style={{ marginRight: 5, alignSelf: 'center', marginBottom: 8 }} />
                    <Text style={{ fontSize: 16, color: '#fff' }}>{itinerary?.destination}</Text>
                  </View>
                  {itinerary?.start_date && itinerary?.end_date && (
                    <Text style={{ fontSize: 16, color: '#fff', fontStyle: 'italic' }}>
                        {new Date(itinerary.start_date).toLocaleDateString('en-US', {
                        weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
                        })} - {new Date(itinerary.end_date).toLocaleDateString('en-US', {
                        weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
                        })}
                    </Text>
                    )}

                </View>
              </ImageBackground>
            ) : (
              <View style={{ width: '100%', height: 250, justifyContent: 'center', alignItems: 'center' }}>
                <TouchableOpacity style={{ position: 'absolute', top: 10, right: 10, padding: 10, zIndex: 3 }} onPress={selectImage}>
                  <Icon name="camera" size={24} color="#007bff" />
                </TouchableOpacity>
                <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#007bff' }}>{itinerary?.name}</Text>
                <Text style={{ fontSize: 16, color: '#333' }}>{itinerary?.destination}</Text>
                {itinerary?.start_date && itinerary?.end_date && (
                <Text style={{ fontSize: 16, color: '#666', fontStyle: 'italic' }}>
                    {new Date(itinerary.start_date).toLocaleDateString('en-US', {
                    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
                    })} - {new Date(itinerary.end_date).toLocaleDateString('en-US', {
                    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
                    })}
                </Text>
                )}
              </View>
            )}

            {/* Collaborators */}
            <View style={{ marginTop: 10, paddingHorizontal: 10 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#007bff', marginBottom: 10 }}>Collaborators</Text>
                {user?.id === itinerary?.created_by && (
                  <TouchableOpacity onPress={() => navigation.navigate('InviteCollaborators', { itinerary })}>
                    <FontAwesome5 name="pencil-alt" size={14} color="#007bff" style={{ marginLeft: 10, alignSelf: 'center', marginBottom: 10 }} />
                  </TouchableOpacity>
                )}
              </View>
              {collaborators.length > 0 ? (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ flexDirection: 'row', alignItems: 'center' }}>
                  {collaborators.map((collab) => (
                    <View key={collab.userId} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#eef7ff', padding: 8, borderRadius: 5, marginRight: 10, marginBottom: 10, minWidth: 100, justifyContent: 'center' }}>
                      <Icon name="user" size={16} color="#007bff" style={{ marginRight: 5 }} />
                      <Text style={{ fontSize: 12, color: '#007bff' }}>{collab.name}</Text>
                    </View>
                  ))}
                </ScrollView>
              ) : (
                <Text style={{ fontSize: 16, color: '#888', fontStyle: 'italic', textAlign: 'center' }}>No collaborators yet.</Text>
              )}
            </View>

            {/* Budget Section - Grid Style */}
            <View style={{ marginTop: 20, paddingHorizontal: 10 }}>
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#007bff', marginBottom: 10 }}>
                Budget Breakdown
              </Text>

              {/* Planned Budget - full width */}
              <TouchableOpacity
                activeOpacity={1}
                style={[styles.carouselCard, { width: '100%' }]}
              >
              <View style={{ marginBottom: 5 }}>
                <TouchableOpacity
                  onPress={() => handleInfoPress('planned')}
                  style={{ flexDirection: 'row', alignItems: 'center' }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.budgetLabel}>Planned Budget</Text>
                  <Icon name="info-circle" size={14} color="#007bff" style={{ marginLeft: 6 }} />
                </TouchableOpacity>
              </View>

                <Text style={styles.budgetAmount}>
                  {itinerary?.budget ? `$${itinerary.budget.toLocaleString()}` : 'N/A'}
                </Text>
              </TouchableOpacity>

              {/* Activities + Planned Expenses - side by side */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }}>
                {[
                  {
                    label: 'Activities Cost',
                    value: totalItineraryCost ? `$${totalItineraryCost.toLocaleString()}` : 'N/A',
                    interactive: false,
                    infoType: 'activities',
                  },
                  {
                    label: 'Planned Expenses',
                    value:
                      otherCosts.length > 0
                        ? `$${otherCosts.reduce((sum, cost) => sum + parseFloat(cost.amount), 0).toLocaleString()}`
                        : 'N/A',
                    interactive: true,
                  },
                ].map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    activeOpacity={item.interactive ? 0.85 : 1}
                    style={[styles.carouselCard, { width: '48%' }]}
                    onPress={() => {
                      if (item.interactive) setIsOtherCostsModalVisible(true);
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
                      {item.label === 'Activities Cost' ? (
                        <TouchableOpacity
                          onPress={() => handleInfoPress(item.infoType)}
                          style={{ flexDirection: 'row', alignItems: 'center' }}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.budgetLabel}>{item.label}</Text>
                          <Icon name="info-circle" size={14} color="#007bff" style={{ marginLeft: 6 }} />
                        </TouchableOpacity>
                      ) : (
                        <Text style={styles.budgetLabel}>{item.label}</Text>
                      )}

                      {item.interactive && (
                        <FontAwesome5
                          name="pencil-alt"
                          size={12}
                          color="#007bff"
                          style={{ marginLeft: 10, alignSelf: 'center', marginBottom: 10 }}
                        />
                      )}
                    </View>
                    <Text style={styles.budgetAmount}>{item.value}</Text>
                  </TouchableOpacity>
                ))}
              </View>


            </View>

            {/* Notes Panel */}
            <View style={{ marginTop: 20, paddingHorizontal: 10 }}>
            <TouchableOpacity
                onPress={() => setIsNotesModalVisible(true)}
                activeOpacity={1}
                style={{ backgroundColor: '#f9f9f9', borderRadius: 10, padding: 15, minHeight: 96, borderWidth: 1, borderColor: '#ddd' }}
            >
                <Text style={{ fontSize: 14, color: '#007bff', fontWeight: 'bold', marginBottom: 5 }}>Notes</Text>
                <ScrollView style={{ maxHeight: 180 }} nestedScrollEnabled={true}>
                {notesPreview.trim() ? (
                    <Text style={{ fontSize: 14, color: '#555' }}>{notesPreview}</Text>
                ) : (
                    <Text style={{ fontSize: 14, color: '#888', fontStyle: 'italic' }}>Tap to add notes</Text>
                )}
                </ScrollView>
            </TouchableOpacity>
            </View>

            {/* Places Panel */}
            <View style={{ marginTop: 20, paddingHorizontal: 10 }}>
            <TouchableOpacity
                onPress={() => setIsPlacesModalVisible(true)}
                activeOpacity={0.9}
                style={{ backgroundColor: '#f9f9f9', borderRadius: 10, padding: 15, minHeight: 96, borderWidth: 1, borderColor: '#ddd' }}
            >
                <Text style={{ fontSize: 14, color: '#007bff', fontWeight: 'bold', marginBottom: 5 }}>Places to Visit</Text>
                <View>
                {placesList.length > 0 ? (
                    placesList.map((place, index) => (
                    <Text key={index} style={{ fontSize: 14, color: '#555', marginBottom: 3 }}>• {place}</Text>
                    ))
                ) : (
                    <Text style={{ fontSize: 14, color: '#888', fontStyle: 'italic' }}>Tap to add places</Text>
                )}
                </View>
            </TouchableOpacity>
            </View>


          </>
        )}
      </View>
      <Modal
        visible={infoModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setInfoModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalText}>{infoModalText}</Text>
            <TouchableOpacity
              onPress={() => setInfoModalVisible(false)}
              style={styles.modalButton}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>Got it</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </ScrollView>
  );
};
const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E3A8A',
    marginBottom: 10,
  },
  budgetCard: {
    backgroundColor: '#eef7ff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#cde0ff',
  },
  budgetLabel: {
    fontSize: 14,
    color: '#007bff',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  budgetAmount: {
    fontSize: 36,
    fontWeight: '600',
    color: '#222',
  },
  carouselCard: {
    backgroundColor: '#dbeafe',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#93c5fd',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    height: 110,
    paddingHorizontal: 10, // optional for text spacing
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    width: '80%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  modalText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButton: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  
   
}

)
export default OverviewTab;
