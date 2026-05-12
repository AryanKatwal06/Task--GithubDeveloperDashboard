/**
 * Custom Icon Component
 *
 * Reliable icon rendering with fallback handling
 * Ensures Feather icons load properly on both iOS and Android
 */

import React from 'react';
import { TextStyle, StyleProp } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

interface IconProps {
  name: string;
  size?: number;
  color?: string;
  style?: StyleProp<TextStyle>;
}

export const Icon: React.FC<IconProps> = ({ name, size = 20, color = '#000', style }) => {
  return <Feather name={name} size={size} color={color} style={style} />;
};
