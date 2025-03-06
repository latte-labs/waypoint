import { StyleSheet, Platform } from 'react-native';

const BottomNavigatorStyles = StyleSheet.create({
    // ✅ Ensures Safe Margins for Bottom Navigation
    safeContainer: {
        flex: 1,
        backgroundColor: 'white',
    },
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
        marginHorizontal: 20,
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.5,
        shadowRadius: 5,
        alignItems: 'center', // items align properly
        justifyContent: "space-between",
        paddingTop: 11,
    },
    tabBarLabel: {
        fontSize: 12,
        fontWeight: 'bold',
        paddingTop: 5,
        paddingBottom: 10, 
        
    },
    /* Small Popup Menu Styles */
    popupMenu: {
        position: 'absolute',
        bottom: 150, // Position just above the "More" tab
        right: 30, // Align with "More" tab
        backgroundColor: 'white',
        borderRadius: 10,
        paddingVertical: 5,
        width: 150, // Adjust width
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        overflow: 'hidden',
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
