import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingVertical: 20,
        paddingHorizontal: 10,
        height: '100%',
    },
    questionTitle: {
        fontSize: 26,
        paddingVertical: 10,
        alignSelf: 'flex-start',
        marginStart: 30,
    },
    question: {
        alignSelf: 'flex-start',
        paddingVertical: 10, 
        marginStart: 30,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
    },
    button: {
        backgroundColor: '#a9a9a9',
        paddingVertical: '20',
        paddingHorizontal: '30',
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        height: 60,
        margin: 10,
        minWidth: '40%',
    },
    buttonText: {
        color: 'black',
        fontSize: 16,
    }
})

export default styles;