import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type { DatePreset } from '../../presets';
import type { ResolvedTheme } from '../../theme';

export interface PresetsBarProps {
  presets: DatePreset[];
  activePresetId?: string;
  onSelectPreset: (preset: DatePreset) => void;
  theme: ResolvedTheme;
  isRTL?: boolean;
}

export const PresetsBar: React.FC<PresetsBarProps> = React.memo(
  ({ presets, activePresetId, onSelectPreset, theme, isRTL = false }) => {
    if (!presets || presets.length === 0) {
      return null;
    }

    return (
      <View
        style={[
          styles.container,
          {
            borderBottomColor: theme.colors.border,
            backgroundColor: theme.colors.card,
          },
        ]}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            { flexDirection: isRTL ? 'row-reverse' : 'row' },
          ]}
        >
          {presets.map((preset) => {
            const isActive = preset.id === activePresetId;
            return (
              <TouchableOpacity
                key={preset.id}
                onPress={() => onSelectPreset(preset)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: isActive
                      ? theme.colors.primary
                      : theme.colors.background,
                    borderColor: isActive
                      ? theme.colors.primary
                      : theme.colors.border,
                    borderRadius: theme.borderRadius.full,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    {
                      color: isActive
                        ? theme.colors.primaryText
                        : theme.colors.textSecondary,
                      fontSize: theme.typography.fontSizeSmall,
                      fontWeight: isActive
                        ? theme.typography.fontWeightMedium
                        : theme.typography.fontWeightRegular,
                    },
                  ]}
                >
                  {preset.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  scrollContent: {
    paddingHorizontal: 12,
    alignItems: 'center',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1,
  },
  chipText: {},
});
