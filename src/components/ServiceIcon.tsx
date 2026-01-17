import React from 'react';
import { View, StyleSheet } from 'react-native';
import { FontAwesome, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { ServiceIcon as ServiceIconType } from '../types';
import { serviceConfigs } from '../constants';

interface ServiceIconProps {
  service: ServiceIconType;
  size?: number;
  showBackground?: boolean;
}

export function ServiceIcon({ service, size = 24, showBackground = true }: ServiceIconProps) {
  const config = serviceConfigs[service];
  const iconSize = size * 0.6;

  const renderIcon = () => {
    const iconProps = {
      name: config.icon as any,
      size: iconSize,
      color: config.color,
    };

    switch (config.iconFamily) {
      case 'FontAwesome':
        return <FontAwesome {...iconProps} />;
      case 'MaterialCommunityIcons':
        return <MaterialCommunityIcons {...iconProps} />;
      case 'Ionicons':
        return <Ionicons {...iconProps} />;
      default:
        return <FontAwesome name="star" size={iconSize} color={config.color} />;
    }
  };

  if (!showBackground) {
    return renderIcon();
  }

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size * 0.25,
          backgroundColor: config.backgroundColor,
        },
      ]}
    >
      {renderIcon()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
