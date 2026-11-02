// AI-assisted: see docs/AI_LOG.md #18
// Active trip trip screen (placeholder body): back button and one primary action.

import { StyleSheet, Text, View } from 'react-native';
import { PlaceholderScreen } from '../../components/PlaceholderScreen';
import { PrimaryButton } from '../../components/PrimaryButton';
import { labels } from '../../constants/labels';
import { color, space, type } from '../../theme/tokens';

export function TripActiveScreen({ navigation }) {
  return (
    <PlaceholderScreen
      name="trip-active"
      title={labels.trip.activeTitle}
      leading="back"
      onLeadingPress={navigation.goBack}
    >
      <View style={styles.stack}>
        <Text style={styles.body}>{labels.placeholder.body}</Text>
        <PrimaryButton
          testID="trip-active-continue"
          label={labels.trip.continue}
          onPress={() => navigation.navigate('TripSummary')}
        />
      </View>
    </PlaceholderScreen>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: space[5],
  },
  body: {
    ...type.body,
    color: color.textMuted,
  },
});
