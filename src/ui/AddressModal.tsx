import React, { FC, useEffect, useRef, useState } from 'react'
import {
    Modal,
    View,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    Dimensions,
    StatusBar,
    SafeAreaView,
    InteractionManager,
} from 'react-native'
import Txt from './Text'
import Input from './Input'
import Button from './Button'
import Icons from './Icons'
import useDeliveryStore from '../store/delivery'
import { SuggestionType } from '../types'
import { getZoneForLocation } from '../functions'
import useNotificationStore from '../store/notification'
import useGlobalStore from '../store'

interface Props {
    visible: boolean
    onClose: () => void
}

const AddressModal: FC<Props> = ({ visible, onClose }) => {
    const { addresses, changeAddressList, getSugesstions, suggestionList } = useDeliveryStore()
    const { setMessage } = useNotificationStore()
    const { setHideNavigation } = useGlobalStore()
    const [address, setAddress] = useState("")
    const [showSuggest, setShowSuggest] = useState(false)
    const [selectedAddress, setSelectedAddress] = useState<SuggestionType | null>(null)
    const inputRef = useRef<any>(null)

    useEffect(() => {
        if (visible) {
            InteractionManager.runAfterInteractions(() => {
                setTimeout(() => {
                    if (inputRef.current) {
                        inputRef.current.focus()
                        if (Platform.OS === 'android') {
                            setTimeout(() => {
                                inputRef.current?.focus()
                            }, 100)
                        }
                    }
                }, 50)
            })
        } else {
            setAddress("")
            setShowSuggest(false)
            setSelectedAddress(null)
            Keyboard.dismiss()
        }
    }, [visible])

    const handleModalShow = () => {
        InteractionManager.runAfterInteractions(() => {
            requestAnimationFrame(() => {
                if (inputRef.current) {
                    inputRef.current.focus()
                    setTimeout(() => {
                        inputRef.current?.focus()
                    }, 150)
                    setTimeout(() => {
                        inputRef.current?.focus()
                    }, 300)
                }
            })
        })
    }

    useEffect(() => {
        const handler = setTimeout(() => {
            if (address.length >= 3) {
                getSugesstions(address)
                setShowSuggest(true)
            } else {
                setShowSuggest(false)
            }
        }, 300)
        return () => clearTimeout(handler)
    }, [address, getSugesstions])

    function selectAddress(item: SuggestionType) {
        setAddress(item.value)
        const zone = getZoneForLocation(Number(item.data.geo_lat), Number(item.data.geo_lon))
        if (zone !== null) {
            setSelectedAddress(item)
            setShowSuggest(false)
        } else {
            setMessage("К сожалению мы не доставляем в этот регион", "error")
        }
    }

    const handleSave = () => {
        if (!selectedAddress) return
        
        changeAddressList({
            value: selectedAddress.value,
            lat: Number(selectedAddress.data.geo_lat),
            lng: Number(selectedAddress.data.geo_lon)
        }, addresses.length)
        
        setHideNavigation(false)
        onClose()
    }

    const handleClose = () => {
        setHideNavigation(false)
        onClose()
    }

    if (!visible) return null

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={false}
            onRequestClose={handleClose}
            onShow={handleModalShow}
            statusBarTranslucent={false}
            presentationStyle="fullScreen"
        >
            <SafeAreaView style={styles.SafeArea}>
                <KeyboardAvoidingView
                    style={styles.Container}
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    keyboardVerticalOffset={0}
                >
                    <View style={styles.Header}>
                    <Txt size={20} weight="Bold">Новый адрес доставки</Txt>
                    <TouchableOpacity onPress={handleClose} activeOpacity={0.7}>
                        <Icons.Close width={28} height={28} />
                    </TouchableOpacity>
                </View>

                <View style={styles.Content}>
                    <Input
                        ref={inputRef}
                        placeholder="Введите адрес доставки"
                        value={address}
                        onChange={setAddress}
                        autoFocus={true}
                    />

                    {showSuggest && address.length !== 0 && (
                        <ScrollView 
                            style={styles.SuggestPanel}
                            keyboardShouldPersistTaps="always"
                            nestedScrollEnabled={true}
                            showsVerticalScrollIndicator={true}
                        >
                            {suggestionList.map((item, idx) => (
                                <TouchableOpacity 
                                    key={`${item.value}-${idx}`}
                                    activeOpacity={0.7} 
                                    onPress={() => {
                                        Keyboard.dismiss()
                                        selectAddress(item)
                                    }}
                                    style={styles.SuggestionItem}
                                >
                                    <Txt weight="Bold" size={16} lines={3} lineHeight={22}>
                                        {item.value}
                                    </Txt>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    )}
                </View>

                <View style={styles.ButtonContainer}>
                    <Button 
                        height={56} 
                        onClick={handleSave}
                        disabled={!selectedAddress}
                        background={selectedAddress ? '#4FBD01' : '#CCCCCC'}
                    >
                        <Txt size={18} weight='Bold' color='#fff'>
                            Сохранить адрес
                        </Txt>
                    </Button>
                </View>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </Modal>
    )
}

export default AddressModal

const { height } = Dimensions.get('window')

const styles = StyleSheet.create({
    SafeArea: {
        flex: 1,
        backgroundColor: '#fff',
    },
    Container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    Header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    Content: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 20,
    },
    SuggestPanel: {
        marginTop: 16,
        backgroundColor: '#fff',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#4FBD01',
        padding: 12,
        maxHeight: height * 0.5,
    },
    SuggestionItem: {
        paddingVertical: 16,
        paddingHorizontal: 12,
        borderRadius: 8,
        backgroundColor: '#F5F5F5',
        marginBottom: 12,
        minHeight: 60,
        justifyContent: 'center',
    },
    ButtonContainer: {
        paddingHorizontal: 16,
        paddingVertical: 20,
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
    },
})

