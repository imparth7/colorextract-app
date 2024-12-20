import React, { useState, useEffect, useRef } from 'react';
import { Animated, Easing, View, ViewStyle, StyleProp } from 'react-native';

interface IndicatorProps {
  animationEasing?: Easing;
  animationDuration?: number;
  hideAnimationDuration?: number;
  animating?: boolean;
  interaction?: boolean;
  hidesWhenStopped?: boolean;
  renderComponent?: (props: { index: number; count: number; progress: Animated.Value }) => JSX.Element | null;
  count?: number;
  style?: StyleProp<ViewStyle>;  // Updated to use StyleProp
}

const Indicator: React.FC<IndicatorProps> = ({
  animationEasing = Easing.linear,
  animationDuration = 1200,
  hideAnimationDuration = 200,
  animating = true,
  interaction = true,
  hidesWhenStopped = true,
  renderComponent,
  count = 1,
  style,
}) => {
  const [progress] = useState(new Animated.Value(0));
  const [hideAnimation] = useState(new Animated.Value(animating ? 1 : 0));

  const animationState = useRef(0);
  const savedValue = useRef(0);

  useEffect(() => {
    if (animating) {
      startAnimation();
    }
  }, [animating]);

  const startAnimation = () => {
    if (animationState.current !== 0) return;

    const animation = Animated.timing(progress, {
      duration: animationDuration,
      easing: Easing.linear,
      useNativeDriver: true,
      isInteraction: interaction,
      toValue: 1,
    });

    Animated.loop(animation).start();
    animationState.current = 1;
  };

  const stopAnimation = () => {
    if (animationState.current !== 1) return;

    const listener = progress.addListener(({ value }) => {
      progress.removeListener(listener);
      progress.stopAnimation(() => saveAnimation(value));
    });

    animationState.current = -1;
  };

  const saveAnimation = (value: number) => {
    savedValue.current = value;
    animationState.current = 0;

    if (animating) {
      resumeAnimation();
    }
  };

  const resumeAnimation = () => {
    if (animationState.current !== 0) return;

    Animated.timing(progress, {
      useNativeDriver: true,
      isInteraction: interaction,
      duration: (1 - savedValue.current) * animationDuration, // Ensure proper type here (number)
      toValue: 1,
    }).start(({ finished }) => {
      if (finished) {
        progress.setValue(0);
        animationState.current = 0;
        startAnimation();
      }
    });

    savedValue.current = 0;
    animationState.current = 1;
  };

  const renderComponentFn = (item: any, index: number) => {
    if (typeof renderComponent === 'function') {
      return renderComponent({ index, count, progress });
    }

    return null;
  };

  useEffect(() => {
    const targetValue = animating ? 1 : 0;
    Animated.timing(hideAnimation, {
      toValue: targetValue,
      duration: hideAnimationDuration,
      useNativeDriver: true,
    }).start();
  }, [animating, hideAnimation]);

  const containerStyle = hidesWhenStopped
    ? { opacity: hideAnimation }
    : {};

  return (
    <Animated.View style={[style, containerStyle]}>
      {Array.from(new Array(count), renderComponentFn)}
    </Animated.View>
  );
};

export default Indicator;
