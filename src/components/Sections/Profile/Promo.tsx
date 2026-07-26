import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { promoData, promoList } from '../../../constants'
import Txt from '../../../ui/Text'
import Row from '../../../components/Row'

const Promo = () => {
    return (
        <View style={styles.Table}>
            <Row>
                {promoList.map((item, index) => <View style={[styles.Cell, index === 0 && styles.First, index === 1 && styles.Middle]} key={index}>
                    <Txt size={16} weight='Bold' key={index}>{item}</Txt>
                </View>)}
            </Row>

            <View style={styles.Data}>
                {promoData.map((item, index) => <Row key={index}>
                    <View style={[styles.Cell, styles.First]}>
                        <Txt size={16} key={index}>{item.id}</Txt>
                    </View>

                    <View style={[styles.Cell, styles.Middle]}>
                        <Txt size={16} key={index}>{`${item.discount}%`}</Txt>
                    </View>

                    <View style={styles.Cell}>
                        <Txt size={16} key={index}>{`до ${item.expireDate}`}</Txt>
                    </View>
                </Row>)}
            </View>
        </View>
    )
}

export default Promo

const styles = StyleSheet.create({
    Table: {
        gap: 24
    },
    Data: {
        gap: 16
    },
    Cell: {
        width: "100%",
        flex: 1,
        alignItems: "flex-end"
    },
    First: {
        alignItems: "flex-start"
    },
    Middle: {
        maxWidth: 50
    }
})