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
    flexDirection: "row",
    alignItems: "flex-end",
    marginRight: 0,
    paddingRight: 10,
  },
  
  botMessageContainer: {
    justifyContent: "flex-start",
    flexDirection: "row",
    alignItems: "flex-end",
    marginLeft: 0,
    paddingLeft: 10,
  },
  
  botAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
    alignSelf: "flex-end",
  },

  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginLeft: 8, 
    alignSelf: "flex-end", 
  },
  
  userMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#0084ff",
    padding: 10,
    borderRadius: 20,
    borderBottomRightRadius: 0,
    marginVertical: 4,
    marginBottom: 17,
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
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 30,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginHorizontal: 20,
    marginBottom: 120,
    marginTop: 15,
    borderWidth: 1,
    borderColor: "#ddd",
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 5},
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  sendButton: {
    backgroundColor: "#fff",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonText: {
    fontSize: 35,
    color: "#0084ff",
    textAlign: "center",
  },
});
