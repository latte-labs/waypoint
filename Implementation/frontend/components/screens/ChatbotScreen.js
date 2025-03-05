import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform } from "react-native";
import axios from "axios";
import styles from "../../styles/ChatbotScreenStyles";
import API_BASE_URL from "../../config";  // backend API
import SafeAreaWrapper from "./SafeAreaWrapper";

const ChatbotScreen = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const sendMessage = async () => {
    if (!input || !input.trim()) return; //checking for null, undefined and empty string or empty result

    const userMessage = { role: "user", content: input };
    setMessages([...messages, userMessage]);
    setInput("");

    try {
      const response = await axios.post(`${API_BASE_URL}/chatbot/`, { user_message: input });

      const botReply = { role: "assistant", content: response.data.response };
      setMessages([...messages, userMessage, botReply]);
    } catch (error) {
      console.error("Chatbot API Error:", error);
      setMessages([...messages, userMessage, { role: "assistant", content: "Sorry, I couldn't process that request." }]);
    }
  };

  return (
    //prevents keyboard from covering the input field on ios
    <SafeAreaWrapper>
      <KeyboardAvoidingView behavior="padding" style={styles.container}>
      {/* Chat Display */}
      <FlatList
        data={messages} //messages array to display a chat history
        keyExtractor={(item, index) => index.toString()} //each message has a unique key
        renderItem={({ item }) => ( //if the message item has role of user, then use user styling (blue chat), otherwise its a bot response
          <View style={item.role === "user" ? styles.userMessage : styles.botMessage}> 
            <Text style={styles.messageText}>{item.content}</Text>
          </View>
        )}
        inverted //supposed to make the latest message appear at the bottom but its not working as intended!!!! FIX THIS
      />

      {/* Input Field & Send Button */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Ask about travel..."
          value={input}
          onChangeText={setInput}
          onSubmitEditing={sendMessage} //submits when enter is pressed
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
    </SafeAreaWrapper>
  );
};

export default ChatbotScreen;
