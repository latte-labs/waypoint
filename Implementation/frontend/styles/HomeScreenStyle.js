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
        paddingBottom: 10,
        marginTop: 30,
        marginLeft: 20,
    },

    takeQuizContainer: {
        backgroundColor: '#FFDD57',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        height: '80%',
        width: '100%',
        marginLeft: 20, 
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
        width: '98%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
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
        marginLeft: 7,
        marginTop: 10, // Add slight top space if needed
        marginBottom: 6, // Reduce space before the cards    
    },

    titleText: {
        fontSize: 18,
        fontWeight: 'bold',
    },

    // ✅ TRIPS LIST (30% HEIGHT)
    tripScrollView: {
        height: height * 0.28, // slightly shorter if needed
        marginTop: 0, // make sure no added vertical gap
    },
    
    tripCard: {
        borderRadius: 15,
        borderWidth: 0.25,
        padding: 0,
        alignItems: 'center',
        justifyContent: 'center',
        width: width - 32, // full width minus horizontal padding
        height: '90%',
        marginRight: 16,
        overflow: 'hidden',
      },
      

    tripTitle: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        paddingHorizontal: 10,
    },

    tripDate: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 12,
        marginTop: 5,
    },
    tripImage: {
        width: '100%',
        height: '100%',
        position: 'absolute', //position image behind text
        top:0,
        left: 0,
        resizeMode: 'cover',
      },
    tripOverlay: {
        position: 'absolute',
        top:0,
        left:0,
        right:0,
        bottom:0,
        backgroundColor: 'rgba(0,0,0,0.4)'
    },
    floatingButton: {
        position: 'absolute',
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#1E3A8A',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 999,
        left: 0,
        top: 0,
      },
      innerButton: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 30,
      },
      checklistCard: {
        backgroundColor: 'white',
        borderRadius: 20,
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginTop: 8,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3, // for Android
      },
      
});

export default HomeScreenStyles;
