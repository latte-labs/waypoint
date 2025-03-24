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
    titleContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        marginBottom: 15,
      },
      title: {
        fontSize: 18,
        fontWeight: "200",
        textAlign: 'center',
        paddingBottom: 7,
        backgroundColor: 'transparent',
        marginBottom: 7,
      },
      borderShadow: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 0.75,
        backgroundColor: 'grey',
        shadowColor: '#000',
        shadowOffset: { width: 3, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 2,
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
        // borderBottomColor: "#ddd",
        // shadowColor: "#000",
        // shadowOffset: { width: 0, height: 3 },
        // shadowOpacity: 0.2,
        // shadowRadius: 2,
    },
    badgeImage: {
        width: 60,
        height: 60,
        resizeMode: 'contain',
        marginBottom: 4,
    },

    gridProgressBar: {
        width: '100%',
        marginVertical: 10,
        borderRadius: 10,
        marginHorizontal: 20,
        height: 10,
    },

    /* MODAL STYLES */
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)', // semi-transparent overlay
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '80%',
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
    },
    modalCloseButton: {
        alignSelf: 'flex-end',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    modalTrophyImage: {
        width: 120,
        height: 120,
        resizeMode: 'contain',
        marginBottom: 10,
    },
    modalCategoryText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    modalProgressText: {
        fontSize: 14,
        color: '#666',
        marginBottom: 10,
    },
    modalDescription: {
        fontSize: 14,
        color: '#333',
        textAlign: 'center',
        marginBottom: 15,
        paddingHorizontal: 20,
    },
    modalTiersRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        marginTop: 10,
    },
    modalTierIcon: {
        width: 50,
        height: 50,
        resizeMode: 'contain',
    },
    modalProgressBar: {
        width: '100%',
        marginVertical: 10,
        borderRadius: 10,
        marginHorizontal: 20,
    },
});
