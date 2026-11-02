// AI-assisted: see docs/AI_LOG.md #19
// Earnings destination of the drawer: placeholder screen.

import { DrawerActions } from '@react-navigation/native';
import { PlaceholderScreen } from '../../components/PlaceholderScreen';
import { labels } from '../../constants/labels';

export function EarningsScreen({ navigation }) {
  return (
    <PlaceholderScreen
      name="earnings"
      title={labels.drawer.earnings}
      leading="drawer"
      onLeadingPress={() => navigation.dispatch(DrawerActions.openDrawer())}
    />
  );
}
