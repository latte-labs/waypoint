import { StyleSheet } from "react-native";

const QuizStyles = StyleSheet.create({
    container: {
        flexGrow: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingVertical: 20,
        paddingHorizontal: 10,
        marginTop: 25,
        height: '100%',
    },
    questionTitle: {
        fontSize: 26,
        paddingVertical: 10,
        alignSelf: 'flex-start',
        marginHorizontal: 28,
        marginTop: 20,
    },
    question: {
        alignSelf: 'flex-start',
        paddingVertical: 10, 
        marginHorizontal: 30,
        fontSize: 18,
    },
    optionsContainer: {
        alignSelf: 'flex-start',
        marginHorizontal: 30,
        marginBottom: 20,
    },
    optionText: {
        fontSize: 18,
        paddingVertical: 5,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
    },
    selectedButton: {
        backgroundColor: '#1E3A8A',
    },
    selectedButtonText: {
        color: '#f2f2f2',
    },
    button: {
        backgroundColor: '#F2F2F2',
        paddingVertical: '10',
        paddingHorizontal: '30',
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
        height: 45,
        marginHorizontal: 10,
        marginVertical: 15,
        minWidth: '40%',
        borderWidth: 0.25,
        borderColor: 'black',
    },
    buttonNav: {
        backgroundColor: '#F2F2F2',
        paddingVertical: '5',
        paddingHorizontal: '15',
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
        height: 35,
        marginVertical: 15,
        marginStart: 25,
        minWidth: '20%',
        alignSelf: 'flex-start',
    },
    buttonText: {
        color: 'black',
        fontSize: 16,
    },
    buttonNext: {
        backgroundColor: '#FF6F00',
        paddingVertical: '10',
        paddingHorizontal: '30',
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
        height: 50,
        margin: 15,
        minWidth: '40%',
        alignSelf: 'flex-end',
        marginEnd: 30,
    },
    buttonNextText: {
        color: '#F2F2F2',
        fontSize: 16,
        fontWeight: 'bold'
    },
    progressBar: {
        alignSelf: 'flex-start',
        marginStart: 28,
        marginTop: 10,
    },
    hiddenButton: {
       opacity: 0, 
    }
})

export default QuizStyles;