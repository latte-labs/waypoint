import React, { useState, useEffect } from 'react';
import { 
    View, Text, TextInput, TouchableOpacity, FlatList, Alert 
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import SafeAreaWrapper from '../SafeAreaWrapper';
import { database } from '../../../firebase';



const InviteCollaboratorsScreen = () => {
    const route = useRoute();
    const { itineraryId } = route.params;
    const navigation = useNavigation();
    
    const [email, setEmail] = useState('');
    const [foundUser, setFoundUser] = useState(null);
    const [collaborators, setCollaborators] = useState([]);
    const [loading, setLoading] = useState(false);


 
    // ✅ Fetch Collaborators from Firebase
    useEffect(() => {
        const fetchCollaborators = async () => {
            const itineraryRef = database().ref(`/live_itineraries/${itineraryId}/collaborators`);
            const snapshot = await itineraryRef.once('value');
            const collabData = snapshot.val() || [];

            const usersRef = database().ref('/users');
            const usersSnapshot = await usersRef.once('value');
            const usersData = usersSnapshot.val() || {};

            // Map collaborator IDs to names and emails
            const formattedCollaborators = collabData.map(userId => ({
                id: userId,
                name: usersData[userId]?.name || 'Unknown User',
                email: usersData[userId]?.email || 'No email',
                approved: usersData[userId]?.approved || false
            }));

            setCollaborators(formattedCollaborators);
        };

        fetchCollaborators();
    }, [itineraryId]);

    // ✅ Search for User by Email
    const searchUserByEmail = async () => {
        if (!email.trim()) return;

        setLoading(true);
        try {
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
                setFoundUser({ userId: matchedUser[0], ...matchedUser[1] });
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

        const itineraryRef = database().ref(`/live_itineraries/${itineraryId}/collaborators`);

        try {
            const snapshot = await itineraryRef.once('value');
            const currentCollaborators = snapshot.val() || [];

            if (currentCollaborators.includes(foundUser.userId)) {
                Alert.alert("Already Invited", `${foundUser.name} is already a collaborator.`);
                return;
            }

            // Add user ID to collaborators (marked as pending)
            await itineraryRef.set([...currentCollaborators, foundUser.userId]);

            Alert.alert("Invite Sent", `${foundUser.name} has been invited.`);
            setCollaborators([...collaborators, { 
                id: foundUser.userId, 
                name: foundUser.name, 
                email: foundUser.email, 
                approved: false 
            }]);
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

                {/* ✅ Collaborators List */}
                <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
                    Collaborators
                </Text>
                
                <FlatList
                    data={collaborators}
                    keyExtractor={(item) => item.id}
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
                                {item.name} ({item.email}) {item.approved ? '' : ' - Pending Approval'}
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
