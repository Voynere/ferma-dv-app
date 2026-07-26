import { StyleSheet, Text, View } from 'react-native'
import React, { FC } from 'react'
import Txt from './Text'
import Icons from './Icons'

interface Props {
    rating: number
}

const Rating: FC<Props> = ({ rating }) => {
    return (
        <View style={styles.Rating}>
            <Txt>{rating.toFixed(1)}</Txt>

            <View style={styles.Row}>
                {Array.from({ length: rating }).map((_, index) => (
                    <Icons.Star color="#FF7A00" key={index} />
                ))}
            </View>
        </View>
    )
}

export default Rating

const styles = StyleSheet.create({
    Rating: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8
    },
    Row: {
        flexDirection: 'row',
        alignItems: 'center',
    }
})