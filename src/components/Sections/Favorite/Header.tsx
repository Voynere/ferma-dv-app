import { StyleSheet, TouchableOpacity, View } from 'react-native'
import React from 'react'
import Txt from '../../../ui/Text'
import Icons from '../../../ui/Icons'
import { useNavigation } from '@react-navigation/native'
import Row from '../../../components/Row'

const Header = () => {
    const navigation = useNavigation()

    return (
        <View style={styles.Header}>
            <Row>
                <Txt size={32} weight='Jingleberry'>ИЗБРАННОЕ</Txt>
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
        marginTop: 8
    }
})
