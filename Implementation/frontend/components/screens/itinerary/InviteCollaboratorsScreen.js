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

    // ✅ Fetch Invited Users (Pending & Approved) from Firebase
    useEffect(() => {
        const fetchPendingInvites = async () => {
            try {
                const inviteRef = database().ref('/invitations');
                const snapshot = await inviteRef.once('value');

                if (snapshot.exists()) {
                    const invitesData = Object.values(snapshot.val());

                    // ✅ Filter invites for this specific itinerary
                    const filteredInvites = invitesData.filter(invite => invite.itineraryId === itineraryId);

                    console.log("📥 Fetched Pending Invites:", filteredInvites);
                    setInvitedUsers(filteredInvites);
                }
            } catch (error) {
                console.error("❌ Error fetching pending invites:", error);
            }
        };
                
        fetchPendingInvites();
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

                {/* ✅ Invited Users List (Pending & Approved) */}
                <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
                    People Invited to this Trip
                </Text>

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
                                {item.inviteeName} ({item.inviteeEmail}) {item.status === "pending" ? '- Pending Approval' : ''}
                            </Text>
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
