import { StyleSheet, TouchableOpacity, View } from 'react-native'
import React, { FC, useState } from 'react'
import Txt from '../ui/Text'
import Row from './Row'

interface Props {
    labels: string[]
    tabs: any[]
    activeTab?: number
}

const Tabs: FC<Props> = ({ labels, tabs, activeTab }) => {
    const [active, setActive] = useState(activeTab || 0)

    return (
        <View style={styles.Tabs}>
            <Row gap={8}>
                {labels.map((item, index) => (
                    <TouchableOpacity
                        style={[styles.TabItem, active === index && styles.Active]}
                        key={index}
                        onPress={() => setActive(index)}
                    ><Txt
                        color={active === index ? "#fff" : "#4D4D4D"}
                        weight='Bold'
                    >{item}</Txt>
                    </TouchableOpacity>
                ))}
            </Row>

            <View>
                {tabs[active]}
            </View>
        </View>
    )
}

export default Tabs

const styles = StyleSheet.create({
    Tabs: {
        gap: 24,
        paddingHorizontal: 16
    },
    TabItem: {
        height: 48,
        width: "100%",
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 8,
        backgroundColor: "#EEEEEE"
    },
    Active: {
        backgroundColor: "#4FBD01"
    }
})