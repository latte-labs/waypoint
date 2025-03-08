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
    borderRadius: 20,
    borderBottomRightRadius: 0,
    marginVertical: 4,
    marginRight: 10,
    maxWidth: "75%",
  },
  botMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#f1f1f1",
    padding: 10,
    borderRadius: 20,
    borderBottomLeftRadius: 0,
    marginLeft: 10,
    marginVertical: 5,
    maxWidth: "75%",
  },
  messageText: {
    color: "#000",
  },
  inputContainer: {
    flexDirection: "row",
    paddingTop: 20,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderColor: "#ddd",
    marginBottom: 120,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 20,
    padding: 10,
    marginRight: 10,
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
