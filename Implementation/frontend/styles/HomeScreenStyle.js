import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

const HomeScreenStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
        padding: 15,
        marginBottom: 70,
    },

    // ✅ HEADER SECTION (30% HEIGHT)
    headerContainer: {
        height: height * 0.1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
    },

    takeQuizContainer: {
        backgroundColor: '#FFDD57',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        height: '80%',
        width: '100%',
    },

    takeQuizText: {
        fontSize: 12,
        marginBottom: 4,
    },

    takeQuizButton: {
        backgroundColor: '#FFAA00',
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 12,
        marginTop: 5,
    },

    takeQuizButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 14,
    },
    brandContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-start', 
        alignItems: 'center', 
        height: '80%',
        marginRight: 10,
        paddingLeft: 0,
    },

    waypointText: {
        fontSize: 22,
        fontWeight: 'bold',
    },

    logo: {
        width: 50,
        height: 50,
        marginRight: 5,
    },

    //WEATHER
    weatherBox: {
        width: '80%',
        height: '15%',
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 12,
        padding: 5,
        borderWidth: 0.25,
        borderColor: "grey",
        shadowColor: "grey",
        shadowOffset: {width: 0, height: 3},
        shadowOpacity: 0.5,
        shadowRadius: 2,
        marginBottom: 10,
    },

    weatherHorizontal: {
        flexDirection: 'row'
    },

    weatherHorizontalText: {
        fontSize: 10,
        alignSelf: 'center',
        fontSize: 16,
    },

    weatherText: {
        fontSize: 10,
    },

    weather_icon: {
        width: 30,
        height: 30,
    },

    profileButton: {
        width: height * 0.08,
        height: height * 0.08,
        borderRadius: 50,
        backgroundColor: '#FF6F00',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 10,
    },

    profileIcon: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'white',
    },

    // ✅ SEARCH BAR (10% HEIGHT)
    searchContainer: {
        height: height * 0.05,
        justifyContent: 'center',
        width: 350,
    },

    searchInput: {
        width: '100%',
        height: 40,
        backgroundColor: '#f2f2f2',
        borderRadius: 20,
        borderWidth: 0.25,
        paddingHorizontal: 20,
    },

    // ✅ TITLE SECTION (5% HEIGHT)
    titleContainer: {
        height: height * 0.05,
        justifyContent: 'center',
    },

    titleText: {
        fontSize: 18,
        fontWeight: 'bold',
    },

    // ✅ TRIPS LIST (30% HEIGHT)
    tripScrollView: {
        height: height * 0.3,
    },

    tripCard: {
        backgroundColor: '#f2f2f2',
        borderRadius: 15,
        borderWidth: 0.25,
        padding: 15,
        alignItems: 'center',
        justifyContent: 'center',
        width: 250,
        height: '80%',
        marginRight: 15,
    },

    tripTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },

    tripDate: {
        fontSize: 12,
        marginTop: 5,
    },

    // ✅ CURRENT FAVORITE DESTINATIONS (20% HEIGHT)
    favoriteTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 10,
    },

    favoriteScrollView: {
        height: height * 0.2,
    },

    favoriteCard: {
        backgroundColor: "#D3E3FC",
        borderRadius: 15,
        borderWidth: 0.25,
        padding: 15,
        alignItems: 'center',
        justifyContent: 'center',
        width: 220,
        height: '80%',
        marginRight: 15,
    },

    favoritePlace: {
        fontSize: 18,
        fontWeight: 'bold',
    },

    favoriteLocation: {
        fontSize: 12,
        marginTop: 5,
    },
});

export default HomeScreenStyles;
