import React from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import Indicator from './Indicator';

interface BarIndicatorProps {
  count?: number;
  color?: string;
  size?: number;
  animationDuration?: number;
  style?: object;
}

const BarIndicator: React.FC<BarIndicatorProps> = ({
  count = 3,
  color = 'rgb(0, 0, 0)',
  size = 40,
  animationDuration = 1000,
  style = {},
}) => {

  // Function to generate the output range for animation
  const outputRange = (base: number, index: number, count: number, samples: number) => {
    let range = Array.from(new Array(samples), (_, index) => (
      base * Math.abs(Math.cos(Math.PI * index / (samples - 1)))
    ));

    for (let j = 0; j < index * (samples / count); j++) {
      range.unshift(range.pop()!);
    }

    range.unshift(...range.slice(-1));

    return range;
  };

  // Function to render the animated components
  const renderComponent = ({ index, count, progress }: any) => {
    let frames = 60 * animationDuration / 1000;
    let samples = 0;

    while (samples < frames) samples += count;

    let inputRange = Array.from(new Array(samples + 1), (_, index) => index / samples);

    let width = Math.floor(size / 5);
    let height = Math.floor(size / 2);
    let radius = Math.ceil(width / 2);

    let containerStyle = {
      height: size,
      width: width,
      marginHorizontal: radius,
    };

    let topStyle = {
      width,
      height,
      backgroundColor: color,
      borderTopLeftRadius: radius,
      borderTopRightRadius: radius,
      transform: [{
        translateY: progress.interpolate({
          inputRange,
          outputRange: outputRange(+(height - radius) / 2, index, count, samples),
        }),
      }],
    };

    let bottomStyle = {
      width,
      height,
      backgroundColor: color,
      borderBottomLeftRadius: radius,
      borderBottomRightRadius: radius,
      transform: [{
        translateY: progress.interpolate({
          inputRange,
          outputRange: outputRange(-(height - radius) / 2, index, count, samples),
        }),
      }],
    };

    return (
      <View style={containerStyle} key={index}>
        <Animated.View style={topStyle} />
        <Animated.View style={bottomStyle} />
      </View>
    );
  };

  return (
    <Indicator
      style={[styles.container, style]}
      renderComponent={renderComponent}
      count={count}
      // color={color}
      // size={size}
      animationDuration={animationDuration}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
});

export default BarIndicator;
