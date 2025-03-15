import React, { useState } from 'react';
import { 
    View, Text, TextInput, TouchableOpacity, FlatList, Alert 
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import SafeAreaWrapper from '../SafeAreaWrapper';


const InviteCollaboratorsScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { itineraryId } = route.params; // Get itinerary ID

    const [searchText, setSearchText] = useState('');
    const [users, setUsers] = useState([
        { id: '1', name: 'Alice Johnson' },
        { id: '2', name: 'Bob Smith' },
        { id: '3', name: 'Charlie Brown' },
    ]); // Dummy users
    const [pendingInvites, setPendingInvites] = useState([]); // Stores invited users

    // ✅ Handle User Invite
    const handleInvite = (user) => {
        if (pendingInvites.some((invited) => invited.id === user.id)) {
            Alert.alert("Already Invited", `${user.name} has already been invited.`);
            return;
        }

        setPendingInvites([...pendingInvites, user]);
        Alert.alert("Invite Sent", `${user.name} has been invited.`);
    };

    return (
        <SafeAreaWrapper>
            <View style={{ flex: 1, padding: 20, backgroundColor: '#fff' }}>
                {/* ✅ Header */}
                <Text style={{ fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 15 }}>
                    Invite Collaborators
                </Text>

                {/* ✅ Search Input */}
                <TextInput
                    placeholder="Search users..."
                    value={searchText}
                    onChangeText={setSearchText}
                    style={{
                        borderWidth: 1,
                        borderColor: '#ddd',
                        padding: 12,
                        borderRadius: 8,
                        marginBottom: 15,
                    }}
                />

                {/* ✅ User List */}
                <FlatList
                    data={users.filter(user => 
                        user.name.toLowerCase().includes(searchText.toLowerCase())
                    )}
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
                            <Text style={{ fontSize: 16 }}>{item.name}</Text>
                            <TouchableOpacity 
                                onPress={() => handleInvite(item)}
                                style={{
                                    backgroundColor: '#007bff',
                                    padding: 10,
                                    borderRadius: 8,
                                }}
                            >
                                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Invite</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                />

                {/* ✅ Pending Invites Section */}
                {pendingInvites.length > 0 && (
                    <View style={{ marginTop: 20 }}>
                        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>Pending Invites</Text>
                        {pendingInvites.map((user) => (
                            <Text key={user.id} style={{ fontSize: 16, marginBottom: 5 }}>
                                {user.name} (Invited)
                            </Text>
                        ))}
                    </View>
                )}

                {/* ✅ Done Button */}
                <TouchableOpacity 
                    onPress={() => navigation.goBack()}
                    style={{
                        marginTop: 20,
                        padding: 15,
                        backgroundColor: '#28a745',
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
