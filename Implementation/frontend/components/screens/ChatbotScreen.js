import React, { useRef, useState, useEffect } from "react";
import { Modal, View, Text, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Image, Platform } from "react-native";
import axios from "axios";
import styles from "../../styles/ChatbotScreenStyles";
import API_BASE_URL from "../../config";
import SafeAreaWrapper from "./SafeAreaWrapper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MarkdownDisplay from "react-native-markdown-display";
import database from '@react-native-firebase/database';
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";

const ChatbotScreen = () => {
  const [user, setUser] = useState(null);
  //const [messages, setMessages] = useState([]);
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi! My name is WayPointer, your personal travel assistant! Ask me for recommendations and I'll provide suggestions based on your travel style." }
  ]);
  //const [messages, setMessages] = useState([{role: "assistant", content: "Hi! My name is WayPointer, your personal travel assistant! Ask me for recommendations and i'll provide suggestions based on your travel style"}]);
  const [input, setInput] = useState("");
  const [travelStyle, setTravelStyle] = useState(null);
  const [isTyping, setIsTyping] = useState(false); // Track when bot is typing
  const [typingDots, setTypingDots] = useState("");
  const inputRef = useRef(null);
  const [profileImage, setProfileImage] = useState(null);
  const [isHistoryVisible, setIsHistoryVisible] = useState(false);
  const [persistedHistory, setPersistedHistory] = useState([]);

  // Load the persisted chat history ONCE on mount so that it persists during the session
  useEffect(() => {
    const loadPersistedHistory = async () => {
      try {
        const storedHistory = await AsyncStorage.getItem("chatHistory");
        if (storedHistory) {
          setPersistedHistory(JSON.parse(storedHistory));
        } else {
          setPersistedHistory([]);
        }
      } catch (error) {
        console.error("Error loading persisted chat history: ", error);
      }
    };
    loadPersistedHistory();
  }, []);

  // Append a new message to persistedHistory and update AsyncStorage
  const appendToPersistedHistory = async (newMessage) => {
    setPersistedHistory((prev) => {
      // Avoid appending a duplicate welcome message when starting a new chat.
      if (newMessage.role === "assistant" && newMessage.content.includes("WayPointer") && prev.length === 0) {
        return prev;
      }
      const updatedHistory = [...prev, newMessage];
      const limitedHistory = updatedHistory.slice(-10);
      AsyncStorage.setItem("chatHistory", JSON.stringify(limitedHistory));
      return limitedHistory;
    });
  };

  // Fetch User & Travel Style on Component Mount
  useEffect(() => {
    const fetchUserTravelStyle = async () => {
      try {
        console.log("🔄 Fetching user data from AsyncStorage...");
        const storedUser = await AsyncStorage.getItem("user");

        const storedImage = await AsyncStorage.getItem('profileImage');
        if (storedImage) {
          setProfileImage(storedImage);
        }

        if (!storedUser) {
          console.error("❌ No user found in AsyncStorage!");
          setTravelStyle("general");
          return;
        }

        const userData = JSON.parse(storedUser);
        setUser(userData);
        console.log("📥 Retrieved Travel Style ID:", userData.travel_style_id);

        if (userData.travel_style_id && userData.travel_style_id !== 4) {
          await fetchTravelStyle(userData.travel_style_id);
        } else {
          setTravelStyle("general");
        }
      } catch (error) {
        console.error("❌ Error loading user data:", error);
        setTravelStyle("general");
      }
    };

    fetchUserTravelStyle();
  }, []);

  useEffect(() => {
    if (!isTyping) return;

    const interval = setInterval(() => {
      setTypingDots((prev) => (prev.length < 3 ? prev + "." : ""));
    }, 500); // Updates every 500ms

    return () => clearInterval(interval);
  }, [isTyping]);

  // Fetch Travel Style Name from Backend
  const fetchTravelStyle = async (travelStyleId) => {
    try {
      console.log(`🔄 Fetching travel style details for ID: ${travelStyleId}`);
      const response = await axios.get(`${API_BASE_URL}/travel-styles/${travelStyleId}`);

      if (response.status === 200 && response.data) {
        console.log("✅ Travel Style Retrieved:", response.data.name);
        setTravelStyle(response.data.name.toLowerCase()); // Ensure lowercase for API
      } else {
        console.warn("⚠️ Travel Style API response missing data.");
        setTravelStyle("general");
      }
    } catch (error) {
      console.error("❌ Error fetching travel style:", error.response?.data || error.message);
      setTravelStyle("general");
    }
  };

  const sendMessage = async () => {
    if (!input || !input.trim()) return; //checking for null, undefined and empty string or empty result

    if (!travelStyle) {
      console.log("⚠️ Travel style not ready yet, waiting...");
      return;
    }

    const userMessage = { role: "user", content: input };
    if (user?.id) {
      const usedChatRef = database().ref(`/users/${user.id}/onboarding/used_chat`);
      usedChatRef.set(true);
    }
    setMessages((prevMessages) => {
      const updatedMessages = [{ role: "assistant", content: "..." }, userMessage, ...prevMessages];
      appendToPersistedHistory(userMessage);
      return updatedMessages;
    });

    setInput("");
    if (inputRef.current) {
      inputRef.current.clear();
    }
    setIsTyping(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/chatbot/`, { user_message: input, travel_style: travelStyle });
      setIsTyping(false);
      const botReply = { role: "assistant", content: response.data.response };
      setMessages((prevMessages) => {
        const updatedMessages = [botReply, ...prevMessages.filter(msg => msg.content !== "...")];
        appendToPersistedHistory(botReply);
        return updatedMessages;
      });
    } catch (error) {
      console.error("Chatbot API Error:", error);
      setIsTyping(false);
      setMessages((prevMessages) => [
        { role: "assistant", content: "Sorry, I couldn't process that request." },
        ...prevMessages.filter(msg => msg.content !== "...")
      ]);
    }
  };

  // Function to toggle chat history modal visibility
  const toggleHistoryModal = () => {
    setIsHistoryVisible(!isHistoryVisible);
  };

  return (
    //prevents keyboard from covering the input field on ios
    <SafeAreaWrapper>
      <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>WayPointer</Text>
            <Text style={styles.headerAvatar}>💬</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TouchableOpacity onPress={toggleHistoryModal}>
                <FontAwesome5 name="history" size={20} color="#007bff" style={{ marginRight: 10 }} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Chat Display */}
          <FlatList
            data={messages} //messages array to display a chat history
            keyExtractor={(item, index) => index.toString()} //each message has a unique key
            renderItem={({ item }) => (
              <View style={[styles.messageContainer, item.role === "user" ? styles.userMessageContainer : styles.botMessageContainer]}>

                {/* Chatbot Avatar */}
                {item.role === "assistant" && (
                  <Image source={require("../../assets/images/chatbot.png")} style={styles.botAvatar} />
                )}

                {/* User Message */}
                {item.role === "user" && (
                  <>
                    <View style={item.role === "user" ? styles.userMessage : styles.botMessage}>
                      <Text style={[styles.messageText, item.role === "user" ? { color: "#fff" } : { color: "#000" }]}>
                        {item.content === "..." ? typingDots : item.content}
                      </Text>
                    </View>
                    <Image
                      source={profileImage ? { uri: profileImage } : require("../../assets/images/woman.png")}
                      style={styles.userAvatar}
                    />
                  </>
                )}


                {/* Bot Message */}
                {item.role === "assistant" && (
                  <View style={styles.botMessage}>
                    <MarkdownDisplay style={styles.messageText}>{item.content === "..." ? typingDots : item.content}</MarkdownDisplay>
                  </View>
                )}

              </View>
            )}
            inverted
          />

          {/* Input Field & Send Button */}
          <View style={styles.inputContainer}>
            <TextInput
              ref={inputRef}
              style={styles.input}
              placeholder="Ask about travel..."
              value={input}
              onChangeText={setInput}
              onSubmitEditing={sendMessage} //submits when enter is pressed
            />
            <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
              <Text style={styles.sendButtonText}>➤</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* Chat History Modal */}
      <Modal
        visible={isHistoryVisible}
        transparent={false}
        animationType="slide"
        onRequestClose={toggleHistoryModal}
      >
        <SafeAreaWrapper>
          <View style={{ flex: 1 }}>
            {/* Modal Header */}
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: 60, // THIS IS FOR THE SAFE AREA OF CHAT HISTORY
              //marginTop: 10, // THIS IS FOR THE SAFE AREA OF CHAT HISTORY
              padding: 20,
              paddingHorizontal: 30,
              borderBottomWidth: 1,
              borderBottomColor: "#ddd"
            }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Chat History</Text>
              <TouchableOpacity onPress={toggleHistoryModal}>
                <FontAwesome5 name="times" size={20} color="#007bff" />
              </TouchableOpacity>
            </View>
            {/* Render chat history using the same FlatList and renderItem as the main chat display */}
            <FlatList 
              data={persistedHistory}
              style={{ padding: 0, marginBottom: 50 }}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <View style={[
                  styles.messageContainer,
                  item.role === "user" ? styles.userMessageContainer : styles.botMessageContainer
                ]}>
                  {item.role === "assistant" && (
                    <Image
                      source={require("../../assets/images/chatbot.png")}
                      style={styles.botAvatar}
                    />
                  )}
                  {item.role === "user" && (
                    <>
                      <View style={item.role === "user" ? styles.userMessage : styles.botMessage}>
                        <Text style={[
                          styles.messageText,
                          item.role === "user" ? { color: "#fff" } : { color: "#000" }
                        ]}>
                          {item.content}
                        </Text>
                      </View>
                      <Image
                        source={profileImage ? { uri: profileImage } : require("../../assets/images/woman.png")}
                        style={styles.userAvatar}
                      />
                    </>
                  )}
                  {item.role === "assistant" && (
                    <View style={styles.botMessage}>
                      <MarkdownDisplay style={styles.messageText}>
                        {item.content}
                      </MarkdownDisplay>
                    </View>
                  )}
                </View>
              )}
              //inverted
            />
          </View>
        </SafeAreaWrapper>
      </Modal>
    </SafeAreaWrapper>
  );
};

export default ChatbotScreen;
