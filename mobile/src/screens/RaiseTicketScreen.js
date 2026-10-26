import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as DocumentPicker from 'expo-document-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, ErrorBanner, Field } from '../components/UI';
import { complaintApi, directoryApi, getErrorMessage } from '../api';
import { colors, shadows } from '../theme';

const categories = ['PC Hardware', 'PC Software', 'Application Issues', 'Network', 'Electronics', 'Plumbing', 'Other'];
const listFrom = (data) => (Array.isArray(data) ? data : data?.data || []);

export default function RaiseTicketScreen({ user, onSubmitted }) {
  const [departments, setDepartments] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [departmentId, setDepartmentId] = useState('');
  const [blockId, setBlockId] = useState('');
  const [roomId, setRoomId] = useState('');
  const [manualRoom, setManualRoom] = useState('');
  const [category, setCategory] = useState(categories[0]);
  const [remarks, setRemarks] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [loadingDirectory, setLoadingDirectory] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const canRaise = !user?.role || ['SuperAdmin', 'User'].includes(user.role);

  useEffect(() => {
    let active = true;
    directoryApi
      .departments()
      .then((response) => {
        if (active) setDepartments(listFrom(response.data));
      })
      .catch((err) => {
        if (active) setError(getErrorMessage(err, 'Could not load departments.'));
      })
      .finally(() => {
        if (active) setLoadingDirectory(false);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    setBlocks([]);
    setBlockId('');
    setRooms([]);
    setRoomId('');
    if (!departmentId) return undefined;
    let active = true;
    setLoadingDirectory(true);
    directoryApi
      .blocks({ departmentId })
      .then((response) => {
        if (active) setBlocks(listFrom(response.data));
      })
      .catch((err) => {
        if (active) setError(getErrorMessage(err, 'Could not load buildings.'));
      })
      .finally(() => {
        if (active) setLoadingDirectory(false);
      });
    return () => {
      active = false;
    };
  }, [departmentId]);

  useEffect(() => {
    setRooms([]);
    setRoomId('');
    if (!blockId) return undefined;
    let active = true;
    setLoadingDirectory(true);
    directoryApi
      .rooms({ blockId })
      .then((response) => {
        if (active) setRooms(listFrom(response.data));
      })
      .catch((err) => {
        if (active) setError(getErrorMessage(err, 'Could not load rooms.'));
      })
      .finally(() => {
        if (active) setLoadingDirectory(false);
      });
    return () => {
      active = false;
    };
  }, [blockId]);

  const chooseAttachment = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf'],
        copyToCacheDirectory: true,
      });
      if (!result.canceled) setAttachment(result.assets[0]);
    } catch (err) {
      setError(getErrorMessage(err, 'Could not open the document picker.'));
    }
  };

  const submit = async () => {
    setError('');
    const department = departments.find((item) => item._id === departmentId);
    const block = blocks.find((item) => item._id === blockId);
    const room = rooms.find((item) => item._id === roomId);
    const roomNumber = roomId === '__manual__' || rooms.length === 0 ? manualRoom.trim() : room?.roomNumber;
    if (!department || !block || !roomNumber) {
      setError('Select a department and building, then choose or enter a room.');
      return;
    }
    setSubmitting(true);
    try {
      const data = new FormData();
      data.append('departmentName', department.name);
      data.append('blockName', block.name);
      data.append('roomNumber', roomNumber);
      data.append('complaintType', category);
      data.append('remarks', remarks.trim());
      if (user?.id || user?._id) data.append('userId', user.id || user._id);
      if (attachment) {
        data.append('attachment', {
          uri: attachment.uri,
          name: attachment.name || 'attachment',
          type: attachment.mimeType || 'application/octet-stream',
        });
      }
      await complaintApi.create(data);
      Alert.alert('Request submitted', 'Your service request is on its way.', [
        { text: 'Done', onPress: onSubmitted },
      ]);
    } catch (err) {
      setError(getErrorMessage(err, 'Could not submit your request.'));
    } finally {
      setSubmitting(false);
    }
  };

  if (!canRaise) {
    return (
      <SafeAreaView style={styles.permission} edges={['top']}>
        <View style={styles.permissionCard}>
          <Text style={styles.permissionIcon}>🔒</Text>
          <Text style={styles.title}>Request Not Available</Text>
          <Text style={styles.helper}>Your account role does not have permission to raise a ticket.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.flex} edges={['top']}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView style={styles.page} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Text style={styles.eyebrow}>CAMPUS SERVICE DESK</Text>
          <Text style={styles.title}>Raise a Ticket</Text>
          <Text style={styles.helper}>Share the details below and our facilities team will resolve it.</Text>

          <ErrorBanner message={error} onDismiss={() => setError('')} />

          {loadingDirectory && departments.length === 0 ? (
            <ActivityIndicator color={colors.primary} size="large" style={styles.loader} />
          ) : (
            <View style={styles.formCard}>
              <SelectField
                label="Department"
                value={departmentId}
                onChange={setDepartmentId}
                placeholder="Choose department"
                items={departments.map((item) => ({ label: item.name, value: item._id }))}
                required
              />

              <SelectField
                label="Building / Block"
                value={blockId}
                onChange={setBlockId}
                placeholder="Choose building"
                disabled={!departmentId}
                items={blocks.map((item) => ({ label: item.name, value: item._id }))}
                required
              />

              <SelectField
                label="Room"
                value={roomId}
                onChange={setRoomId}
                placeholder="Choose room"
                disabled={!blockId}
                items={[
                  ...rooms.map((item) => ({ label: item.roomNumber, value: item._id })),
                  { label: 'Enter a room manually', value: '__manual__' },
                ]}
                required
              />

              {(rooms.length === 0 || roomId === '__manual__') && (
                <Field
                  label="Room Number"
                  value={manualRoom}
                  onChangeText={setManualRoom}
                  placeholder="e.g. LAB-101"
                  required
                />
              )}

              <SelectField
                label="Problem Category"
                value={category}
                onChange={setCategory}
                items={categories.map((item) => ({ label: item, value: item }))}
                required
              />

              <Field
                label="Describe the Issue"
                value={remarks}
                onChangeText={setRemarks}
                placeholder="What happened? Add any helpful details (e.g. system not powering on, water leakage)..."
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                style={styles.descriptionInput}
              />

              {/* Attachment selector */}
              <View style={styles.attachmentSection}>
                <Text style={styles.fieldLabel}>Attachment or Evidence (Optional)</Text>
                <Pressable
                  onPress={chooseAttachment}
                  style={({ pressed }) => [styles.fileButton, pressed && styles.pressed]}
                >
                  <Text style={styles.fileIcon}>📎</Text>
                  <Text style={styles.fileButtonText}>
                    {attachment?.name ? attachment.name : 'Choose photo or document'}
                  </Text>
                  {attachment ? (
                    <Pressable
                      onPress={(e) => {
                        e.stopPropagation();
                        setAttachment(null);
                      }}
                      hitSlop={10}
                    >
                      <Text style={styles.clearFile}>✕</Text>
                    </Pressable>
                  ) : null}
                </Pressable>
              </View>

              <Button
                title="Submit Ticket Request"
                icon="➔"
                onPress={submit}
                loading={submitting}
                style={styles.submitButton}
              />
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function SelectField({ label, value, onChange, items, placeholder, disabled = false, required = false }) {
  return (
    <View style={styles.field}>
      <View style={styles.labelRow}>
        <Text style={styles.fieldLabel}>{label}</Text>
        {required ? <Text style={styles.requiredMark}>*</Text> : null}
      </View>
      <View style={[styles.pickerWrap, disabled && styles.disabled]}>
        <Picker selectedValue={value} onValueChange={onChange} enabled={!disabled} style={styles.picker}>
          {placeholder ? <Picker.Item label={placeholder} value="" /> : null}
          {items.map((item) => (
            <Picker.Item key={item.value} label={item.label} value={item.value} />
          ))}
        </Picker>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.background,
  },
  page: {
    flex: 1,
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
  helper: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
    marginBottom: 20,
  },
  loader: {
    marginTop: 50,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 22,
    padding: 20,
    ...shadows.sm,
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
  fieldLabel: {
    color: colors.inkSecondary,
    fontSize: 13,
    fontWeight: '700',
  },
  requiredMark: {
    color: colors.danger,
    fontSize: 13,
    fontWeight: '700',
  },
  pickerWrap: {
    borderColor: colors.line,
    borderWidth: 1.5,
    borderRadius: 14,
    backgroundColor: colors.surfaceSubtle,
    overflow: 'hidden',
  },
  picker: {
    height: 52,
    color: colors.ink,
  },
  disabled: {
    opacity: 0.5,
  },
  descriptionInput: {
    minHeight: 110,
    paddingTop: 12,
  },
  attachmentSection: {
    marginBottom: 20,
  },
  fileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    borderWidth: 1.5,
    borderColor: colors.primaryMuted,
    borderRadius: 14,
    paddingVertical: 13,
    paddingHorizontal: 16,
    marginTop: 7,
    gap: 8,
  },
  fileIcon: {
    fontSize: 16,
  },
  fileButtonText: {
    flex: 1,
    color: colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  clearFile: {
    color: colors.danger,
    fontSize: 14,
    fontWeight: '800',
    padding: 4,
  },
  submitButton: {
    marginTop: 6,
  },
  permission: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 24,
    justifyContent: 'center',
  },
  permissionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.line,
    ...shadows.sm,
  },
  permissionIcon: {
    fontSize: 34,
    marginBottom: 12,
  },
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.99 }],
  },
});
