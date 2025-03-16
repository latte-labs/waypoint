import React, { useState, useEffect } from 'react';
import { 
    View, Text, TextInput, TouchableOpacity, FlatList, Alert 
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import SafeAreaWrapper from '../SafeAreaWrapper';
import { database } from '../../../firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';

const InviteCollaboratorsScreen = () => {
    const route = useRoute();
    const { itinerary } = route.params; // ✅ Get full itinerary object
    const itineraryId = itinerary.id;
    const itineraryName = itinerary.name || "Unnamed Trip";
    const navigation = useNavigation();
    
    const [email, setEmail] = useState('');
    const [foundUser, setFoundUser] = useState(null);
    const [invitedUsers, setInvitedUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [collaborators, setCollaborators] = useState([]);


    // ✅ Fetch Pending Invites & Collaborators in Real Time
    useEffect(() => {
        const inviteRef = database().ref('/invitations/invitee');
        const collaboratorRef = database().ref(`/live_itineraries/${itineraryId}/collaborators`);
    
        // ✅ Real-time updates for pending invites
        const handleInviteChange = (snapshot) => {
            if (snapshot.exists()) {
                const invitesData = snapshot.val();
                let pendingInvites = [];
    
                // ✅ Loop through all invitees
                Object.values(invitesData).forEach(inviteeData => {
                    Object.values(inviteeData).forEach(invite => {
                        if (invite.itineraryId === itineraryId && invite.status === "pending") {
                            pendingInvites.push(invite);
                        }
                    });
                });
    
                setInvitedUsers(pendingInvites);
            } else {
                setInvitedUsers([]); // ✅ Clear list if no invites exist
            }
        };
        
        // ✅ Real-time updates for collaborators
        const handleCollaboratorChange = async (snapshot) => {
            if (snapshot.exists()) {
                const collabData = snapshot.val();
                const userIds = Object.keys(collabData);

                // ✅ Fetch User Details (Name & Email)
                const userSnapshot = await database().ref('/users').once('value');
                const usersData = userSnapshot.val();

                const collaboratorsList = userIds.map(userId => ({
                    userId,
                    name: usersData[userId]?.name || "Unknown",
                    email: usersData[userId]?.email || "No Email",
                }));

                setCollaborators(collaboratorsList);
            } else {
                setCollaborators([]); // ✅ Clear list if no collaborators exist
            }
        };

        // ✅ Attach Firebase listeners
        inviteRef.on('value', handleInviteChange);
        collaboratorRef.on('value', handleCollaboratorChange);

        // ✅ Clean up listeners when component unmounts
        return () => {
            inviteRef.off('value', handleInviteChange);
            collaboratorRef.off('value', handleCollaboratorChange);
        };
    }, [itineraryId]);
            
    // ✅ Search for User by Email
    const searchUserByEmail = async () => {
        if (!email.trim()) return;
    
        setLoading(true);
        try {
            const storedUser = await AsyncStorage.getItem('user');
            const userData = storedUser ? JSON.parse(storedUser) : null;
    
            const snapshot = await database().ref('/users').once('value');
            const usersData = snapshot.val();
    
            if (!usersData) {
                setFoundUser(null);
                Alert.alert("User Not Found", "No user found with this email.");
                return;
            }
    
            // ✅ Ensure email exists before comparing
            const matchedUser = Object.entries(usersData).find(([userId, user]) => 
                user.email && user.email.toLowerCase() === email.toLowerCase()
            );
    
            if (matchedUser) {
                const searchedUser = { userId: matchedUser[0], ...matchedUser[1] };
    
                // ✅ Prevent inviting self
                if (searchedUser.email.toLowerCase() === userData?.email.toLowerCase()) {
                    Alert.alert("Invalid Invite", "You cannot invite yourself.");
                    setFoundUser(null);
                    setEmail('');
                    return;
                }
    
                setFoundUser(searchedUser);
            } else {
                setFoundUser(null);
                Alert.alert("User Not Found", "No user found with this email.");
            }
        } catch (error) {
            console.error("❌ Error searching user by email:", error);
            Alert.alert("Error", "Could not search for users.");
        }
        setLoading(false);
    };
    
    // ✅ Invite Selected User
    const handleInvite = async () => {
        if (!foundUser) return;
        
        const storedUser = await AsyncStorage.getItem('user');
        const userData = storedUser ? JSON.parse(storedUser) : null;
        
        if (!userData) {
            Alert.alert("Error", "Could not get user data.");
            return;
        }
    
        const inviteRef = database().ref(`/invitations/invitee/${foundUser.userId}`);
        const itineraryRef = database().ref(`/live_itineraries/${itineraryId}/pendingInvites/${foundUser.userId}`);
    
        try {
            // ✅ Store invite under the invitee's user ID
            const newInviteRef = inviteRef.push();
            await newInviteRef.set({
                itineraryId: itineraryId,
                inviteeId: foundUser.userId,
                inviteeName: foundUser.name,
                inviteeEmail: foundUser.email,
                inviterName: userData.name,  
                inviterEmail: userData.email, 
                tripName: itineraryName,
                status: "pending",
            });
    
            // ✅ Store pending invite under itinerary for the inviter to track
            await itineraryRef.set("pending");

            // ✅ Update UI with new invited user
            setInvitedUsers([...invitedUsers, {
                itineraryId: itineraryId,
                inviteeId: foundUser.userId,
                inviteeName: foundUser.name,
                inviteeEmail: foundUser.email,
                inviterName: userData.name,  
                inviterEmail: userData.email, 
                tripName: itineraryName,
                status: "pending",
            }]);

            Alert.alert("Invite Sent", `${foundUser.name} has been invited.`);
            setFoundUser(null);
            setEmail('');
        } catch (error) {
            console.error("❌ Error inviting user:", error);
        }
    };

    return (
        <SafeAreaWrapper>
            <View style={{ flex: 1, padding: 20, backgroundColor: '#fff' }}>
                {/* ✅ Header */}
                <Text style={{ fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 15 }}>
                    Invite Collaborators
                </Text>

                {/* ✅ Email Input */}
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

                {/* ✅ Search Button */}
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
                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>Search</Text>
                </TouchableOpacity>

                {/* ✅ Show User if Found */}
                {foundUser && (
                    <TouchableOpacity 
                        onPress={handleInvite}
                        style={{
                            backgroundColor: '#28a745',
                            padding: 15,
                            borderRadius: 8,
                            alignItems: 'center',
                            marginBottom: 15,
                        }}
                    >
                        <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>
                            Invite {foundUser.name}
                        </Text>
                    </TouchableOpacity>
                )}

                {/* ✅ Pending Invites List */}
                <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
                    Pending Invites
                </Text>

                {invitedUsers.length === 0 ? (
                    <Text style={{ fontSize: 16, color: '#777', textAlign: 'center' }}>No pending invites</Text>
                ) : (
                    <FlatList
                        data={invitedUsers}
                        keyExtractor={(item) => item.inviteeId}
                        renderItem={({ item }) => (
                            <View style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: 12,
                                borderBottomWidth: 1,
                                borderBottomColor: '#eee'
                            }}>
                                <Text style={{ fontSize: 16 }}>
                                    {item.inviteeName} ({item.inviteeEmail})
                                </Text>
                            </View>
                        )}
                    />
                )}

                {/* ✅ Collaborators List */}
                <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10, marginTop: 20 }}>
                    Collaborators
                </Text>

                <FlatList
                    data={collaborators}
                    keyExtractor={(item) => item.userId}
                    renderItem={({ item }) => (
                        <View style={{
                            flexDirection: 'row',
                            alignItems: 'center', // ✅ Keep everything aligned in the center
                            justifyContent: 'space-between', // ✅ Ensures text stays on left, button on right
                            padding: 12,
                            borderBottomWidth: 1,
                            borderBottomColor: '#eee'
                        }}>
                            <View style={{ flex: 1 }}> 
                                <Text style={{ fontSize: 16 }}>
                                    {item.name} ({item.email})
                                </Text>
                            </View>

                            <TouchableOpacity 
                                onPress={() => Alert.alert("Remove Collaborator", "Feature coming soon.")}
                                style={{
                                    backgroundColor: 'red',
                                    paddingVertical: 6,
                                    paddingHorizontal: 12,
                                    borderRadius: 6,
                                    alignSelf: 'center' // ✅ Ensures button is properly aligned
                                }}
                            >
                                <Text style={{ color: '#fff', fontSize: 14 }}>Remove</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                />

                {/* ✅ Done Button */}
                <TouchableOpacity 
                    onPress={() => navigation.goBack()}
                    style={{
                        marginTop: 20,
                        padding: 15,
                        backgroundColor: '#6c757d',
                        borderRadius: 8,
                        alignItems: 'center',
                    }}
                >
                    <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>Done</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaWrapper>
    );
};

export default InviteCollaboratorsScreen;
