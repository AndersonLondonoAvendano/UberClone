// AI-assisted: see docs/AI_LOG.md #67
// AI-assisted: see docs/AI_LOG.md #60
// AI-assisted: see docs/AI_LOG.md #68 (compact language control as the last block of the screen)
// Welcome of the registration, shown before the tabs while the registration is not sent. Pattern: a
// 3-step checklist with a progress indicator ("N de 3") and one main action that opens the first
// incomplete step (no carousel). The state of each step is derived from what the form context already
// validates (deriveRegistrationProgress); nothing is recomputed here. "Cerrar sesión" is a discreet
// link under the masked account email, with the confirmation on screen.

import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../../components/Card';
import { Icon } from '../../components/Icon';
import { PrimaryButton } from '../../components/PrimaryButton';
import { InlineSignOut } from '../../components/registration/InlineSignOut';
import { LanguageSection } from '../../components/settings/LanguageSection';
import { labels } from '../../constants/labels';
import { useLanguage } from '../../i18n/useLanguage';
import { useAppState } from '../../context/AppStateContext';
import { useRegistrationForm } from '../../context/RegistrationFormContext';
import { badgeSize, borderWidth, color, iconSize, opacity, radius, space, touch, type } from '../../theme/tokens';
import { maskEmail } from '../../utils/mask';
import { deriveRegistrationProgress } from '../../utils/registrationProgress';

const SAFE_EDGES = ['top', 'bottom'];
const COPY = labels.registrationFlow.welcome;
const STEP_ICONS = { personalData: 'person', vehicle: 'car', documents: 'document-text' };

function fill(template, values) {
  return Object.keys(values).reduce((text, key) => text.replace(`{${key}}`, String(values[key])), template);
}

// onStart(routeName): opens the registration tabs at that tab.
export function WelcomeScreen({ onStart }) {
  useLanguage();
  const ACTION_LABELS = { start: COPY.start, continue: COPY.continue, review: COPY.review };
  const { isPersonalDataValid, isVehicleValid, isDocumentsValid } = useRegistrationForm();
  const { authUser } = useAppState();
  const progress = deriveRegistrationProgress({ isPersonalDataValid, isVehicleValid, isDocumentsValid });
  const maskedEmail = maskEmail(authUser?.email);
  const progressText = fill(COPY.progress, { n: progress.completedCount, total: progress.total });
  // While the sign-out confirmation is open the main action is hidden: one primary action at a time.
  const [signOutOpen, setSignOutOpen] = useState(false);

  return (
    <SafeAreaView testID="screen-registration-welcome" edges={SAFE_EDGES} style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.hero}>
          <View style={styles.heroBadge}>
            <Icon name="car" size={iconSize.lg} tint={color.onPrimarySoft} />
          </View>
          <Text accessibilityRole="header" style={styles.title}>
            {COPY.title}
          </Text>
          <Text style={styles.intro}>{COPY.intro}</Text>
        </View>

        <View style={styles.progressBlock}>
          <Text testID="welcome-progress" accessibilityLiveRegion="polite" style={styles.progressText}>
            {progressText}
          </Text>
          <View style={styles.segments} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
            {progress.steps.map((step) => (
              <View key={step.key} style={[styles.segment, step.complete && styles.segmentDone]} />
            ))}
          </View>
        </View>

        <Card style={styles.stepsCard}>
          {progress.steps.map((step) => {
            const copy = COPY.steps[step.key];
            const statusText = step.complete ? COPY.stepComplete : COPY.stepPending;
            return (
              <Pressable
                key={step.key}
                testID={`welcome-step-${step.key}`}
                accessibilityRole="button"
                accessibilityLabel={`${copy.title}, ${statusText}. ${copy.hint}`}
                onPress={() => onStart(step.route)}
                style={({ pressed }) => [styles.stepRow, pressed && styles.pressed]}
              >
                <View style={[styles.stepBadge, step.complete && styles.stepBadgeDone]}>
                  <Icon
                    name={step.complete ? 'checkmark' : STEP_ICONS[step.key]}
                    size={iconSize.lg}
                    tint={step.complete ? color.onSuccessSoft : color.onPrimarySoft}
                  />
                </View>
                <View style={styles.stepText}>
                  <Text style={styles.stepTitle}>{copy.title}</Text>
                  <Text style={styles.stepHint}>{copy.hint}</Text>
                  <Text style={[styles.stepStatus, step.complete ? styles.statusDone : styles.statusPending]}>
                    {statusText}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </Card>

        <View style={styles.estimateRow}>
          <Icon name="time-outline" size={iconSize.md} tint={color.textMuted} />
          <Text style={styles.estimate}>{COPY.estimate}</Text>
        </View>

        {signOutOpen ? null : (
          <PrimaryButton
            testID="welcome-start"
            label={ACTION_LABELS[progress.action]}
            onPress={() => onStart(progress.startRoute)}
          />
        )}

        <View style={styles.account}>
          {maskedEmail ? (
            <Text
              testID="welcome-account-email"
              accessibilityLabel={fill(COPY.signedInAsA11y, { email: maskedEmail })}
              style={styles.accountText}
            >
              {fill(COPY.signedInAs, { email: maskedEmail })}
            </Text>
          ) : null}
          <InlineSignOut trigger="link" onOpenChange={setSignOutOpen} />
        </View>

        <LanguageSection compact />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: color.bg },
  content: { flexGrow: 1, padding: space[4], gap: space[5] },
  hero: { gap: space[3] },
  heroBadge: {
    width: badgeSize,
    height: badgeSize,
    borderRadius: radius.full,
    backgroundColor: color.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { ...type.display, color: color.text },
  intro: { ...type.body, color: color.textMuted },
  progressBlock: { gap: space[2] },
  progressText: { ...type.bodyStrong, color: color.text },
  segments: { flexDirection: 'row', gap: space[2] },
  segment: { flex: 1, height: space[2], borderRadius: radius.full, backgroundColor: color.borderSubtle },
  segmentDone: { backgroundColor: color.primary },
  stepsCard: { gap: space[2], paddingVertical: space[2] },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    minHeight: touch.controlHeight + space[2],
    paddingVertical: space[2],
  },
  pressed: { opacity: opacity.pressed },
  stepBadge: {
    width: badgeSize,
    height: badgeSize,
    borderRadius: radius.full,
    backgroundColor: color.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBadgeDone: { backgroundColor: color.successSoft },
  stepText: { flex: 1, flexShrink: 1, gap: space[0] },
  stepTitle: { ...type.bodyStrong, color: color.text },
  stepHint: { ...type.small, color: color.textMuted },
  stepStatus: { ...type.label },
  statusDone: { color: color.onSuccessSoft },
  statusPending: { color: color.textMuted },
  estimateRow: { flexDirection: 'row', alignItems: 'center', gap: space[2] },
  estimate: { ...type.small, flex: 1, color: color.textMuted },
  account: { gap: space[1], borderTopWidth: borderWidth.thin, borderTopColor: color.borderSubtle, paddingTop: space[3] },
  accountText: { ...type.small, color: color.textMuted },
});
