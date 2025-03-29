import React, { useState } from 'react';
import { 
    Modal, View, Text, TextInput, TouchableOpacity, FlatList, Alert 
} from 'react-native';
import costTypes from '../../../src/data/costTypes.json';
import { database } from '../../../firebase';
import Icon from 'react-native-vector-icons/FontAwesome';

const OtherCostsModal = ({ visible, onClose, otherCosts, setOtherCosts, itineraryId }) => {
    const [selectedType, setSelectedType] = useState(null);
    const [selectedSubtype, setSelectedSubtype] = useState(null);
    const [itemName, setItemName] = useState('');
    const [amount, setAmount] = useState('');

    // ✅ Get subtypes based on selected type
    const subtypes = selectedType ? costTypes[selectedType] : [];

    // ✅ Handle Save (Add Cost to List)
    const handleSave = async () => {
        if (!selectedType || !selectedSubtype || !itemName.trim() || !amount.trim()) {
            Alert.alert("Error", "Please fill in all fields.");
            return;
        }
    
        const newCost = {
            id: Date.now().toString(),
            type: selectedType,
            subtype: selectedSubtype,
            item: itemName,
            amount: parseFloat(amount),
        };
    
        const updatedCosts = [...otherCosts, newCost];
        setOtherCosts(updatedCosts);
    
        try {
            await database()
                .ref(`/live_itineraries/${itineraryId}/other_costs`)
                .set(updatedCosts);
            console.log("✅ Other costs saved to Firebase");
        } catch (error) {
            console.error("❌ Failed to save other costs:", error);
        }
        resetFields();
    };
    
    // ✅ Handle Cost Deletion
    const handleDelete = async (costId) => {
        const updatedCosts = otherCosts.filter(cost => cost.id !== costId);
        setOtherCosts(updatedCosts);
    
        try {
            await database()
                .ref(`/live_itineraries/${itineraryId}/other_costs`)
                .set(updatedCosts);
            console.log("✅ Cost deleted from Firebase");
        } catch (error) {
            console.error("❌ Failed to delete cost from Firebase:", error);
        }
    };
    
    // ✅ Reset input fields
    const resetFields = () => {
        setSelectedType(null);
        setSelectedSubtype(null);
        setItemName('');
        setAmount('');
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: 'rgba(0,0,0,0.5)',
            }}>
                <View style={{
                    width: '90%',
                    backgroundColor: '#fff',
                    padding: 20,
                    borderRadius: 20,
                    shadowColor: '#000',
                    shadowOpacity: 0.1,
                    shadowOffset: { width: 0, height: 2 },
                    shadowRadius: 8,
                    elevation: 4,
                }}>
                    <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>Manage Other Costs</Text>

                    {/* Cost Type Selection */}
                    <FlatList
                        data={Object.keys(costTypes)}
                        keyExtractor={(item) => item}
                        renderItem={({ item }) => (
                            <TouchableOpacity 
                                style={{
                                    paddingVertical: 8,
                                    paddingHorizontal: 16,
                                    backgroundColor: selectedType === item ? '#1d3a8a' : '#eef1f7',
                                    borderRadius: 20,
                                    marginRight: 10,
                                    marginBottom: 6,
                                }}
                                onPress={() => setSelectedType(item)}
                            >
                                <Text style={{
                                    fontSize: 14,
                                    fontWeight: 'bold',
                                    color: selectedType === item ? '#fff' : '#1d3a8a',                                    
                                }}>
                                    {item}
                                </Text>
                            </TouchableOpacity>
                        )}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={{ marginBottom: 10 }}
                    />

                    {/* Subtype Selection */}
                    {selectedType && (
                        <FlatList
                            data={subtypes}
                            keyExtractor={(item) => item}
                            renderItem={({ item }) => (
                                <TouchableOpacity 
                                    style={{
                                        paddingVertical: 8,
                                        paddingHorizontal: 16,
                                        backgroundColor: selectedSubtype === item ? '#1d3a8a' : '#eef1f7',
                                        borderRadius: 20,
                                        marginRight: 10,
                                        marginBottom: 6,                                    }}
                                    onPress={() => setSelectedSubtype(item)}
                                >
                                    <Text style={{
                                        fontSize: 14,
                                        fontWeight: 'bold',
                                        color: selectedSubtype === item ? '#fff' : '#1d3a8a',
                                    }}>
                                        {item}
                                    </Text>
                                </TouchableOpacity>
                            )}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            style={{ marginBottom: 10 }}
                        />
                    )}

                    {/* Item Name Input */}
                    <TextInput
                        style={{
                            width: '100%',
                            borderWidth: 1,
                            borderColor: '#ccc',
                            borderRadius: 12,
                            paddingVertical: 12,
                            paddingHorizontal: 16,
                            marginBottom: 10,
                            fontSize: 12,
                        }}
                        placeholder="Enter item name (e.g., Taxi to airport)"
                        value={itemName}
                        onChangeText={setItemName}
                    />

                    {/* Amount Input */}
                    <TextInput
                        style={{
                            width: '100%',
                            borderWidth: 1,
                            borderColor: '#ccc',
                            borderRadius: 12,
                            paddingVertical: 12,
                            paddingHorizontal: 16,
                            marginBottom: 10,
                            fontSize: 12,
                        }}
                        placeholder="Enter amount ($)"
                        keyboardType="numeric"
                        value={amount}
                        onChangeText={setAmount}
                    />

                    {/* Buttons */}
                    <View style={{ flexDirection: 'row', marginTop: 10 }}>
                        <TouchableOpacity 
                            style={{
                                flex: 1,
                                paddingVertical: 14,
                                borderRadius: 30,
                                alignItems: 'center',
                                backgroundColor: '#1d3a8a',
                                marginRight: 6,                            
                            }} 
                            onPress={handleSave}
                        >
                            <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>Save</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={{
                                flex: 1,
                                paddingVertical: 14,
                                borderRadius: 30,
                                alignItems: 'center',
                                backgroundColor: '#999',
                            }} 
                            onPress={onClose}
                        >
                            <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>Close</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Saved Costs Preview */}
                    <View style={{ marginTop: 24, width: '100%' }}>
                        <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#1d3a8a', marginBottom: 10 }}>
                            Saved Other Costs
                        </Text>

                        {otherCosts.length > 0 ? (
                            otherCosts.map((cost, index) => (
                                <View
                                    key={index}
                                    style={{
                                        flexDirection: 'row',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        backgroundColor: '#f5f7fa',
                                        paddingVertical: 12,
                                        paddingHorizontal: 14,
                                        borderRadius: 12,
                                        marginBottom: 8,
                                    }}
                                >
                                    <Text style={{ fontSize: 14, fontWeight: '600', color: '#333' }}>
                                        {cost.type} - {cost.subtype}
                                    </Text>

                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Text style={{
                                            fontSize: 14,
                                            fontWeight: 'bold',
                                            color: '#1d3a8a',
                                            marginRight: 12,
                                        }}>
                                            ${cost.amount}
                                        </Text>
                                        <TouchableOpacity onPress={() => handleDelete(cost.id)}>
                                            <Icon name="trash" size={16} color="#d11a2a" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ))
                        ) : (
                            <Text style={{ fontSize: 14, color: '#888', fontStyle: 'italic' }}>
                                No other costs added.
                            </Text>
                        )}
                    </View>

                </View>
            </View>
        </Modal>
    );
};

export default OtherCostsModal;
