import { StyleSheet } from "react-native"

export default StyleSheet.create({

    image: {
        minWidth: 50,
        minHeight: 50,
        width: 200,
        height: 200,
        alignSelf: 'center',
        marginVertical: 30,
        marginTop: 150,
    },

    allowButton: {
        marginHorizontal: 15,
        marginTop: 90,
        marginBottom: 20,
        alignSelf: 'center', //centers in the screen
        alignItems:'center', //centers text (horizontal)
        padding: 10,
        borderRadius: 30,
        width: 200,
        borderWidth: 0,
        borderColor: "#1E3A8A",
        shadowColor: "#1E3A8A",
        shadowOffset: {width: 0, height: 5},
        shadowOpacity: 0.8,
        shadowRadius: 6,
        backgroundColor: '#D6E4FF'
    },

    buttonText: {
        color: "#1E3A8A",
    },
    
    titleContainer: {
        marginHorizontal: 50,
        marginTop: 20,
        alignItems: 'center', //centers text (horizontal)
    },

    textContainer: {
        marginHorizontal: 70,
        marginVertical: 20,
        alignItems: 'center',
    },

    textTitle: {
        fontWeight: '500',
        fontSize: 18,
    },

    text: {
        fontWeight: '200',
        fontSize: 14,
        textAlign: 'center'
    }
})