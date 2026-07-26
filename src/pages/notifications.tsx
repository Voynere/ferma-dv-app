import { ScrollView, StatusBar, StyleSheet, TouchableOpacity, View } from 'react-native'
import React, { useEffect } from 'react'
import Sections from '../components/Sections'
import useFavoriteStore from '../store/favorite'
import Txt from '../ui/Text'
import Icons from '../ui/Icons'
import Row from '../components/Row'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import {RootStackParamList} from "../RootLayout";


const Notifications = () => {
    const { getFavoriteList } = useFavoriteStore()
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()

    useEffect(() => {
        getFavoriteList()
    }, [getFavoriteList])

    return (
        <View style={styles.Container}>
            <ScrollView>
                <View>
                    <View style={styles.Header}>
                        <Row>
                            <Txt size={32} weight="Jingleberry">
                                УВЕДОМЛЕНИЯ
                            </Txt>
                            <TouchableOpacity
                                activeOpacity={0.5}
                                onPress={() => navigation.goBack()}
                            >
                                <Icons.Close width={30} height={30} />
                            </TouchableOpacity>
                        </Row>
                    </View>

                    <View style={styles.List}>
                        <Txt>Нет уведомлений</Txt>
                    </View>
                </View>
            </ScrollView>
        </View>
    )
}

export default Notifications

const styles = StyleSheet.create({
    Container: {
        paddingTop: 8,
        flex: 1,
        backgroundColor: '#fff',
        paddingBottom: 70
    },
    Header: {
        paddingHorizontal: 16,
        marginTop: 8,
    },
    List: {
        gap: 24,
        paddingHorizontal: 16,
        marginTop: 24,
    },
})
