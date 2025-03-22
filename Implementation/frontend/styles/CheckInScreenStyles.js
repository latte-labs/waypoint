import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    container: {
        flex: 1,
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
    map: {
        flex: 1,
    },
    bottomCard: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 16,
        backgroundColor: '#FFF',
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,

        // optional shadow for iOS
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    placeTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    placeCategory: {
        color: '#666',
        marginTop: 4,
    },
    checkInButton: {
        marginTop: 10,
        paddingVertical: 12,
        paddingHorizontal: 20,
        backgroundColor: 'green',
        borderRadius: 8,
        alignItems: 'center',
    },
});

export default styles;
