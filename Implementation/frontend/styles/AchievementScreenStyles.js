import { StyleSheet } from "react-native";

export default StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    card: {
        backgroundColor: '#f2f2f2',
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    badgeImage: {
        width: 80,
        height: 80,
        resizeMode: 'contain',
        marginTop: 10,
    },
    progressBar: {
        color: "#1E3A8A",
        marginTop: 10,
        width: '100%',
        marginTop: 10,
        marginLeft: 0,
        marginRight: 0,
    },
    progressText: {
        marginTop: 5,
        fontSize: 12,
        color: '#666',
    }
});
