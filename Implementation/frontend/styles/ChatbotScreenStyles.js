import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 10,
  },
  messageContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 5,
  },
  
  userMessageContainer: {
    justifyContent: "flex-end",
  },
  
  botMessageContainer: {
    justifyContent: "flex-start",
    flexDirection: "row",
    alignItems: "flex-end",
    marginLeft: 0,
    paddingLeft: 10
  },
  
  botAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
    alignSelf: "flex-end",
  },
  
  userMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#0084ff",
    padding: 10,
    borderRadius: 20,
    borderBottomRightRadius: 0,
    marginVertical: 4,
    marginRight: 5,
    maxWidth: "70%",
  },
  botMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#f1f1f1",
    padding: 10,
    borderRadius: 20,
    borderBottomLeftRadius: 0,
    marginLeft: 5,
    marginBottom: 17,
    marginVertical: 5,
    maxWidth: "70%",
  },
  messageText: {
    color: "#000",
    padding: 5,
  },
  inputContainer: {
    flexDirection: "row",
    paddingTop: 20,
    paddingHorizontal: 20,
    borderColor: "#ddd",
    marginBottom: 120,
    marginTop: 15,
  
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 30,
    padding: 10,
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    borderWidth: 1,
    zIndex: 100, 
  },
  sendButton: {
    backgroundColor: "#0084ff",
    padding: 10,
    borderRadius: 20,
  },
  sendButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
