import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, ErrorBanner, SectionTitle, StatusPill } from '../components/UI';
import { API_BASE_URL, complaintApi, directoryApi, getErrorMessage } from '../api';
import { colors, shadows } from '../theme';

const statuses = ['Pending', 'Assigned', 'In-Progress', 'Onhold', 'Closed'];

export default function TicketsScreen({ user, refreshKey }) {
  const [tickets, setTickets] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState('');
  const [assigneeById, setAssigneeById] = useState({});
  const isAdmin = user?.role === 'SuperAdmin';

  const load = useCallback(async (pull = false) => {
    if (pull) setRefreshing(true);
    else setLoading(true);
    setError('');
    try {
      const [ticketsResponse, staffResponse] = await Promise.all([
        complaintApi.list(),
        isAdmin ? directoryApi.users() : Promise.resolve({ data: [] }),
      ]);
      setTickets(Array.isArray(ticketsResponse.data) ? ticketsResponse.data : []);
      setStaff(Array.isArray(staffResponse.data) ? staffResponse.data.filter((person) => person.role !== 'SuperAdmin') : []);
    } catch (err) {
      setError(getErrorMessage(err, 'Could not load tickets.'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isAdmin]);

  useEffect(() => { load(); }, [load, refreshKey]);

  const updateStatus = async (ticket, status) => {
    setBusyId(ticket._id);
    try {
      await complaintApi.updateStatus(ticket._id, status);
      await load(true);
    } catch (err) {
      setError(getErrorMessage(err, 'Could not update ticket status.'));
    } finally {
      setBusyId('');
    }
  };

  const assign = async (ticket) => {
    const assignee = assigneeById[ticket._id];
    if (!assignee) {
      Alert.alert('Choose a staff member', 'Select a staff member before assigning this ticket.');
      return;
    }
    setBusyId(ticket._id);
    try {
      await complaintApi.assign(ticket._id, assignee);
      await load(true);
    } catch (err) {
      setError(getErrorMessage(err, 'Could not assign ticket.'));
    } finally {
      setBusyId('');
    }
  };

  const openAttachment = async (path) => {
    const baseUrl = API_BASE_URL.replace(/\/api\/?$/, '');
    const attachmentUrl = new URL(path, `${baseUrl}/`).toString();
    try {
      await Linking.openURL(attachmentUrl);
    } catch (err) {
      setError(getErrorMessage(err, 'Could not open this attachment.'));
    }
  };

  return (
    <SafeAreaView style={styles.page} edges={['top']}>
      <ScrollView
        style={styles.page}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={colors.primary} />}
      >
        <Text style={styles.eyebrow}>{isAdmin ? 'SERVICE DESK OVERVIEW' : 'YOUR SERVICE DESK'}</Text>
        <Text style={styles.title}>{isAdmin ? 'All Tickets' : 'My Tickets'}</Text>
        <Text style={styles.subtitle}>
          {tickets.length} {tickets.length === 1 ? 'ticket' : 'tickets'} currently active in your queue
        </Text>

        <ErrorBanner message={error} onDismiss={() => setError('')} />

        {loading ? (
          <ActivityIndicator color={colors.primary} size="large" style={styles.loader} />
        ) : tickets.length === 0 ? (
          <View style={styles.empty}>
            <View style={styles.emptyIconCircle}>
              <Text style={styles.emptyIcon}>◷</Text>
            </View>
            <Text style={styles.emptyTitle}>No tickets found</Text>
            <Text style={styles.emptyCopy}>Your campus maintenance and support requests will appear here.</Text>
          </View>
        ) : (
          tickets.map((ticket) => {
            const currentUserId = String(user?.id || user?._id);
            const isAssignee = String(ticket.assignedTo?._id || ticket.assignedTo) === currentUserId;
            const isCreator = String(ticket.createdBy?._id || ticket.createdBy) === currentUserId;
            const allowedStatuses = isAdmin
              ? statuses
              : isAssignee
                ? ['In-Progress', 'Onhold', 'Closed']
                : isCreator
                  ? ['Pending', 'Closed']
                  : [];

            const ticketCode = `#TMS-${(ticket._id || '').slice(-6).toUpperCase()}`;

            return (
              <View key={ticket._id} style={styles.card}>
                {/* Header row */}
                <View style={styles.cardTop}>
                  <View style={styles.codeBadge}>
                    <Text style={styles.codeText}>{ticketCode}</Text>
                  </View>
                  <StatusPill status={ticket.status} />
                </View>

                {/* Category & Location */}
                <Text style={styles.category}>{ticket.complaintType}</Text>
                <View style={styles.locationRow}>
                  <Text style={styles.locationIcon}>📍</Text>
                  <Text style={styles.location}>{ticket.blockName} · {ticket.roomNumber}</Text>
                </View>

                {/* Remarks */}
                {!!ticket.remarks && (
                  <Text style={styles.description} numberOfLines={3}>
                    {ticket.remarks}
                  </Text>
                )}

                {/* Attachment Link */}
                {ticket.attachment ? (
                  <Pressable
                    onPress={() => openAttachment(ticket.attachment)}
                    style={({ pressed }) => [styles.attachment, pressed && styles.pressed]}
                  >
                    <Text style={styles.attachmentIcon}>📎</Text>
                    <Text style={styles.attachmentText}>View Attachment</Text>
                  </Pressable>
                ) : null}

                {/* Meta details */}
                <View style={styles.meta}>
                  <Text style={styles.metaText}>📅 {new Date(ticket.createdAt).toLocaleDateString()}</Text>
                  {ticket.assignedTo ? (
                    <Text style={styles.metaStaff}>
                      👤 {typeof ticket.assignedTo === 'object' ? ticket.assignedTo.username : 'Assigned Staff'}
                    </Text>
                  ) : null}
                </View>

                {/* Admin Assign Staff */}
                {isAdmin && (
                  <View style={styles.manage}>
                    <Text style={styles.manageLabel}>Assign to Staff</Text>
                    <View style={styles.pickerWrap}>
                      <Picker
                        selectedValue={assigneeById[ticket._id] || ''}
                        onValueChange={(value) => setAssigneeById((current) => ({ ...current, [ticket._id]: value }))}
                        style={styles.picker}
                      >
                        <Picker.Item label="Select staff member" value="" />
                        {staff.map((person) => (
                          <Picker.Item key={person._id} label={`${person.username} · ${person.role}`} value={person._id} />
                        ))}
                      </Picker>
                    </View>
                    <Button
                      title="Assign Ticket"
                      secondary
                      onPress={() => assign(ticket)}
                      loading={busyId === ticket._id}
                      style={styles.assignButton}
                    />
                  </View>
                )}

                {/* Allowed Status Actions */}
                {allowedStatuses.length > 0 && (
                  <View style={styles.manage}>
                    <SectionTitle title="Update Status" />
                    <View style={styles.statusOptions}>
                      {allowedStatuses
                        .filter((status) => status !== ticket.status)
                        .map((status) => (
                          <Pressable
                            key={status}
                            disabled={busyId === ticket._id}
                            onPress={() => updateStatus(ticket, status)}
                            style={({ pressed }) => [styles.statusButton, pressed && styles.pressed]}
                          >
                            <Text style={styles.statusButtonText}>
                              {status === 'Closed' ? '✓ Resolve' : status}
                            </Text>
                          </Pressable>
                        ))}
                    </View>
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 36,
  },
  eyebrow: {
    color: colors.primary,
    letterSpacing: 1.2,
    fontSize: 11,
    fontWeight: '800',
  },
  title: {
    color: colors.ink,
    fontSize: 30,
    fontWeight: '900',
    marginTop: 4,
    letterSpacing: -0.6,
  },
  subtitle: {
    color: colors.muted,
    fontSize: 14,
    marginTop: 4,
    marginBottom: 20,
  },
  loader: {
    marginTop: 50,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 50,
    paddingHorizontal: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.line,
    ...shadows.sm,
  },
  emptyIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  emptyIcon: {
    color: colors.primary,
    fontSize: 28,
  },
  emptyTitle: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: '800',
  },
  emptyCopy: {
    color: colors.muted,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 20,
    fontSize: 13,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.line,
    ...shadows.sm,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  codeBadge: {
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
  },
  codeText: {
    color: colors.inkSecondary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  category: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: '800',
    marginTop: 12,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  locationIcon: {
    fontSize: 12,
  },
  location: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '600',
  },
  description: {
    color: colors.inkSecondary,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 10,
    backgroundColor: colors.surfaceSubtle,
    padding: 10,
    borderRadius: 12,
  },
  attachment: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: 12,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.primaryMuted,
    gap: 6,
  },
  attachmentIcon: {
    fontSize: 13,
  },
  attachmentText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  meta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.lineLight,
    marginTop: 14,
    paddingTop: 12,
  },
  metaText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '600',
  },
  metaStaff: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  manage: {
    borderTopWidth: 1,
    borderTopColor: colors.lineLight,
    marginTop: 14,
    paddingTop: 14,
  },
  manageLabel: {
    color: colors.inkSecondary,
    fontWeight: '700',
    fontSize: 13,
    marginBottom: 8,
  },
  pickerWrap: {
    borderColor: colors.line,
    borderWidth: 1.5,
    borderRadius: 14,
    backgroundColor: colors.surfaceSubtle,
    overflow: 'hidden',
    marginBottom: 10,
  },
  picker: {
    height: 50,
    color: colors.ink,
  },
  assignButton: {
    minHeight: 46,
  },
  statusOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusButton: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.primaryMuted,
    borderRadius: 12,
  },
  statusButtonText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
});
