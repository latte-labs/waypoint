import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 10,
  },
  userMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#0084ff",
    padding: 10,
    borderRadius: 8,
    marginVertical: 4,
    maxWidth: "75%",
  },
  botMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#f1f1f1",
    padding: 10,
    borderRadius: 8,
    marginVertical: 4,
    maxWidth: "75%",
  },
  messageText: {
    color: "#000",
  },
  inputContainer: {
    flexDirection: "row",
    padding: 10,
    borderTopWidth: 1,
    borderColor: "#ddd",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: "#0084ff",
    padding: 10,
    borderRadius: 8,
  },
  sendButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
