import { StyleSheet } from 'react-native';

export const navigationStyles = StyleSheet.create({
    container: {
        flex: 1,
    },
    navContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        height: 100,
        backgroundColor: "#FFF",
        borderTopWidth: 1,
        borderColor: "#DDD",
        paddingBottom: 10,
        paddingTop: 4,
    },
    navItem: {
        height: 50,
        minWidth: 50,
        padding: 5,
        marginBottom: 15,
        marginHorizontal: 0,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10,
    },
    navItemActive: {
        backgroundColor: "#1E3A8A",
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 30,
        minWidth: 130,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },
    navContent: {
        flexDirection: "column", // Default layout (icon only)
        alignItems: "center",
        justifyContent: "center",
    },
    navContentActive: {
        flexDirection: "row", // Change layout to horizontal when active
        alignItems: "center",
        justifyContent: "center",
    },
    navIcon: {
        fontSize: 24,  // Emoji size
        width: 30,
        marginLeft: 0,
        paddingLeft: 0,
    },
    navText: {
        fontSize: 16,
        color: "#FFF", // White text when active
        marginTop: 3,
        marginLeft: 0,
        flexShrink: 1, // ✅ Prevents text from pushing right
        textAlign: "center"
    },
    menuContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    menuItem: {
        padding: 15,
    },
    menuText: {
        fontSize: 22,
    },
    
    // MoreMenu Items
    moreContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    moreMenuItem: {
        padding: 15,
    },
    moreMenuText: {
        fontSize: 22,
    }

});
