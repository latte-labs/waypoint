import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  ActivityIndicator,
  StyleSheet
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

              {/* Budget Panels */}
            <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10, marginLeft: 10 }}
            >
            <View style={{ width: 175, aspectRatio: 2.1, backgroundColor: '#eef7ff', justifyContent: 'center', alignItems: 'center', borderRadius: 10, padding: 10, marginRight: 10 }}>
                <Text style={{ fontSize: 14, color: '#007bff', fontWeight: 'bold', marginBottom: 5 }}>Budget</Text>
                <Text style={{ fontSize: 18, fontWeight: '600', color: '#222' }}>
                {itinerary?.budget ? `$${itinerary.budget.toLocaleString()}` : 'N/A'}
                </Text>
            </View>

            <View style={{ width: 175, aspectRatio: 2.1, backgroundColor: '#eef7ff', justifyContent: 'center', alignItems: 'center', borderRadius: 10, padding: 10, marginRight: 10 }}>
                <Text style={{ fontSize: 14, color: '#007bff', fontWeight: 'bold', marginBottom: 5 }}>Activities Cost</Text>
                <Text style={{ fontSize: 18, fontWeight: '600', color: '#222' }}>
                {totalItineraryCost ? `$${totalItineraryCost.toLocaleString()}` : 'N/A'}
                </Text>
            </View>

            <TouchableOpacity
                onPress={() => setIsOtherCostsModalVisible(true)}
                style={{ width: 175, aspectRatio: 2.1, backgroundColor: '#eef7ff', justifyContent: 'center', alignItems: 'center', borderRadius: 10, padding: 10, marginRight: 10 }}
            >
                <Text style={{ fontSize: 14, color: '#007bff', fontWeight: 'bold', marginBottom: 5 }}>Other Costs</Text>
                <Text style={{ fontSize: 18, fontWeight: '600', color: '#222' }}>
                {otherCosts.length > 0
                    ? `$${otherCosts.reduce((sum, cost) => sum + parseFloat(cost.amount), 0).toLocaleString()}`
                    : 'N/A'}
                </Text>
            </TouchableOpacity>
            </ScrollView>

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
    </ScrollView>
  );
};

export default OverviewTab;
