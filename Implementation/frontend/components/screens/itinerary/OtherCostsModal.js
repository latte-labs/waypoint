import React, { useState, useRef, useEffect } from 'react';
import { 
    Modal, View, Text, TextInput, TouchableOpacity, FlatList, Alert, KeyboardAvoidingView, ScrollView, Platform, Animated 
} from 'react-native';
import costTypes from '../../../src/data/costTypes.json';
import { database } from '../../../firebase';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

const OtherCostsModal = ({ visible, onClose, otherCosts, setOtherCosts, itineraryId }) => {
    const [selectedType, setSelectedType] = useState(null);
    const [selectedSubtypes, setSelectedSubtypes] = useState([]);
    const [itemName, setItemName] = useState('');
    const [amount, setAmount] = useState('');
    const [showSaveMessage, setShowSaveMessage] = useState(false);
    const [mode, setMode] = useState('helper');
    const fadeAnim = useRef(new Animated.Value(0)).current;

    // ✅ Get subtypes based on selected type
    const subtypes = selectedType ? costTypes[selectedType] : [];

    // ✅ Handle Save (Add Cost to List)
    const handleSave = async () => {
        // 🔹 Manual Mode
        if (mode === 'manual') {
            if (!itemName.trim() || !amount.trim()) {
                Alert.alert("Error", "Please enter a cost category and amount.");
                return;
            }
    
            const newCost = {
                id: Date.now().toString(),
                type: itemName.trim(), // user-defined category
                subtypes: [],
                item: '', // no item description
                amount: parseFloat(amount),
            };
    
            await saveCostToFirebase(newCost);
            return;
        }
    
        // 🔹 Helper Mode
        if (!selectedType || !itemName.trim() || !amount.trim()) {
            Alert.alert("Error", "Please fill in cost type, item name, and amount.");
            return;
        }
    
        if (selectedSubtypes.length === 0) {
            Alert.alert("Error", "Please select at least one subtype in Helper Mode.");
            return;
        }
    
        const newCost = {
            id: Date.now().toString(),
            type: selectedType.trim(),
            subtypes: selectedSubtypes,
            item: itemName.trim(),
            amount: parseFloat(amount),
        };
    
        await saveCostToFirebase(newCost);
    };
    const saveCostToFirebase = async (newCost) => {
        const updatedCosts = [...otherCosts, newCost];
        setOtherCosts(updatedCosts);
    
        try {
            await database()
                .ref(`/live_itineraries/${itineraryId}/other_costs`)
                .set(updatedCosts);
            console.log("✅ Other costs saved to Firebase");
    
            setShowSaveMessage(true);
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }).start(() => {
                setTimeout(() => {
                    Animated.timing(fadeAnim, {
                        toValue: 0,
                        duration: 300,
                        useNativeDriver: true,
                    }).start(() => setShowSaveMessage(false));
                }, 1500);
            });
    
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
        setSelectedSubtypes([]);
        setItemName('');
        setAmount('');
    };
    

    const toggleSubtype = (item) => {
        setSelectedSubtypes((prev) => {
            if (prev.includes(item)) {
                return prev.filter(sub => sub !== item);
            } else {
                return [...prev, item];
            }
        });
    };    
    const handleInfoPress = () => {
        Alert.alert(
          "Modes Explained",
          "🔹 Helper Mode: Select from predefined cost categories and subtypes.\n\n🔹 Manual Mode: Type your own custom category directly.\n\nChoose the one that fits your workflow!",
          [{ text: "Got it", style: "default" }]
        );
      };
      

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: 'rgba(0,0,0,0.5)'
            }}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={{
                        width: '90%',
                        maxHeight: '90%',
                        backgroundColor: '#fff',
                        borderRadius: 20,
                        padding: 20,
                        shadowColor: '#000',
                        shadowOpacity: 0.1,
                        shadowOffset: { width: 0, height: 2 },
                        shadowRadius: 8,
                        elevation: 4,
                    }}
                >
                    <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                    <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>Manage Other Costs</Text>
                    <View
                        style={{
                            flexDirection: 'row',
                            marginBottom: 12,
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                    >
                        <TouchableOpacity
                        onPress={handleInfoPress}
                        style={{
                            paddingVertical: 6,
                            paddingHorizontal: 12,
                            borderRadius: 20,
                            backgroundColor: '#eef1f7',
                            marginRight: 8,
                            justifyContent: 'center',
                            alignItems: 'center',
                            height: 36, // same height as other buttons
                        }}
                        >
                        <FontAwesome name="info-circle" size={18} color="#1d3a8a" />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={{
                            paddingVertical: 6,
                            paddingHorizontal: 12,
                            borderRadius: 20,
                            backgroundColor: mode === 'helper' ? '#1d3a8a' : '#ccc',
                            marginRight: 8,
                            }}
                            onPress={() => setMode('helper')}
                        >
                            <Text style={{ color: '#fff', fontWeight: 'bold' }}>Helper Mode</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={{
                            paddingVertical: 6,
                            paddingHorizontal: 12,
                            borderRadius: 20,
                            backgroundColor: mode === 'manual' ? '#1d3a8a' : '#ccc',
                            }}
                            onPress={() => setMode('manual')}
                        >
                            <Text style={{ color: '#fff', fontWeight: 'bold' }}>Manual Mode</Text>
                        </TouchableOpacity>
                    </View>

                    {mode === 'helper' && (
                    <>
                        {/* Cost Type Selection */}
                        <Text style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 6, color: '#1d3a8a' }}>
                        Select Cost Type
                        </Text>
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
                            }}>{item}</Text>
                            </TouchableOpacity>
                        )}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={{ marginBottom: 10 }}
                        />

                        {selectedType && (
                        <>
                            <Text style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 6, color: '#1d3a8a' }}>
                            Select Subtype
                            </Text>
                            <FlatList
                            data={subtypes}
                            keyExtractor={(item) => item}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                style={{
                                    paddingVertical: 8,
                                    paddingHorizontal: 16,
                                    backgroundColor: selectedSubtypes.includes(item) ? '#1d3a8a' : '#eef1f7',
                                    borderRadius: 20,
                                    marginRight: 10,
                                    marginBottom: 6,
                                }}
                                onPress={() => toggleSubtype(item)}
                                >
                                <Text style={{
                                    fontSize: 14,
                                    fontWeight: 'bold',
                                    color: selectedSubtypes.includes(item) ? '#fff' : '#1d3a8a',
                                }}>{item}</Text>
                                </TouchableOpacity>
                            )}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            style={{ marginBottom: 10 }}
                            />
                        </>
                        )}
                    </>
                    )}


                    {/* Shared Inputs for Both Modes */}
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
                    placeholder={
                        mode === 'manual'
                          ? "Enter cost category name (e.g., SIM Card, Laundry)"
                          : "Enter item detail (e.g., Taxi to airport)"
                      }
                    value={itemName}
                    onChangeText={setItemName}
                    />

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
                    <View style={{ marginTop: 24, width: '100%', marginBottom: 20, }}>
                        <View style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: 10,
                        }}>
                            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#1d3a8a' }}>
                                Saved Other Costs
                            </Text>

                            {showSaveMessage && (
                                <Animated.View style={{
                                    opacity: fadeAnim,
                                    backgroundColor: '#d1fae5',
                                    paddingVertical: 4,
                                    paddingHorizontal: 12,
                                    borderRadius: 20,
                                }}>
                                    <Text style={{ color: '#065f46', fontWeight: '600', fontSize: 12 }}>
                                        ✅ Cost saved
                                    </Text>
                                </Animated.View>
                            )}

                        </View>


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
                                    <View style={{ flex: 1, paddingRight: 8, maxWidth: '70%' }}>
                                    <Text
                                        style={{
                                        fontSize: 14,
                                        fontWeight: '600',
                                        color: '#333',
                                        flexWrap: 'wrap',
                                        }}
                                    >
                                        {cost.type}
                                        {cost.subtypes && cost.subtypes.length > 0 && ` - ${cost.subtypes.join(', ')}`}
                                    </Text>
                                    </View>

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
                                            <FontAwesome name="trash" size={16} color="#d11a2a" />
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
                </ScrollView>
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
};

export default OtherCostsModal;
