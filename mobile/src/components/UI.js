import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, shadows, statusColor, priorityColor, typography } from '../theme';

export function Button({
  title,
  onPress,
  icon,
  secondary = false,
  danger = false,
  ghost = false,
  loading = false,
  disabled = false,
  style,
  textStyle,
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        secondary && styles.secondaryButton,
        danger && styles.dangerButton,
        ghost && styles.ghostButton,
        !secondary && !ghost && !danger && styles.primaryShadow,
        (disabled || loading) && styles.disabledButton,
        pressed && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={secondary || ghost ? colors.primary : '#FFFFFF'} size="small" />
      ) : (
        <View style={styles.buttonContent}>
          {icon ? <Text style={[styles.buttonIcon, secondary && styles.secondaryIcon]}>{icon}</Text> : null}
          <Text
            style={[
              styles.buttonText,
              secondary && styles.secondaryButtonText,
              danger && styles.dangerButtonText,
              ghost && styles.ghostButtonText,
              textStyle,
            ]}
          >
            {title}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

export function Field({
  label,
  icon,
  rightAccessory,
  required = false,
  containerStyle,
  ...inputProps
}) {
  const [focused, setFocused] = React.useState(false);

  return (
    <View style={[styles.field, containerStyle]}>
      {label ? (
        <View style={styles.labelRow}>
          <Text style={styles.label}>{label}</Text>
          {required ? <Text style={styles.requiredMark}>*</Text> : null}
        </View>
      ) : null}
      <View style={[styles.inputContainer, focused && styles.inputFocused]}>
        {icon ? <Text style={styles.fieldIcon}>{icon}</Text> : null}
        <TextInput
          placeholderTextColor="#94A3B8"
          style={styles.input}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...inputProps}
        />
        {rightAccessory ? <View style={styles.rightAccessory}>{rightAccessory}</View> : null}
      </View>
    </View>
  );
}

export function SectionTitle({ title, badge, action, onAction }) {
  return (
    <View style={styles.sectionTitle}>
      <View style={styles.titleLeft}>
        <Text style={styles.sectionHeading}>{title}</Text>
        {badge ? (
          <View style={styles.badgePill}>
            <Text style={styles.badgePillText}>{badge}</Text>
          </View>
        ) : null}
      </View>
      {action ? (
        <Pressable onPress={onAction} style={styles.actionPressable} hitSlop={8}>
          <Text style={styles.action}>{action}</Text>
          <Text style={styles.actionArrow}>→</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function StatusPill({ status }) {
  const { tone, bg, label } = statusColor(status);
  return (
    <View style={[styles.pill, { backgroundColor: bg, borderColor: `${tone}30` }]}>
      <View style={[styles.pillDot, { backgroundColor: tone }]} />
      <Text style={[styles.pillText, { color: tone }]}>{label}</Text>
    </View>
  );
}

export function PriorityBadge({ priority = 'Medium' }) {
  const { tone, bg } = priorityColor(priority);
  return (
    <View style={[styles.priorityBadge, { backgroundColor: bg, borderColor: `${tone}40` }]}>
      <Text style={[styles.priorityText, { color: tone }]}>{priority}</Text>
    </View>
  );
}

export function ErrorBanner({ message, onDismiss }) {
  if (!message) return null;
  return (
    <View style={styles.errorContainer}>
      <Text style={styles.errorIcon}>⚠️</Text>
      <Text accessibilityRole="alert" style={styles.errorText}>
        {message}
      </Text>
      {onDismiss ? (
        <Pressable onPress={onDismiss} hitSlop={10}>
          <Text style={styles.errorDismiss}>✕</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function Card({ children, style, elevated = true }) {
  return (
    <View style={[styles.card, elevated && shadows.sm, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    minHeight: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    flexDirection: 'row',
  },
  primaryShadow: {
    ...shadows.primaryGlow,
  },
  secondaryButton: {
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.primaryMuted,
  },
  dangerButton: {
    backgroundColor: colors.dangerLight,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  ghostButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.line,
  },
  disabledButton: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.985 }],
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonIcon: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  secondaryIcon: {
    color: colors.primary,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
    ...typography,
  },
  secondaryButtonText: {
    color: colors.primary,
  },
  dangerButtonText: {
    color: colors.danger,
  },
  ghostButtonText: {
    color: colors.inkSecondary,
  },
  field: {
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 7,
    gap: 4,
  },
  label: {
    color: colors.inkSecondary,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.1,
    ...typography,
  },
  requiredMark: {
    color: colors.danger,
    fontSize: 13,
    fontWeight: '700',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 52,
    borderWidth: 1.5,
    borderColor: colors.line,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
  },
  inputFocused: {
    borderColor: colors.primary,
    backgroundColor: '#FFFFFF',
    ...shadows.sm,
  },
  fieldIcon: {
    fontSize: 16,
    marginRight: 10,
    color: colors.muted,
  },
  input: {
    flex: 1,
    color: colors.ink,
    fontSize: 15,
    paddingVertical: 12,
    ...typography,
  },
  rightAccessory: {
    marginLeft: 8,
  },
  sectionTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    marginTop: 6,
  },
  titleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionHeading: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
    ...typography,
  },
  badgePill: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  badgePillText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '700',
  },
  actionPressable: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  action: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  actionArrow: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
    alignSelf: 'flex-start',
  },
  pillDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  pillText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.2,
    ...typography,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.dangerLight,
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 14,
    padding: 13,
    marginBottom: 16,
    gap: 10,
  },
  errorIcon: {
    fontSize: 16,
  },
  errorText: {
    flex: 1,
    color: '#991B1B',
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  errorDismiss: {
    color: '#991B1B',
    fontSize: 14,
    fontWeight: '700',
    padding: 2,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 16,
  },
});
