import { StyleSheet, View } from 'react-native'
import React from 'react'
import Txt from '../ui/Text'
import Cup from '../assets/svg/Cup'


const Banner = () => {
    return (
        <View style={styles.Banner}>
            <Cup width={26} height={26} />

            <View style={styles.FlexBox}>
                <Txt size={16} weight='Jingleberry' numberOfLines={2}>{"0₽ за доставку.\nС 18 до 22 при заказе от 1000₽."}</Txt>
            </View>
        </View>
    )
}

export default Banner

const styles = StyleSheet.create({
    Banner: {
        flex: 1,
        backgroundColor: "#FD8A0A",
        paddingVertical: 10,
        borderRadius: 12,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingHorizontal: 16,
    },
    FlexBox: {
        flex: 1,
        flexShrink: 1
    }
})