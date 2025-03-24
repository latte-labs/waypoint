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
        paddingLeft: 10,
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
        borderRadius: 40,
        paddingHorizontal: 18,
        marginVertical: 10,
        alignSelf: 'center',
        width: '100%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 3,
        minHeight: 50,
    },
        

    weatherRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
    },
    
    cityText: {
        paddingLeft: 10,
        color: 'black',
        fontSize: 16,
    },

    temperatureText: {
        color: 'black',
        fontSize: 24,
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
    floatingButton: {
        position: 'absolute',
        zIndex: 10,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#263986',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 6,
      },
      innerButton: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
      }
      
});

export default HomeScreenStyles;
