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
    columnWrapper: {
        justifyContent: 'space-between',
        marginBottom: 20,
    },

    // Each grid item
    gridItem: {
        flex: 1,
        alignItems: 'center',
        marginHorizontal: 5,
        backgroundColor: 'white',
        borderRadius: 15,
        padding: 10,
        borderBottomColor: "#ddd",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    badgeImage: {
        width: 60,
        height: 60,
        resizeMode: 'contain',
        marginBottom: 8,
    },
    gridItemTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    gridItemCheckins: {
        fontSize: 12,
        marginBottom: 5,
        color: '#333',
    },
    gridProgressBar: {
        width: '100%',   // fill the item width
        marginTop: 5,
    },
    gridProgressText: {
        fontSize: 11,
        color: '#666',
        marginTop: 4,
    },

});
