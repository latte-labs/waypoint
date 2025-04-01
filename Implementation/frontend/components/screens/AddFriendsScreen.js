import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Alert, ActivityIndicator, Dimensions, Image } from 'react-native';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import SafeAreaWrapper from './SafeAreaWrapper';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { database } from '../../firebase';
import Icon from 'react-native-vector-icons/FontAwesome5';

const AddFriendsScreen = () => {
    const navigation = useNavigation();
    const [currentUser, setCurrentUser] = useState(null);
    const [index, setIndex] = useState(0);
    const [routes] = useState([
        { key: 'search', title: 'Search' },
        { key: 'pending', title: 'Pending' },
        { key: 'friends', title: 'Friends' },
        { key: 'requests', title: 'Requests' },
    ]);

    // State for Search Tab
    const [email, setEmail] = useState('');
    const [foundUser, setFoundUser] = useState(null);
    const [searchLoading, setSearchLoading] = useState(false);

    // State for Friends List
    const [friends, setFriends] = useState([]);

    // State for Incoming Requests
    const [pendingRequests, setPendingRequests] = useState([]);

    // State for Outgoing Friend Requests
    const [outgoingRequests, setOutgoingRequests] = useState([]);

    // Load current user from AsyncStorage on mount
    useEffect(() => {
        const loadUser = async () => {
            const storedUser = await AsyncStorage.getItem('user');
            if (storedUser) {
                setCurrentUser(JSON.parse(storedUser));
            }
        };
        loadUser();
    }, []);

    // Listen for changes in current friend list
    useEffect(() => {
        if (currentUser) {
            const friendsRef = database().ref(`/friends/${currentUser.id}`);
            const handleFriends = (snapshot) => {
                if (snapshot.exists()) {
                    const data = snapshot.val();
                    const friendsArray = Object.keys(data).map(key => data[key]);
                    setFriends(friendsArray);
                } else {
                    setFriends([]);
                }
            };
            friendsRef.on('value', handleFriends);
            return () => friendsRef.off('value', handleFriends);
        }
    }, [currentUser]);

    // Listen for incoming friend requests 
    useEffect(() => {
        if (currentUser) {
            const requestsRef = database().ref(`/friend_requests/${currentUser.id}`);
            const handleRequests = (snapshot) => {
                if (snapshot.exists()) {
                    const data = snapshot.val();
                    const requestsArray = Object.keys(data).map(key => ({ id: key, ...data[key] }));
                    setPendingRequests(requestsArray);
                } else {
                    setPendingRequests([]);
                }
            };
            requestsRef.on('value', handleRequests);
            return () => requestsRef.off('value', handleRequests);
        }
    }, [currentUser]);

    // Listen for outgoing friend requests 
    useEffect(() => {
        if (currentUser) {
            const outgoingRef = database().ref(`/outgoing_friend_requests/${currentUser.id}`);
            const handleOutgoing = (snapshot) => {
                if (snapshot.exists()) {
                    const data = snapshot.val();
                    const outgoingArray = Object.keys(data).map(key => ({ id: key, ...data[key] }));
                    setOutgoingRequests(outgoingArray);
                } else {
                    setOutgoingRequests([]);
                }
            };
            outgoingRef.on('value', handleOutgoing);
            return () => outgoingRef.off('value', handleOutgoing);
        }
    }, [currentUser]);

    // Navigation
    const handleViewProfile = (friend) => {
        navigation.navigate('PublicProfile', { friendId: friend.friendId });
    };

    // Search for a user by email
    const searchUserByEmail = async () => {
        if (!email.trim()) return;
        setSearchLoading(true);
        try {
            const snapshot = await database().ref('/users').once('value');
            const usersData = snapshot.val();
            if (!usersData) {
                setFoundUser(null);
                Alert.alert("User Not Found", "No user found with this email.");
                setSearchLoading(false);
                return;
            }
            const matchedUser = Object.entries(usersData).find(([userId, user]) =>
                user.email && user.email.toLowerCase() === email.toLowerCase()
            );
            if (matchedUser) {
                const searchedUser = { userId: matchedUser[0], ...matchedUser[1] };
                // Prevent adding yourself
                if (searchedUser.email.toLowerCase() === currentUser.email.toLowerCase()) {
                    Alert.alert("Invalid Request", "You cannot add yourself.");
                    setFoundUser(null);
                } else {
                    if (friends.some(friend => friend.friendId === searchedUser.userId)) {
                        Alert.alert("Already Friends", "This user is already in your friends list.");
                        setFoundUser(null);
                    } else {
                        setFoundUser(searchedUser);
                    }
                }
            } else {
                setFoundUser(null);
                Alert.alert("User Not Found", "No user found with this email.");
            }
        } catch (error) {
            console.error("Error searching user:", error);
            Alert.alert("Error", "Could not search for user.");
        }
        setSearchLoading(false);
    };

    // Send Friend Request
    const handleAddFriend = async () => {
        if (!foundUser) return;
        try {
            const requestRef = database().ref(`/friend_requests/${foundUser.userId}`);
            // Check if a friend request from the current user already exists 
            const snapshot = await requestRef.once('value');
            if (snapshot.exists()) {
                const requests = snapshot.val();
                const alreadyRequested = Object.keys(requests).some(
                    key => requests[key].senderId === currentUser.id
                );
                if (alreadyRequested) {
                    Alert.alert("Request Already Sent", "You have already sent a friend request to this user.");
                    return; // Do not send another request
                }
            }
            const newRequestRef = requestRef.push();
            await newRequestRef.set({
                senderId: currentUser.id,
                senderName: currentUser.name,
                senderEmail: currentUser.email,
                status: "pending",
                timestamp: Date.now(),
            });
            // record the outgoing request for the current user
            const outgoingRef = database().ref(`/outgoing_friend_requests/${currentUser.id}`);
            const newOutgoingRef = outgoingRef.push();
            await newOutgoingRef.set({
                receiverId: foundUser.userId,
                receiverName: foundUser.name,
                receiverEmail: foundUser.email,
                status: "pending",
                timestamp: Date.now(),
            });
            Alert.alert("Request Sent", `${foundUser.name} has been sent a friend request.`);
            setFoundUser(null);
            setEmail('');
        } catch (error) {
            console.error("Error sending friend request:", error);
            Alert.alert("Error", "Could not send friend request.");
        }
    };

    // Accept Friend Request
    const handleAcceptRequest = async (request) => {
        try {
            // Add friend to current user's friend list
            const currentUserFriendRef = database().ref(`/friends/${currentUser.id}/${request.senderId}`);
            await currentUserFriendRef.set({
                friendId: request.senderId,
                friendName: request.senderName,
                friendEmail: request.senderEmail,
                addedAt: Date.now(),
            });
            // Add friend to sender's friend list
            const senderFriendRef = database().ref(`/friends/${request.senderId}/${currentUser.id}`);
            await senderFriendRef.set({
                friendId: currentUser.id,
                friendName: currentUser.name,
                friendEmail: currentUser.email,
                addedAt: Date.now(),
            });
            // Remove the friend request
            const requestRef = database().ref(`/friend_requests/${currentUser.id}/${request.id}`);
            await requestRef.remove();

            // Remove the corresponding outgoing friend request from the sender's node 
            const outgoingForSenderRef = database().ref(`/outgoing_friend_requests/${request.senderId}`);
            const query = outgoingForSenderRef.orderByChild('receiverId').equalTo(currentUser.id);
            const snapshot = await query.once('value');
            if (snapshot.exists()) {
                snapshot.forEach(childSnapshot => {
                    childSnapshot.ref.remove();
                });
            }
            Alert.alert("Friend Added", `You are now friends with ${request.senderName}.`);
        } catch (error) {
            console.error("Error accepting friend request:", error);
            Alert.alert("Error", "Could not accept friend request.");
        }
    };

    // --- Decline Friend Request ---
    const handleDeclineRequest = async (request) => {
        try {
            const requestRef = database().ref(`/friend_requests/${currentUser.id}/${request.id}`);
            await requestRef.remove();
            Alert.alert("Request Declined", "Friend request declined.");
        } catch (error) {
            console.error("Error declining friend request:", error);
            Alert.alert("Error", "Could not decline friend request.");
        }
    };

    // --- Remove Friend ---
    const handleRemoveFriend = async (friendId) => {
        Alert.alert("Remove Friend", "Are you sure you want to remove this friend?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Remove",
                style: "destructive",
                onPress: async () => {
                    try {
                        await database().ref(`/friends/${currentUser.id}/${friendId}`).remove();
                        // Optionally remove the reciprocal friend entry
                        await database().ref(`/friends/${friendId}/${currentUser.id}`).remove();
                        Alert.alert("Removed", "Friend removed successfully.");
                    } catch (error) {
                        console.error("Error removing friend:", error);
                        Alert.alert("Error", "Could not remove friend.");
                    }
                }
            }
        ]);
    };

    // Component to render a friend item by fetching profile picture from /users
    const FriendListItem = ({ friendId, friendName }) => {
        const [profilePhotoUrl, setProfilePhotoUrl] = useState(null);
        useEffect(() => {
            const userRef = database().ref(`/users/${friendId}`);
            userRef.once('value')
                .then(snapshot => {
                    if (snapshot.exists()) {
                        const data = snapshot.val();
                        setProfilePhotoUrl(data.profilePhotoUrl);
                    }
                })
                .catch(error => console.error("Error fetching friend photo:", error));
        }, [friendId]);
        return (
            <TouchableOpacity
                onPress={() => handleViewProfile(friendId)}
                style={styles.friendItemContainer}
            >
                {profilePhotoUrl ? (
                    <Image
                        source={{ uri: `${profilePhotoUrl}?ts=${Date.now()}` }}
                        style={styles.friendImage}
                        resizeMode="cover"
                    />
                ) : (
                    <Icon
                        name="user-circle"
                        size={60}
                        color="#ccc"
                        style={styles.friendImage}
                    />
                )}
                <Text style={styles.friendName}>{friendName}</Text>
                <TouchableOpacity
                    onPress={() => handleRemoveFriend(friendId)}
                    style={styles.removeButton}
                >
                    <Text style={styles.removeButtonText}>Remove</Text>
                </TouchableOpacity>
            </TouchableOpacity>
        );
    };


    // Render functions for each tab

    // Search Tab
    const renderSearchTab = () => (
        <View style={{ flex: 1, padding: 20 }}>
            <TextInput
                placeholder="Enter email address..."
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                style={{
                    borderWidth: 1,
                    borderColor: '#ddd',
                    padding: 12,
                    borderRadius: 8,
                    marginBottom: 15,
                }}
            />
            <TouchableOpacity
                onPress={searchUserByEmail}
                style={{
                    backgroundColor: '#007bff',
                    padding: 12,
                    borderRadius: 8,
                    alignItems: 'center',
                    marginBottom: 15,
                }}
            >
                {searchLoading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>Search</Text>
                )}
            </TouchableOpacity>
            {foundUser && (
                <TouchableOpacity
                    onPress={handleAddFriend}
                    style={{
                        backgroundColor: '#28a745',
                        padding: 15,
                        borderRadius: 8,
                        alignItems: 'center',
                        marginBottom: 15,
                    }}
                >
                    <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>
                        Add {foundUser.name} as Friend
                    </Text>
                </TouchableOpacity>
            )}
        </View>
    );

    // Friends Tab (Current Friends)
    const renderFriendsTab = () => (
        <View style={{ flex: 1, padding: 20 }}>
            {friends.length === 0 ? (
                <Text style={{ textAlign: 'center', color: '#777', marginTop: 20 }}>No friends yet</Text>
            ) : (
                <FlatList
                    data={friends}
                    keyExtractor={(item) => item.friendId}
                    renderItem={({ item }) => (
                        <FriendListItem 
                            friendId={item.friendId} 
                            friendName={item.friendName} 
                        />
                    )}
                />
            )}
        </View>
    );

    // Pending Tab (Outgoing Friend Requests)
    const renderPendingTab = () => (
        <View style={{ flex: 1, padding: 20 }}>
            {outgoingRequests.length === 0 ? (
                <Text style={{ textAlign: 'center', color: '#777', marginTop: 20 }}>No outgoing requests</Text>
            ) : (
                <FlatList
                    data={outgoingRequests}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <View style={{
                            padding: 12,
                            borderBottomWidth: 1,
                            borderBottomColor: '#eee'
                        }}>
                            <Text style={{ fontSize: 16 }}>
                                {item.receiverName} ({item.receiverEmail})
                            </Text>
                            <Text style={{ fontSize: 12, color: '#777', marginTop: 5 }}>Pending</Text>
                        </View>
                    )}
                />
            )}
        </View>
    );

    // Requests Tab (Incoming)
    const renderRequestsTab = () => (
        <View style={{ flex: 1, padding: 20 }}>
            {pendingRequests.length === 0 ? (
                <Text style={{ textAlign: 'center', color: '#777', marginTop: 20 }}>No pending requests</Text>
            ) : (
                <FlatList
                    data={pendingRequests}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <View style={{
                            padding: 12,
                            borderBottomWidth: 1,
                            borderBottomColor: '#eee'
                        }}>
                            <Text style={{ fontSize: 16 }}>
                                {item.senderName} ({item.senderEmail})
                            </Text>
                            <View style={{ flexDirection: 'row', marginTop: 10 }}>
                                <TouchableOpacity
                                    onPress={() => handleAcceptRequest(item)}
                                    style={{
                                        backgroundColor: '#28a745',
                                        padding: 10,
                                        borderRadius: 5,
                                        marginRight: 10,
                                    }}
                                >
                                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>Accept</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => handleDeclineRequest(item)}
                                    style={{
                                        backgroundColor: '#dc3545',
                                        padding: 10,
                                        borderRadius: 5,
                                    }}
                                >
                                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>Decline</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                />
            )}
        </View>
    );

    // --- Render TabView ---
    const renderScene = ({ route }) => {
        switch (route.key) {
            case 'search':
                return renderSearchTab();
            case 'friends':
                return renderFriendsTab();
            case 'pending':
                return renderPendingTab();
            case 'requests':
                return renderRequestsTab();
            default:
                return null;
        }
    };

    return (
        <SafeAreaWrapper>
            <View style={{ flex: 1 }}>
                <Text style={{
                    fontSize: 22,
                    fontWeight: 'bold',
                    textAlign: 'center',
                    marginVertical: 15,
                }}>
                    Add Friends
                </Text>
                <TabView
                    navigationState={{ index, routes }}
                    renderScene={renderScene}
                    onIndexChange={setIndex}
                    initialLayout={{ width: Dimensions.get('window').width }}
                    renderTabBar={props => (
                        <TabBar
                            {...props}
                            indicatorStyle={{ backgroundColor: '#1d3a8a', height: 4, borderRadius: 2 }}
                            style={{ backgroundColor: 'white', elevation: 0 }}
                            labelStyle={{ fontSize: 16, fontWeight: 'bold' }}
                            activeColor="black"
                            inactiveColor="gray"
                        />
                    )}
                />
            </View>
        </SafeAreaWrapper>
    );
};

export default AddFriendsScreen;

const styles = {
    friendItemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    friendImage: {
        width: 60,
        height: 60,
        borderRadius: 30,
    },
    friendPlaceholder: {
        backgroundColor: '#eee',
        justifyContent: 'center',
        alignItems: 'center',
    },
    friendName: {
        fontSize: 16,
        marginLeft: 20,
        flex: 1, // Take up available space
    },
    removeButton: {
        backgroundColor: 'red',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 6,
    },
    removeButtonText: {
        color: '#fff',
        fontSize: 14,
    },
};