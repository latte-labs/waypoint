import React, { useState, useEffect, useCallback } from 'react';
import { 
    View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet, Dimensions, Alert 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import API_BASE_URL from '../../../config';
import { database } from '../../../firebase';
import SafeAreaWrapper from '../SafeAreaWrapper';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import UserNameDisplay from '../../UserNameDisplay';
import Icon from 'react-native-vector-icons/FontAwesome';

const ItineraryListScreen = () => {
    const navigation = useNavigation();
    const [ownedItineraries, setOwnedItineraries] = useState([]);
    const [sharedItineraries, setSharedItineraries] = useState([]);
    const [pendingInvites, setPendingInvites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState(null);

    const [index, setIndex] = useState(0);
    const [routes] = useState([
        { key: 'personal', title: 'Personal' }, 
        { key: 'shared', title: 'Shared Itineraries' }  
    ]);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                console.log("🔄 Loading user data from AsyncStorage...");
                const storedUser = await AsyncStorage.getItem('user');
                if (!storedUser) {
                    console.error("❌ No user found in AsyncStorage!");
                    setLoading(false);
                    return;
                }

                const userData = JSON.parse(storedUser);
                setUserId(String(userData.id));

                console.log("📥 Fetching owned itineraries from PostgreSQL...");
                fetchOwnedItineraries(userData.id);
                fetchSharedItineraries(userData.id);
                fetchPendingInvites(userData.id);
            } catch (error) {
                console.error("❌ Error loading user data:", error);
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);

    // ✅ Fetch Owned Itineraries from PostgreSQL
    const fetchOwnedItineraries = async (userId) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/itineraries/users/${userId}/itineraries`);
            if (response.status === 200) {
                setOwnedItineraries(response.data);
            }
        } catch (error) {
            console.error("❌ Error fetching owned itineraries:", error.response?.data || error.message);
        } finally {
            setLoading(false);
        }
    };

    // ✅ Fetch Shared Itineraries from Firebase Realtime Database
    const fetchSharedItineraries = async (userId) => {
        try {
            const snapshot = await database().ref('/live_itineraries').once('value');
    
            if (!snapshot.exists()) {
                setSharedItineraries([]);
                return;
            }
    
            const data = snapshot.val();
            const itineraryIds = Object.keys(data).filter(itineraryId =>
                data[itineraryId].collaborators && data[itineraryId].collaborators[userId]
            );
    
            if (itineraryIds.length === 0) {
                setSharedItineraries([]);
                return;
            }
    
            // ✅ Fetch each itinerary from FastAPI
            const itineraryPromises = itineraryIds.map(async (itineraryId) => {
                try {
                    const response = await axios.get(`${API_BASE_URL}/itineraries/${itineraryId}`);
                    return response.status === 200 ? response.data : null;
                } catch (error) {
                    console.error(`❌ Error fetching itinerary ${itineraryId}:`, error.response?.data || error.message);
                    return null;
                }
            });
    
            const fullItineraries = (await Promise.all(itineraryPromises)).filter(Boolean);
            setSharedItineraries(fullItineraries);
            console.log("✅ Updated shared itineraries:", fullItineraries);
        } catch (error) {
            console.error("❌ Error fetching shared itineraries:", error.response?.data || error.message);
        }
    };
                
    // ✅ Fetch Pending Invitations from Firebase
    const fetchPendingInvites = (userId) => {
        database()
            .ref('/invitations/invitee')
            .child(userId)
            .on('value', (snapshot) => {
                if (snapshot.exists()) {
                    const invitesData = Object.values(snapshot.val());
                    setPendingInvites(invitesData);
                } else {
                    setPendingInvites([]);  // Clear the state if no invites exist
                }
            });
    };
    
    useFocusEffect(
        useCallback(() => {
            if (userId) {
                console.log("🔄 Refetching itineraries and invitations...");
                fetchOwnedItineraries(userId);
                fetchSharedItineraries(userId);
                fetchPendingInvites(userId);
            }
        }, [userId])  // ✅ Depend on `sharedItineraries` to trigger updates
    );

    const handleSelectItinerary = (itinerary) => {
        navigation.navigate('ItineraryDetail', { itineraryId: itinerary.id });
    };

    const handleAddItinerary = () => {
        navigation.navigate('ItineraryForm', { userId });
    };

    // ✅ Render Pending Invites List with Accept/Decline Buttons
    const renderInviteItem = ({ item }) => (
        <View style={styles.inviteCard}>
            <Text style={styles.inviteText}>
                {item.inviterName} ({item.inviterEmail}) invited you to plan {item.tripName}
            </Text>

            {/* ✅ Buttons for Accept/Decline */}
            <View style={styles.inviteButtonsContainer}>
            <TouchableOpacity 
                style={styles.acceptButton} 
                onPress={() => handleAcceptInvite(item)} // ✅ Pass invite data to the function
            >
                <Text style={styles.buttonText}>Accept</Text>
            </TouchableOpacity>

            <TouchableOpacity 
                style={styles.declineButton} 
                onPress={() => handleDeclineInvite(item)}
            >
                <Text style={styles.buttonText}>Decline</Text>
            </TouchableOpacity>
            </View>
        </View>
    );
    const getTimeAgo = (dateString) => {
        const now = new Date();
        // Append 'Z' if not already present to force UTC interpretation
        const normalizedDateString = dateString.endsWith('Z') ? dateString : dateString + 'Z';
        const updated = new Date(normalizedDateString);
        const diffSeconds = Math.floor((now - updated) / 1000);
        
        if (diffSeconds < 60) return 'Just now';
        
        const diffMinutes = Math.floor(diffSeconds / 60);
        if (diffMinutes < 60) return `${diffMinutes} mins ago`;
        
        const diffHours = Math.floor(diffMinutes / 60);
        if (diffHours < 24) return `${diffHours} hours ago`;
        
        const diffDays = Math.floor(diffHours / 24);
        return `${diffDays} days ago`;
      };
            

    // ✅ Render Shared Itinerary List
    const renderItineraryItem = ({ item }) => (
        <TouchableOpacity 
          style={styles.itineraryCard} 
          onPress={() => handleSelectItinerary(item)}
        >
          {item.name ? (
            <>
              <Text style={styles.itineraryName}>{item.name}</Text>
              <Text style={styles.itineraryDestination}>{item.destination}</Text>
              <Text style={styles.itineraryDate}>
                {new Date(item.start_date).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })} 
                - 
                {new Date(item.end_date).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
              </Text>
              {item.updated_at && (
                <Text style={styles.lastUpdated}>
                    Last Updated: {getTimeAgo(item.updated_at || item.created_at)} by <UserNameDisplay userId={item.last_updated_by} />
                </Text>
              )}
            </>
          ) : (
            <>
              <Text style={styles.itineraryName}>Shared Itinerary</Text>
              <Text style={styles.itineraryDestination}>Itinerary ID: {item.itineraryId}</Text>
              <Text style={styles.itineraryDate}>Fetching details soon...</Text>
            </>
          )}
        </TouchableOpacity>
    );

    // ✅ Define the Shared Itineraries Tab
    const SharedItineraries = () => (
        sharedItineraries.length === 0 && pendingInvites.length === 0 ? (
            <View style={styles.emptyContainer}>
                <Text style={styles.noItineraries}>You have no shared itineraries yet.</Text>
            </View>
        ) : (
            <View>
                {/* ✅ Pending Invitations List */}
                {pendingInvites.length > 0 && (
                    <FlatList 
                        data={pendingInvites}
                        renderItem={renderInviteItem}
                        keyExtractor={(item, index) => `invite-${index}`}
                        contentContainerStyle={styles.listContainer}
                    />
                )}
    
                {/* ✅ Shared Itineraries List */}
                <FlatList 
                    data={sharedItineraries}
                    renderItem={renderItineraryItem}
                    keyExtractor={(item, index) => item.id ? item.id.toString() : `shared-${index}`}
                    contentContainerStyle={styles.listContainer}
                />
            </View>
        )
    );
    
    const renderScene = SceneMap({
        personal: () => (
            ownedItineraries.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.noItineraries}>You have no itineraries created yet.</Text>
                </View>
            ) : (
                <FlatList 
                    data={ownedItineraries}
                    renderItem={renderItineraryItem}
                    keyExtractor={(item, index) => item.id ? item.id.toString() : `owned-${index}`}
                    contentContainerStyle={styles.listContainer}
                />
            )
        ),
        shared: SharedItineraries,
    });
    const handleAcceptInvite = async (invite) => {
        try {
            console.log(`🔄 Accepting invite for itinerary: ${invite.itineraryId}`);
    
            // ✅ Step 1: Fetch the correct invite key from Firebase
            const inviteRef = database().ref(`/invitations/invitee/${userId}`);
            const snapshot = await inviteRef.once('value');
    
            if (!snapshot.exists()) {
                console.error("❌ No pending invites found in Firebase.");
                Alert.alert("Error", "Invite no longer exists.");
                return;
            }
    
            const invitesData = snapshot.val();
            const inviteKey = Object.keys(invitesData).find(
                key => invitesData[key].itineraryId === invite.itineraryId
            );
    
            if (!inviteKey) {
                console.error("❌ Could not find matching invite key.");
                Alert.alert("Error", "Invite data mismatch.");
                return;
            }
    
            // ✅ Step 2: Remove the pending invite from Firebase
            await database().ref(`/invitations/invitee/${userId}/${inviteKey}`).remove();
            console.log("✅ Removed invite from /invitations/invitee/");
    
            // ✅ Step 3: Remove the invite from pendingInvites in live_itineraries
            await database().ref(`/live_itineraries/${invite.itineraryId}/pendingInvites/${userId}`).remove();
            console.log("✅ Removed invite from /live_itineraries/pendingInvites/");
    
            // ✅ Step 4: Add user as a collaborator in Firebase
            await database().ref(`/live_itineraries/${invite.itineraryId}/collaborators/${userId}`).set(true);
            console.log("✅ Added user as collaborator in /live_itineraries/collaborators/");
    
            // ✅ Step 5: Refresh invites and shared itineraries
            fetchPendingInvites(userId);
            fetchSharedItineraries(userId);
    
            Alert.alert("Success", "You have joined the itinerary!");
        } catch (error) {
            console.error("❌ Error accepting invite:", error);
            Alert.alert("Error", "Failed to accept the invite.");
        }
    };
        
    const handleDeclineInvite = async (invite) => {
        try {
            console.log(`🔄 Declining invite for itinerary: ${invite.itineraryId}`);
    
            // ✅ Step 1: Fetch the correct invite key from Firebase
            const inviteRef = database().ref(`/invitations/invitee/${userId}`);
            const snapshot = await inviteRef.once('value');
    
            if (!snapshot.exists()) {
                console.error("❌ No pending invites found in Firebase.");
                Alert.alert("Error", "Invite no longer exists.");
                return;
            }
    
            const invitesData = snapshot.val();
            const inviteKey = Object.keys(invitesData).find(
                key => invitesData[key].itineraryId === invite.itineraryId
            );
    
            if (!inviteKey) {
                console.error("❌ Could not find matching invite key.");
                Alert.alert("Error", "Invite data mismatch.");
                return;
            }
    
            // ✅ Step 2: Remove the invite from Firebase (/invitations/invitee/)
            await database().ref(`/invitations/invitee/${userId}/${inviteKey}`).remove();
            console.log("✅ Removed invite from /invitations/invitee/");
    
            // ✅ Step 3: Remove the invite from pendingInvites in live_itineraries
            await database().ref(`/live_itineraries/${invite.itineraryId}/pendingInvites/${userId}`).remove();
            console.log("✅ Removed invite from /live_itineraries/pendingInvites/");
    
            // ✅ Step 4: Refresh the UI
            fetchPendingInvites(userId);
            await fetchSharedItineraries(userId);  // 🔄 Ensure shared itineraries update

            Alert.alert("Invite Declined", "You have declined the invitation.");
        } catch (error) {
            console.error("❌ Error declining invite:", error);
            Alert.alert("Error", "Failed to decline the invite.");
        }
    };
            

    return (
        <SafeAreaWrapper>
            <View style={styles.container}>
                {loading ? (
                    <ActivityIndicator size="large" color="#007bff" />
                ) : (
                    <TabView
                        navigationState={{ index, routes }}
                        renderScene={renderScene} 
                        onIndexChange={setIndex}
                        initialLayout={{ width: Dimensions.get('window').width }}
                        renderTabBar={props => (
                            <TabBar
                              {...props}
                              indicatorStyle={{
                                height: 4,
                                backgroundColor: '#1d3a8a',
                                borderRadius: 2,
                              }}
                              style={{
                                backgroundColor: 'white',
                                elevation: 0,
                              }}
                              labelStyle={{
                                fontSize: 16,
                                fontWeight: 'bold',
                                textTransform: 'capitalize',
                              }}
                              activeColor="black"
                              inactiveColor="gray"
                            />
                        )}                          
                    />
                )}

                {/* ✅ Add Itinerary Button */}
                <TouchableOpacity style={styles.addButton} onPress={handleAddItinerary}>
                    <Icon name="plus" size={16} color="white" />
                </TouchableOpacity>
            </View>
        </SafeAreaWrapper>
    );
};


const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    title: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginVertical: 20 },
    itineraryCard: {
        padding: 15,
        marginVertical: 10,
        marginHorizontal: 20,
        backgroundColor: '#ffffff',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    itineraryName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
    itineraryDestination: { fontSize: 14, color: '#666' },
    itineraryDate: { fontSize: 12, fontWeight: '600', color: '#007bff' },
    addButton: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#253985',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3, // For Android shadow
    },
    addButtonText: { color: '#fff', fontSize: 14 },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        height: 200, // Adjust as needed
    },
    noItineraries: { 
        textAlign: 'center', 
        fontSize: 16, 
        color: '#888', 
        marginVertical: 10 
    },
    tabBar: {
        backgroundColor: '#fff',  // ✅ White background for clean UI
        elevation: 3,  // ✅ Adds shadow effect for better separation
        height: 50, // ✅ Slightly increased height for visibility
    },
    tabLabel: {
        color: '#888',  // ✅ Default gray color for inactive tab
        fontSize: 16,
        fontWeight: '500', 
    },
    activeTabLabel: {
        color: '#007bff',  // ✅ Blue color for active tab
        fontWeight: 'bold',  // ✅ Bold text for active tab
    },
    activeTabTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',  // ✅ Darker color for emphasis
        textAlign: 'center',
        marginBottom: 10,  // ✅ Adds spacing above the tabs
    },
    inviteCard: {
        backgroundColor: '#f8f9fa',
        padding: 12,
        borderRadius: 8,
        marginHorizontal: 15,
        marginVertical: 8,
        borderLeftWidth: 5,
        borderLeftColor: '#007bff',
    },
    inviteText: {
        fontSize: 16,
        color: '#333',
    },
    inviteButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    acceptButton: {
        flex: 1,
        padding: 10,
        backgroundColor: '#28a745',  // Green for Accept
        borderRadius: 5,
        alignItems: 'center',
        marginRight: 5,
    },
    declineButton: {
        flex: 1,
        padding: 10,
        backgroundColor: '#dc3545',  // Red for Decline
        borderRadius: 5,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    lastUpdated: {
        fontSize: 12,
        color: '#555',
        marginTop: 5,
    },
});

export default ItineraryListScreen;
