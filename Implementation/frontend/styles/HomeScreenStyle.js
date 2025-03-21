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
        height: height * 0.05, // Reduce even more
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom: 10
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
        alignItems: 'center',
        height: '90%', 
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
    weatherContainer: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 10,
        marginVertical: 10,
        alignSelf: 'center',
        justifyContent: 'center',
        width: '90%',
        height: height * 0.08, // 15% of the screen height
        borderWidth: 0.15,
        borderColor: 'black',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
    },

    weatherRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
    },

    cityText: {
        paddingLeft: 10,
        color: 'black',
        fontSize: 18,
        fontWeight: 'regular',
        marginRight: 70,
    },

    temperatureText: {
        color: 'black',
        fontSize: 28,
        fontWeight: 'regular',
    },

    weatherIcon: {
        width: 60,
        height: 60,
        resizeMode: 'contain',
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
});

export default HomeScreenStyles;
