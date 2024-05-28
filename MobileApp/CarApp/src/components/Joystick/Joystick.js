import React, { useState, useRef } from 'react';
import { View, StyleSheet, PanResponder, Animated } from 'react-native';

const Joystick = ({ size, onMove, onStop }) => {
  const [position] = useState(new Animated.ValueXY({ x: 0, y: 0 }));
  const maxDistance = size / 2;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        position.setOffset({
          x: position.x._value,
          y: position.y._value,
        });
        position.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: Animated.event(
        [null, { dx: position.x, dy: position.y }],
        { useNativeDriver: false, listener: (event, gestureState) => handleMove(gestureState) }
      ),
      onPanResponderRelease: () => {
        position.flattenOffset();
        Animated.spring(position, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: false,
        }).start(() => onStop());
      },
    })
  ).current;

  const handleMove = (gestureState) => {
    const distance = Math.sqrt(gestureState.dx ** 2 + gestureState.dy ** 2);
    if (distance > maxDistance) {
      const ratio = maxDistance / distance;
      position.setValue({
        x: gestureState.dx * ratio,
        y: gestureState.dy * ratio,
      });
    }

    const x = position.x._value / maxDistance;
    const y = -position.y._value / maxDistance;
    onMove({ x, y });
  };

  return (
    <View style={[styles.joystickBase, { width: size, height: size }]}>
      <Animated.View
        style={[
          styles.joystick,
          { transform: [{ translateX: position.x }, { translateY: position.y }] },
        ]}
        {...panResponder.panHandlers}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  joystickBase: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  joystick: {
    width: 60,
    height: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 30,
  },
});

export default Joystick;
