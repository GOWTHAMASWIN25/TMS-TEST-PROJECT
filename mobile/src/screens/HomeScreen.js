import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, ErrorBanner, SectionTitle, StatusPill } from '../components/UI';
import { colors, shadows, typography } from '../theme';

const shortcuts = [
  { icon: '＋', title: 'Raise a Ticket', detail: 'Tell us what needs fixing or maintenance', screen: 'Raise' },
  { icon: '📋', title: 'Track Requests', detail: 'Live updates, assignments & ticket status', screen: 'Tickets' },
];

export default function HomeScreen({ user, stats, recent, onNavigate, onRefresh, overviewError }) {
  const name = user?.username || user?.name || 'SuperAdmin';
  const role = user?.role || 'User';

  return (
    <SafeAreaView style={styles.page} edges={['top']}>
      <ScrollView style={styles.page} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Top Header */}
        <View style={styles.header}>
          <View>
            <View style={styles.greetingRow}>
              <View style={styles.activeDot} />
              <Text style={styles.greeting}>CAMPUS SERVICE DESK</Text>
            </View>
            <Text style={styles.name}>{name}</Text>
          </View>
          <Pressable onPress={onRefresh} style={styles.avatar} hitSlop={10}>
            <Text style={styles.avatarText}>{name.charAt(0).toUpperCase()}</Text>
          </Pressable>
        </View>

        {/* Hero Card */}
        <View style={styles.hero}>
          <View style={styles.heroBadge}>
            <Text style={styles.heroEyebrow}>FACILITIES & IT SUPPORT</Text>
          </View>
          <Text style={styles.heroTitle}>How can we{'\n'}help today?</Text>
          <Text style={styles.heroBody}>Raise an issue and our team will get it moving immediately.</Text>
          <Pressable
            onPress={() => onNavigate('Raise')}
            style={({ pressed }) => [styles.heroActionBtn, pressed && styles.heroActionBtnPressed]}
          >
            <Text style={styles.heroActionBtnText}>＋  Create a Request</Text>
            <Text style={styles.heroActionBtnArrow}>→</Text>
          </Pressable>
          <View style={styles.heroOrb} />
          <View style={styles.heroOrbSecondary} />
        </View>

        <ErrorBanner message={overviewError} />

        {/* 2x2 Metric Cards Grid */}
        <SectionTitle title="Request Overview" action="See all" onAction={() => onNavigate('Tickets')} />
        <View style={styles.metricsGrid}>
          <MetricCard
            title="Total"
            value={stats?.total ?? 0}
            icon="📁"
            color={colors.primary}
            bg={colors.primaryLight}
          />
          <MetricCard
            title="Pending"
            value={stats?.pending ?? 0}
            icon="⏳"
            color={colors.warning}
            bg={colors.warningLight}
          />
          <MetricCard
            title="Assigned"
            value={stats?.assigned ?? 0}
            icon="🛠"
            color={colors.purple}
            bg={colors.purpleLight}
          />
          <MetricCard
            title="Resolved"
            value={stats?.closed ?? 0}
            icon="✓"
            color={colors.success}
            bg={colors.successLight}
          />
        </View>

        {/* Quick Access Shortcuts */}
        <SectionTitle title="Quick Actions" />
        {shortcuts.map((item) => (
          <Pressable
            key={item.title}
            onPress={() => onNavigate(item.screen)}
            style={({ pressed }) => [styles.shortcut, pressed && styles.pressed]}
          >
            <View style={styles.shortcutIcon}>
              <Text style={styles.shortcutIconText}>{item.icon}</Text>
            </View>
            <View style={styles.shortcutCopy}>
              <Text style={styles.shortcutTitle}>{item.title}</Text>
              <Text style={styles.shortcutDetail}>{item.detail}</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
        ))}

        {/* Recent Tickets Feed */}
        {recent?.length > 0 && (
          <View style={styles.recentSection}>
            <SectionTitle title="Recent Activity" action="See all" onAction={() => onNavigate('Tickets')} />
            {recent.slice(0, 3).map((item) => {
              const code = `#TMS-${(item._id || '').slice(-6).toUpperCase()}`;
              return (
                <View key={item._id} style={styles.recentCard}>
                  <View style={styles.recentTop}>
                    <View style={styles.recentCodeBadge}>
                      <Text style={styles.recentCodeText}>{code}</Text>
                    </View>
                    <StatusPill status={item.status} />
                  </View>
                  <Text style={styles.recentCategory}>{item.complaintType}</Text>
                  <Text style={styles.recentLocation}>📍 {item.blockName} · {item.roomNumber}</Text>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function MetricCard({ title, value, icon, color, bg }) {
  return (
    <View style={[styles.metricCard, { borderColor: `${color}30` }]}>
      <View style={styles.metricTop}>
        <View style={[styles.metricIconWrap, { backgroundColor: bg }]}>
          <Text style={[styles.metricIcon, { color }]}>{icon}</Text>
        </View>
        <Text style={[styles.metricValue, { color }]}>{value}</Text>
      </View>
      <Text style={styles.metricTitle}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  activeDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.success,
  },
  greeting: {
    color: colors.primary,
    letterSpacing: 1.2,
    fontSize: 11,
    fontWeight: '800',
    ...typography,
  },
  name: {
    marginTop: 4,
    color: colors.ink,
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -0.6,
    ...typography,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: colors.primaryLight,
    borderWidth: 1.5,
    borderColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  avatarText: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: '800',
    ...typography,
  },
  hero: {
    backgroundColor: colors.primary,
    borderRadius: 24,
    padding: 24,
    overflow: 'hidden',
    marginBottom: 24,
    ...shadows.primaryGlow,
  },
  heroBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 10,
  },
  heroEyebrow: {
    color: '#FFFFFF',
    letterSpacing: 1.2,
    fontWeight: '800',
    fontSize: 10,
    ...typography,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '900',
    lineHeight: 36,
    letterSpacing: -0.8,
    ...typography,
  },
  heroBody: {
    color: '#E0E7FF',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 8,
    maxWidth: 240,
    ...typography,
  },
  heroActionBtn: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    marginTop: 20,
    minHeight: 46,
    paddingHorizontal: 20,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    ...shadows.md,
  },
  heroActionBtnPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  heroActionBtnText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '800',
    ...typography,
  },
  heroActionBtnArrow: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '800',
  },
  heroOrb: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    right: -40,
    top: -40,
  },
  heroOrbSecondary: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    right: 50,
    bottom: -30,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  metricCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.line,
    ...shadows.sm,
  },
  metricTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  metricIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricIcon: {
    fontSize: 16,
    fontWeight: '700',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.5,
    ...typography,
  },
  metricTitle: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
    ...typography,
  },
  shortcut: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 11,
    borderWidth: 1,
    borderColor: colors.line,
    ...shadows.sm,
  },
  shortcutIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shortcutIconText: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: '800',
  },
  shortcutCopy: {
    marginLeft: 14,
    flex: 1,
  },
  shortcutTitle: {
    color: colors.ink,
    fontWeight: '800',
    fontSize: 15,
    ...typography,
  },
  shortcutDetail: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 2,
    ...typography,
  },
  chevron: {
    color: colors.mutedLight,
    fontSize: 22,
    marginRight: 4,
    fontWeight: '600',
  },
  recentSection: {
    marginTop: 18,
  },
  recentCard: {
    backgroundColor: '#FFFFFF',
    borderColor: colors.line,
    borderWidth: 1,
    padding: 16,
    borderRadius: 18,
    marginBottom: 10,
    ...shadows.sm,
  },
  recentTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recentCodeBadge: {
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  recentCodeText: {
    color: colors.inkSecondary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    ...typography,
  },
  recentCategory: {
    color: colors.ink,
    fontWeight: '800',
    fontSize: 16,
    marginTop: 10,
    ...typography,
  },
  recentLocation: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 6,
    fontWeight: '600',
    ...typography,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
});
