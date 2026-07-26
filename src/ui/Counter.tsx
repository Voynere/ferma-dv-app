import { StyleSheet, TouchableOpacity, View } from 'react-native'
import React, { FC, useCallback, useMemo, memo } from 'react'
import Icons from './Icons'
import Txt from './Text'
import useNotificationStore from '../store/notification'
import { roundAmount } from '../utils/roundAmount'

interface Props {
    amount: number
    onChange: (value: number) => void
    step?: number   // шаг (по умолчанию 1)
    isLarger?: boolean
    isNotFull?: boolean
    min?: number    // минимальное значение (по умолчанию 1)
    isSmall?: boolean
    sign?: string
    max?: number    // максимальное значение (лимит остатка)
    disabled?: boolean  // полное отключение счетчика
}

const Counter: FC<Props> = ({
                                amount,
                                onChange,
                                step = 1,      // шаг прибавления/убавления
                                min = 1,       // минимальное значение
                                isLarger,
                                isNotFull,
                                isSmall,
                                sign,
                                max,
                                disabled = false
                            }) => {
    const setMessage = useNotificationStore(state => state.setMessage)
    
    const isWeighted = useMemo(() => step < 1, [step])
    
    const isMinusDisabled = useMemo(() => disabled || amount <= min, [disabled, amount, min])
    const isPlusDisabled = useMemo(() => 
        disabled || (typeof max === 'number' ? amount >= max : false), 
        [disabled, amount, max]
    )

    const handleDecrease = useCallback(() => {
        const newValue = roundAmount(amount - step, isWeighted)
        if (newValue >= min) {
            onChange(newValue)
        }
    }, [amount, step, min, onChange, isWeighted])

    const handleIncrease = useCallback(() => {
        if (typeof max === 'number' && amount >= max) {
            const maxDisplay = isWeighted ? `${max.toFixed(1)} кг` : `${max} шт`
            setMessage(`На складе только ${maxDisplay} в наличии`, 'error')
            return
        }
        const newValue = roundAmount(amount + step, isWeighted)
        if (typeof max === 'number' && newValue > max) {
            const maxDisplay = isWeighted ? `${max.toFixed(1)} кг` : `${max} шт`
            setMessage(`На складе только ${maxDisplay} в наличии`, 'error')
            onChange(roundAmount(max, isWeighted))
            return
        }
        onChange(newValue)
    }, [amount, step, max, onChange, setMessage, isWeighted])

    const valueFontSize = useMemo(() => 
        isLarger ? 24 : isSmall ? 16 : (step < 1 ? 18 : 20),
        [isLarger, isSmall, step]
    )
    
    const displayValue = useMemo(() => 
        `${step < 1 ? amount.toFixed(1) : amount} ${sign || ''}`.trim(),
        [amount, step, sign]
    )
    
    const iconSize = useMemo(() => isLarger ? 16 : 10, [isLarger])

    return (
        <View style={[styles.Counter, isNotFull && styles.IsNotFull, isSmall && styles.SmallCounter]}>
            <TouchableOpacity
                style={[
                    styles.Button,
                    isMinusDisabled && styles.Disabled,
                    isLarger && styles.Large,
                    isSmall && styles.Small
                ]}
                activeOpacity={0.5}
                onPress={handleDecrease}
                disabled={isMinusDisabled}
            >
                <Icons.Minus
                    width={iconSize}
                    height={iconSize}
                    color={isMinusDisabled ? "#4D4D4D" : "#fff"}
                />
            </TouchableOpacity>

            <Txt size={valueFontSize} weight={isSmall ? "RobotoCondensed-Regular" : 'RobotoCondensed-Bold'}>
                {displayValue}
            </Txt>

            <TouchableOpacity
                style={[styles.Button, isLarger && styles.Large, isSmall && styles.Small, isPlusDisabled && styles.Disabled]}
                activeOpacity={0.5}
                onPress={handleIncrease}
            >
                <Icons.Plus
                    width={iconSize}
                    height={iconSize}
                    color={isPlusDisabled ? "#4D4D4D" : "#fff"}
                />
            </TouchableOpacity>
        </View>
    )
}

Counter.displayName = 'Counter'

// Мемоизируем для предотвращения лишних ре-рендеров
export default memo(Counter, (prevProps, nextProps) => {
    return (
        prevProps.amount === nextProps.amount &&
        prevProps.step === nextProps.step &&
        prevProps.max === nextProps.max &&
        prevProps.min === nextProps.min &&
        prevProps.isLarger === nextProps.isLarger &&
        prevProps.isSmall === nextProps.isSmall &&
        prevProps.sign === nextProps.sign
    )
})

const styles = StyleSheet.create({
    Counter: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
    },
    Button: {
        width: 30,
        height: 30,
        backgroundColor: "#4FBD01",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 6
    },
    Disabled: {
        backgroundColor: "#EEEEEE"
    },
    Large: {
        width: 56,
        height: 56,
        borderRadius: 8
    },
    IsNotFull: {
        justifyContent: "flex-start",
        gap: 16,
        flex: 0
    },
    Small: {
        width: 22,
        height: 22,
        borderRadius: 5
    },
    SmallCounter: {
        justifyContent: "flex-start",
        gap: 10,
        flex: 0
    }
})
