import { StyleSheet, TouchableOpacity, View } from 'react-native'
import React from 'react'
import Txt from '../../../ui/Text'
import Icons from '../../../ui/Icons'
import Row from '../../../components/Row'
import { useNavigation } from '@react-navigation/native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const Header = () => {
    const navigation = useNavigation()
    const insets = useSafeAreaInsets()

    return (
        <View style={[styles.Header, { marginTop: Math.max(insets.top, 8) }]}>
            <Row>
                <Txt size={32} weight='Jingleberry'>КОРЗИНА</Txt>
                <TouchableOpacity activeOpacity={0.5} onPress={() => navigation.goBack()}>
                    <Icons.Close width={30} height={30} />
                </TouchableOpacity>
            </Row>
        </View>
    )
}

export default Header

const styles = StyleSheet.create({
    Header: {
        paddingHorizontal: 16,
    }
})
