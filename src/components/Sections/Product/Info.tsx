import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import Txt from '../../../ui/Text'
import Row from '../../../components/Row'
import Icons from '../../../ui/Icons'
import useCatalogStore from '../../../store/catalog'

type AdditionalType = "country" | "place" | "energyValue" | "value" | "storageConditions" | "shelfLife" | "compound"

const Info = () => {
    const { activeProduct } = useCatalogStore()

    function fillAdditionalInfo(value: string, type: AdditionalType) {
        let title = ""

        switch (type) {
            case "country": title = "Страна происхождения:"; break;
            case "place": title = "Место происхождения:"; break;
            case "energyValue": title = "нергетическая ценность на 100 г.:"; break;
            case "value": title = "Объём:"; break;
            case "storageConditions": title = "Страна происхождения:"; break;
            case "shelfLife": title = "Страна происхождения:"; break;
            case "compound": title = "Состав:"; break;
        }

        return <Txt size={16}><Txt size={16} weight='Bold'>{title}</Txt> {value}</Txt>
    }

    return (
        <View style={styles.Info}>
            {/* <Row>
                <View style={styles.bju}>
                    {data.bju.map((item, index) => (
                        <View key={index} style={styles.Item}>
                            <Txt>{item.name}</Txt>
                            <Txt size={16} weight='Bold'>{item.amount.toFixed(1)}</Txt>
                        </View>
                    ))}
                </View>

                <View style={styles.Reviews}>
                    <Icons.Star color="#FF7A00" />
                    <Txt>{`${data.rating} (${data.reviewsCount})`}</Txt>
                </View>
            </Row> */}

            {/* <View style={styles.Group}>
                <Txt size={24} weight='Bold'>Состав:</Txt>
                <Txt size={16}>{data.compound}</Txt>
            </View> */}

            <View style={styles.Group}>
                <Txt size={24} weight='Bold'>О товаре:</Txt>
                {/*
                {fillAdditionalInfo(data.additionalInfo.country, "country")}
                {fillAdditionalInfo(data.additionalInfo.place, "place")}
                {fillAdditionalInfo(`${data.additionalInfo.energyValue} кКал`, "energyValue")}
                {fillAdditionalInfo(data.additionalInfo.value, "value")}
                {fillAdditionalInfo(data.compound, "compound")}
                {fillAdditionalInfo(data.additionalInfo.storageConditions, "storageConditions")}
                {fillAdditionalInfo(`${data.additionalInfo.shelfLife} дней`, "shelfLife")} */}

                <Txt size={16} lineHeight={26}>{activeProduct?.description || "Нет данных"}</Txt>
            </View>
        </View>
    )
}

export default Info

const styles = StyleSheet.create({
    Info: {
        gap: 24,
        marginTop: 16,
        paddingHorizontal: 16,
    },
    bju: {
        flexDirection: "row",
        gap: 16,
    },
    Item: {
        alignItems: "center",
        gap: 4
    },
    Reviews: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4
    },
    Group: {
        gap: 8
    }
})
