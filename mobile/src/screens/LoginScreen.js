import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, ErrorBanner, Field } from '../components/UI';
import { colors, shadows } from '../theme';

const DEMO_ACCOUNTS = [
  { role: 'SuperAdmin', email: 'admin@example.com', pass: 'Passw0rd!', icon: '👑', label: 'Admin' },
  { role: 'Staff', email: 'network@example.com', pass: 'Passw0rd!', icon: '🔧', label: 'Staff' },
  { role: 'User', email: 'user@example.com', pass: 'Passw0rd!', icon: '👤', label: 'Student' },
];

export default function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!email.trim() || !password) {
      setError('Please enter both your email address and password.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await onLogin(email.trim(), password);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const quickFill = (demo) => {
    setEmail(demo.email);
    setPassword(demo.pass);
    setError('');
  };

  return (
    <SafeAreaView style={styles.flex} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          {/* Header & Logo */}
          <View style={styles.header}>
            <View style={styles.logoBadgeContainer}>
              <View style={styles.logoBadge}>
                <Text style={styles.logoEmoji}>⚡</Text>
              </View>
              <View style={styles.onlineBadge}>
                <View style={styles.onlineDot} />
                <Text style={styles.onlineText}>TMS Cloud</Text>
              </View>
            </View>

            <Text style={styles.eyebrow}>CAMPUS FACILITY MANAGEMENT</Text>
            <Text style={styles.title}>Service Desk</Text>
            <Text style={styles.subtitle}>
              Raise tickets, track maintenance, and resolve campus issues seamlessly.
            </Text>
          </View>

          {/* Form Card */}
          <View style={styles.formCard}>
            <ErrorBanner message={error} onDismiss={() => setError('')} />

            <Field
              label="Email Address"
              icon="✉"
              value={email}
              onChangeText={(text) => { setEmail(text); setError(''); }}
              placeholder="admin@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              textContentType="emailAddress"
              required
            />

            <Field
              label="Password"
              icon="🔒"
              value={password}
              onChangeText={(text) => { setPassword(text); setError(''); }}
              placeholder="••••••••"
              secureTextEntry={!showPassword}
              autoComplete="password"
              textContentType="password"
              required
              rightAccessory={
                <Pressable onPress={() => setShowPassword(!showPassword)} hitSlop={10}>
                  <Text style={styles.eyeIcon}>{showPassword ? '👁' : '👁‍🗨'}</Text>
                </Pressable>
              }
            />

            <Button
              title="Sign In to Portal"
              icon="➔"
              onPress={submit}
              loading={loading}
              style={styles.submitButton}
            />

            {/* Quick-Fill 1-Tap Demo Logins */}
            <View style={styles.demoSection}>
              <Text style={styles.demoLabel}>1-TAP TEST LOGINS</Text>
              <View style={styles.demoRow}>
                {DEMO_ACCOUNTS.map((demo) => {
                  const isActive = email === demo.email;
                  return (
                    <Pressable
                      key={demo.role}
                      onPress={() => quickFill(demo)}
                      style={[styles.demoChip, isActive && styles.demoChipActive]}
                    >
                      <Text style={styles.demoChipIcon}>{demo.icon}</Text>
                      <Text style={[styles.demoChipText, isActive && styles.demoChipTextActive]}>
                        {demo.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </View>

          {/* Footer note */}
          <View style={styles.footer}>
            <Text style={styles.footerSecurity}>🔒 End-to-End Enterprise Role Authentication</Text>
            <Text style={styles.footerVersion}>TMS GoExpo v1.0.0 · SDK 58</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 28,
  },
  header: {
    marginBottom: 24,
  },
  logoBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  logoBadge: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.primaryGlow,
  },
  logoEmoji: {
    fontSize: 26,
    color: '#FFFFFF',
  },
  onlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.successLight,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 6,
  },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.success,
  },
  onlineText: {
    color: '#065F46',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  eyebrow: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  title: {
    color: colors.ink,
    fontSize: 36,
    lineHeight: 42,
    fontWeight: '900',
    letterSpacing: -1,
  },
  subtitle: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
    maxWidth: 320,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: colors.line,
    ...shadows.md,
  },
  eyeIcon: {
    fontSize: 18,
    color: colors.muted,
    paddingHorizontal: 4,
  },
  submitButton: {
    marginTop: 6,
    marginBottom: 16,
  },
  demoSection: {
    borderTopWidth: 1,
    borderTopColor: colors.lineLight,
    paddingTop: 16,
    marginTop: 4,
  },
  demoLabel: {
    color: colors.mutedLight,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 10,
    textAlign: 'center',
  },
  demoRow: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
  },
  demoChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 12,
    paddingVertical: 9,
    paddingHorizontal: 6,
    gap: 5,
  },
  demoChipActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  demoChipIcon: {
    fontSize: 13,
  },
  demoChipText: {
    color: colors.inkSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  demoChipTextActive: {
    color: colors.primary,
  },
  footer: {
    marginTop: 26,
    alignItems: 'center',
    gap: 5,
  },
  footerSecurity: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '600',
  },
  footerVersion: {
    color: colors.mutedLight,
    fontSize: 11,
    fontWeight: '500',
  },
});
