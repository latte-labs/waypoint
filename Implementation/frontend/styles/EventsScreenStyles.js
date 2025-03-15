import { StyleSheet } from "react-native";

export default StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: "white",
        borderBottomWidth: 1,
    },

    cardLayout: {
        marginTop: 20,
        flexDirection: "row",
        borderWidth: 1,
        width: "90%",
        height: "15%",
        alignItems: "center",
        alignSelf: "center",
        borderRadius: 20,
        borderColor: "#ddd",
        shadowColor: "black",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.6,
        shadowRadius: 4,
    },

    title: {
        textAlign: "center",
        fontSize: 22,
        marginTop: 10,
    },

    eventDetailsContainer: {
        //borderWidth: 1,
        //borderColor: "red",

        flexDirection: "column",
        width: "30%",
        padding: 10,
    },

    eventNameContainer: {
        //borderWidth: 1,
        //borderColor: "blue",

        width: "70%",
        padding: 10,
    },

    eventDay: {
        textAlign: 'center',
    },
    eventDate: {
        textAlign: 'center',
    },
    eventMonth: {
        textAlign: 'center',
    },
    eventTitle: {
        textAlign: 'center',
    },
})