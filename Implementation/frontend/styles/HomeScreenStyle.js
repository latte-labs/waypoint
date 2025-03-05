import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const HomeScreenStyles = StyleSheet.create({
    // ✅ Ensures Safe Margins for Apple Devices
    safeContainer: {
        flex: 1,
        backgroundColor: 'white',
        paddingBottom: 20,  // ✅ Prevents UI elements from overlapping with iPhone home bar
    },
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        alignContent: 'center',
        padding: 20,
        backgroundColor: 'white',
    },
    scrollContainer: {
        flexGrow: 1,
        paddingBottom: 20,
        backgroundColor: 'white'
    },
    searchbar: {
        width: '70%',
        height: 40,
        backgroundColor: '#f2f2f2',
        borderRadius: 20,
        borderWidth: 0.25,
        paddingHorizontal: 20,
        marginStart: 15,
    },
    myTrips: {
        flex: 1,
        marginTop: 20,
        marginHorizontal: 15,
    },
    myTripsTitle: {
        fontSize: 22,   
        marginTop: 10,
    },
    card: {
        backgroundColor: "#f2f2f2",
        borderRadius: 15,
        borderWidth: 0.25,
        padding: 0,
        alignItems: 'center',
        justifyContent: 'center',
        width: width * 0.8,
        height: 200,
        marginTop: 15,
        marginStart: 0,
    },
    tripName: {
        fontSize: 20,
    },
    date: {
        fontSize: 12,
        marginTop: 5,
    },

    // ✅ New Styles for "Take Quiz" Card
    quizCard: {
        width: '100%',
        backgroundColor: '#FFDD57',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10,
        borderRadius: 10,
        marginBottom: 10,
    },
    quizText: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    quizButton: {
        backgroundColor: '#FFAA00',
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 5,
    },
    quizButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
});

export default HomeScreenStyles;
