import { ScrollView, StatusBar, StyleSheet, View } from 'react-native'
import React from 'react'
import Header from '../components/Header'
import Txt from '../ui/Text'

const search = () => {
    return (
        <View style={styles.Container}>
            <ScrollView>
                <View>
                    <Header />
                    <Txt>Поиск</Txt>
                </View>
            </ScrollView>
        </View>
    )
}

export default search

const styles = StyleSheet.create({
    Container: {
        paddingTop: 8,
        flex: 1,
        backgroundColor: "#fff"
    }
})