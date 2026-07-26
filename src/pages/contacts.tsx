import { ScrollView, StatusBar, StyleSheet, View } from 'react-native'
import React from 'react'
import Header from '../components/Header'
import Sections from '../components/Sections'

const contacts = () => {
    return (
        <View style={styles.Container}>
            <ScrollView>
                <View>
                    <Header isHideSearch />
                    <Sections.Contacts />
                </View>
            </ScrollView>
        </View>
    )
}

export default contacts

const styles = StyleSheet.create({
    Container: {
        paddingTop: 8,
        flex: 1,
        backgroundColor: "#fff"
    }
})