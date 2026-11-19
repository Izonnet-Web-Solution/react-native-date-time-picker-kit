import React, { useCallback, useEffect, useRef } from 'react';
import {
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from '../theme';
import type { ThemeConfig, ThemeMode } from '../theme/types';

export interface WheelPickerItem<T = any> {
  label: string;
  value: T;
}

export interface WheelPickerProps<T = any> {
  items: WheelPickerItem<T>[];
  selectedValue?: T;
  onChange?: (value: T, index: number) => void;
  itemHeight?: number;
  visibleItems?: number; // e.g. 5
  theme?: ThemeMode | ThemeConfig;
  testID?: string;
}

export function WheelPicker<T = any>({
  items,
  selectedValue,
  onChange,
  itemHeight = 44,
  visibleItems = 5,
  theme: propTheme,
  testID,
}: WheelPickerProps<T>): React.ReactElement {
  const theme = useTheme(propTheme);
  const scrollRef = useRef<any>(null);
  const isScrollingRef = useRef(false);

  const halfVisible = Math.floor(visibleItems / 2);
  const totalHeight = itemHeight * visibleItems;

  const selectedIndex = items.findIndex((it) => it.value === selectedValue);
  const activeIndex = selectedIndex >= 0 ? selectedIndex : 0;

  // Scroll to position when selectedValue changes externally
  useEffect(() => {
    if (!isScrollingRef.current && scrollRef.current && activeIndex >= 0) {
      scrollRef.current.scrollTo({
        y: activeIndex * itemHeight,
        animated: false,
      });
    }
  }, [activeIndex, itemHeight]);

  const handleMomentumScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      isScrollingRef.current = false;
      const offsetY = e.nativeEvent.contentOffset.y;
      const index = Math.round(offsetY / itemHeight);
      const clampedIndex = Math.max(0, Math.min(items.length - 1, index));
      const item = items[clampedIndex];
      if (item && onChange) {
        onChange(item.value, clampedIndex);
      }
    },
    [itemHeight, items, onChange]
  );

  const handleScrollBeginDrag = useCallback(() => {
    isScrollingRef.current = true;
  }, []);

  const handleItemPress = useCallback(
    (index: number) => {
      scrollRef.current?.scrollTo({
        y: index * itemHeight,
        animated: true,
      });
      const item = items[index];
      if (item && onChange) {
        onChange(item.value, index);
      }
    },
    [itemHeight, items, onChange]
  );

  return (
    <View
      testID={testID}
      style={[
        styles.container,
        {
          height: totalHeight,
          backgroundColor: theme.colors.background,
        },
      ]}
    >
      {/* Center Highlight Indicator */}
      <View
        pointerEvents="none"
        style={[
          styles.selectionIndicator,
          {
            top: halfVisible * itemHeight,
            height: itemHeight,
            borderColor: theme.colors.border,
            backgroundColor: theme.colors.card,
          },
        ]}
      />

      {/* Wheel ScrollView */}
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={itemHeight}
        snapToAlignment="center"
        decelerationRate="fast"
        onScrollBeginDrag={handleScrollBeginDrag}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        contentContainerStyle={{
          paddingTop: halfVisible * itemHeight,
          paddingBottom: halfVisible * itemHeight,
        }}
      >
        {items.map((item, index) => {
          const isSelected = index === activeIndex;
          return (
            <TouchableOpacity
              key={`wheel-${index}-${String(item.value)}`}
              accessibilityRole="button"
              accessibilityLabel={item.label}
              accessibilityState={{ selected: isSelected }}
              activeOpacity={0.8}
              onPress={() => handleItemPress(index)}
              style={[
                styles.itemRow,
                {
                  height: itemHeight,
                },
              ]}
            >
              <Text
                numberOfLines={1}
                style={[
                  styles.itemText,
                  {
                    color: isSelected
                      ? theme.colors.text
                      : theme.colors.textMuted,
                    fontSize: isSelected
                      ? theme.typography.fontSizeLarge
                      : theme.typography.fontSizeMedium,
                    fontWeight: isSelected
                      ? theme.typography.fontWeightBold
                      : theme.typography.fontWeightRegular,
                    transform: isSelected
                      ? [{ scale: 1.05 }]
                      : [{ scale: 0.95 }],
                  },
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
    width: '100%',
  },
  selectionIndicator: {
    position: 'absolute',
    left: 8,
    right: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderRadius: 8,
    zIndex: 0,
  },
  itemRow: {
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  itemText: {
    textAlign: 'center',
  },
});
