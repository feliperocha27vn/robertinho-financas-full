import { useEffect, useRef } from 'react'
import { Animated, type ViewProps } from 'react-native'

// minimal local `cn` fallback so this component works even if a global cn util
// is not available. It simply joins truthy class segments.
const cn = (...parts: Array<string | false | null | undefined>) =>
    parts.filter(Boolean).join(' ')

type SkeletonProps = ViewProps & {
    className?: string
}

/**
 * Skeleton component for React Native (NativeWind compatible)
 * - uses `className` so NativeWind can style it via Tailwind classes
 * - animates opacity with an infinite pulse using Animated API
 */
export default function Skeleton({ className, style, ...props }: SkeletonProps) {
    const opacity = useRef(new Animated.Value(1)).current

    useEffect(() => {
        const pulse = Animated.loop(
            Animated.sequence([
                Animated.timing(opacity, {
                    toValue: 0.4,
                    duration: 600,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 600,
                    useNativeDriver: true,
                }),
            ])
        )
        pulse.start()
        return () => pulse.stop()
    }, [opacity])

    return (
        <Animated.View
            // NativeWind supports `className` on RN elements when configured
            // default to a visible neutral background if `bg-accent` is not defined
            className={cn('bg-gray-200 rounded-md', className)}
            style={[{ opacity }, style]}
            {...props}
        />
    )
}

export { Skeleton }

