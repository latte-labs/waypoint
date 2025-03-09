import { StyleSheet, Platform } from 'react-native';

const BottomNavigatorStyles = StyleSheet.create({
    tabBar: {
        backgroundColor: 'white',
        height: Platform.OS === 'ios' ? 100 : 60,
        paddingBottom: Platform.OS === 'ios' ? 5 : 2,
        borderWidth: 1,
        paddingTop: 11,
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
