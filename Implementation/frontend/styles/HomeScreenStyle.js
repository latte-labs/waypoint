import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const HomeScreenStyles = StyleSheet.create({

    container: {
        flex: 1,
        justifyContent: 'flex-start',
        alignContent: 'center',
        padding: 20,
    },
    scrollContainer: {
        flexGrow: 1,
        paddingBottom: 20,
    },
    searchbar: {
        width: '70%',
        height: 40,
        backgroundColor: '#f2f2f2',
        borderRadius: 20,
        borderWidth: 0.5,
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
    },
    card: {
        backgroundColor: "#f2f2f2",
        borderRadius: 15,
        borderWidth: 0,
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
    }
})

export default HomeScreenStyles;