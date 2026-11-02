// AI-assisted: see docs/AI_LOG.md #18
// Incoming request trip screen (placeholder body): back button and one primary action.

import { StyleSheet, Text, View } from 'react-native';
import { PlaceholderScreen } from '../../components/PlaceholderScreen';
import { PrimaryButton } from '../../components/PrimaryButton';
import { labels } from '../../constants/labels';
import { color, space, type } from '../../theme/tokens';

export function TripRequestScreen({ navigation }) {
  return (
    <PlaceholderScreen
      name="trip-request"
      title={labels.trip.requestTitle}
      leading="back"
      onLeadingPress={navigation.goBack}
    >
      <View style={styles.stack}>
        <Text style={styles.body}>{labels.placeholder.body}</Text>
        <PrimaryButton
          testID="trip-request-continue"
          label={labels.trip.continue}
          onPress={() => navigation.navigate('TripActive')}
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
