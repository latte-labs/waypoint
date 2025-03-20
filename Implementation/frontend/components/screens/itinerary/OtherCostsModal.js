import React, { useState } from 'react';
import { 
    Modal, View, Text, TextInput, TouchableOpacity, FlatList, Alert 
} from 'react-native';
import costTypes from '../../../src/data/costTypes.json';

const OtherCostsModal = ({ visible, onClose, otherCosts, setOtherCosts }) => {
    const [selectedType, setSelectedType] = useState(null);
    const [selectedSubtype, setSelectedSubtype] = useState(null);
    const [itemName, setItemName] = useState('');
    const [amount, setAmount] = useState('');

    // ✅ Get subtypes based on selected type
    const subtypes = selectedType ? costTypes[selectedType] : [];

    // ✅ Handle Save (Add Cost to List)
    const handleSave = () => {
        if (!selectedType || !selectedSubtype || !itemName.trim() || !amount.trim()) {
            Alert.alert("Error", "Please fill in all fields.");
            return;
        }

        const newCost = {
            id: Date.now().toString(), // ✅ Generate a unique ID for tracking
            type: selectedType,
            subtype: selectedSubtype,
            item: itemName,
            amount: parseFloat(amount),
        };

        setOtherCosts(prevCosts => [...prevCosts, newCost]); // ✅ Update cost list

        Alert.alert("Success", "Other cost saved successfully!");
        resetFields(); // ✅ Reset fields after saving
    };

    // ✅ Handle Cost Deletion
    const handleDelete = (costId) => {
        setOtherCosts(prevCosts => prevCosts.filter(cost => cost.id !== costId));
        Alert.alert("Deleted", "Other cost removed.");
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
                    borderRadius: 10,
                    alignItems: 'center',
                }}>
                    <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>Manage Other Costs</Text>

                    {/* Cost Type Selection */}
                    <FlatList
                        data={Object.keys(costTypes)}
                        keyExtractor={(item) => item}
                        renderItem={({ item }) => (
                            <TouchableOpacity 
                                style={{
                                    padding: 10,
                                    backgroundColor: selectedType === item ? '#007bff' : '#eef7ff',
                                    borderRadius: 5,
                                    marginRight: 10,
                                }}
                                onPress={() => setSelectedType(item)}
                            >
                                <Text style={{ fontSize: 14, fontWeight: 'bold', color: selectedType === item ? '#fff' : '#007bff' }}>
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
                                        padding: 10,
                                        backgroundColor: selectedSubtype === item ? '#007bff' : '#f0f0f0',
                                        borderRadius: 5,
                                        marginRight: 10,
                                    }}
                                    onPress={() => setSelectedSubtype(item)}
                                >
                                    <Text style={{ fontSize: 14, fontWeight: 'bold', color: selectedSubtype === item ? '#fff' : '#007bff' }}>
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
                            borderColor: '#ddd',
                            borderRadius: 5,
                            padding: 10,
                            marginBottom: 10,
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
                            borderColor: '#ddd',
                            borderRadius: 5,
                            padding: 10,
                            marginBottom: 10,
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
                                padding: 12,
                                backgroundColor: '#007bff',
                                borderRadius: 5,
                                alignItems: 'center',
                                marginRight: 5,
                            }} 
                            onPress={handleSave}
                        >
                            <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>Save</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={{
                                flex: 1,
                                padding: 12,
                                backgroundColor: 'gray',
                                borderRadius: 5,
                                alignItems: 'center',
                            }} 
                            onPress={onClose}
                        >
                            <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>Close</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Saved Costs Preview */}
                    <View style={{ marginTop: 20, width: '100%' }}>
                        <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#007bff', marginBottom: 5 }}>
                            Saved Other Costs
                        </Text>

                        {otherCosts.length > 0 ? (
                            otherCosts.map((cost, index) => (
                                <View key={index} style={{
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    padding: 10,
                                    backgroundColor: '#f9f9f9',
                                    borderRadius: 5,
                                    marginBottom: 5
                                }}>
                                    <Text style={{ fontSize: 14, fontWeight: 'bold' }}>{cost.type} - {cost.subtype}</Text>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Text style={{ fontSize: 14, color: '#007bff', marginRight: 10 }}>${cost.amount}</Text>
                                        <TouchableOpacity onPress={() => handleDelete(cost.id)}>
                                            <Text style={{ color: 'red', fontSize: 14 }}>Remove</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ))
                        ) : (
                            <Text style={{ fontSize: 14, color: '#888', fontStyle: 'italic' }}>No other costs added.</Text>
                        )}
                    </View>

                </View>
            </View>
        </Modal>
    );
};

export default OtherCostsModal;
