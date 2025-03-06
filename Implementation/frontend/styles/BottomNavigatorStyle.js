import { StyleSheet, Platform } from 'react-native';

const BottomNavigatorStyles = StyleSheet.create({
    tabBar: {
        backgroundColor: 'white',
        height: Platform.OS === 'ios' ? 80 : 60,
        paddingBottom: Platform.OS === 'ios' ? 5 : 2,
        position: "absolute",
        bottom: 60,
        left: 20,
        right: 20,
        borderRadius: 40,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.5,
        shadowRadius: 5,
        alignItems: 'center',
        justifyContent: "space-between",
        paddingTop: 11,
        zIndex: 100, 
        marginHorizontal: 20,
    },
    tabBarLabel: {
        fontSize: 12,
        fontWeight: 'bold',
        paddingTop: 5,
        paddingBottom: 10,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 1,
    },
    blurBackground: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 1,
    },
    popupMenu: {
        position: 'absolute',
        bottom: 150,
        right: 30,
        backgroundColor: 'white',
        borderRadius: 10,
        paddingVertical: 5,
        width: 150,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        overflow: 'hidden',
        zIndex: 2,
    },
    menuItem: {
        paddingVertical: 10,
        alignItems: 'center',
    },
    menuText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default BottomNavigatorStyles;
