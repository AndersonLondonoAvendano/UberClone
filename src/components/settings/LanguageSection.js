// AI-assisted: see docs/AI_LOG.md #67
// "Idioma / Language" section of Settings (T-254; RI-10, RI-11, RI-12, RI-14). Two radio options, each
// written in its own language; the active one shows a check icon plus the text "Active" (never only colour).
// The choice is saved on the phone by setLanguage, never on a server. If the save fails the language still
// changes and a short inline notice is shown (no dialog).

import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { labels } from '../../constants/labels';
import { useLanguage } from '../../i18n/useLanguage';
import { setLanguage } from '../../i18n/languageStore';
import { borderWidth, color, iconSize, opacity, radius, space, touch, type } from '../../theme/tokens';
import { Card } from '../Card';
import { Icon } from '../Icon';

// Each option name is a fixed string in its own language, whatever language is active.
const OPTIONS = [
  { code: 'es', nameKey: 'optionEs', testID: 'language-option-es' },
  { code: 'en', nameKey: 'optionEn', testID: 'language-option-en' },
];

export function LanguageSection() {
  const { language } = useLanguage();
  const [saveFailed, setSaveFailed] = useState(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const onSelect = useCallback(async (code) => {
    setSaveFailed(false);
    const { saved } = await setLanguage(code);
    if (mounted.current) setSaveFailed(!saved);
  }, []);

  const text = labels.settings.language;

  return (
    <View style={styles.stack} testID="language-section">
      <Text style={styles.section} accessibilityRole="header">
        {text.title}
      </Text>
      <View accessibilityRole="radiogroup" accessibilityLabel={text.groupLabel} style={styles.stack}>
        {OPTIONS.map((option) => {
          const selected = language === option.code;
          const name = text[option.nameKey];
          return (
            <Pressable
              key={option.code}
              testID={option.testID}
              accessibilityRole="radio"
              accessibilityLabel={name}
              accessibilityState={{ selected, checked: selected }}
              onPress={() => onSelect(option.code)}
              style={({ pressed }) => [styles.option, selected && styles.optionActive, pressed && styles.pressed]}
            >
              <Text style={[styles.name, selected && styles.nameActive]}>{name}</Text>
              {selected ? (
                <View style={styles.check}>
                  <Icon name="checkmark-circle" size={iconSize.lg} tint={color.primary} />
                  <Text style={styles.activeText}>{text.active}</Text>
                </View>
              ) : null}
            </Pressable>
          );
        })}
      </View>
      {saveFailed ? (
        <Card variant="status" tone="warning" style={styles.notice} accessibilityLiveRegion="polite" testID="language-not-saved">
          <Icon name="warning" size={iconSize.md} tint={color.onWarningSoft} />
          <Text style={styles.noticeText}>{text.notSaved}</Text>
        </Card>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  stack: { gap: space[2] },
  section: { ...type.title, color: color.text },
  option: {
    minHeight: touch.controlHeight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space[3],
    paddingHorizontal: space[3],
    paddingVertical: space[2],
    borderWidth: borderWidth.thick,
    borderColor: color.border,
    borderRadius: radius.md,
    backgroundColor: color.surface,
  },
  optionActive: { borderColor: color.primary, backgroundColor: color.primarySoft },
  name: { ...type.body, color: color.text, flexShrink: 1 },
  nameActive: { ...type.bodyStrong, color: color.onPrimarySoft },
  check: { flexDirection: 'row', alignItems: 'center', gap: space[1], flexShrink: 1 },
  activeText: { ...type.label, color: color.onPrimarySoft, flexShrink: 1 },
  notice: { flexDirection: 'row', alignItems: 'flex-start', gap: space[2], padding: space[3] },
  noticeText: { ...type.body, color: color.onWarningSoft, flexShrink: 1 },
  pressed: { opacity: opacity.pressed },
});
