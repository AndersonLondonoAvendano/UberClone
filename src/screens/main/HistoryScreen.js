// AI-assisted: see docs/AI_LOG.md #19
// History destination of the drawer: placeholder screen.

import { DrawerActions } from '@react-navigation/native';
import { PlaceholderScreen } from '../../components/PlaceholderScreen';
import { labels } from '../../constants/labels';

export function HistoryScreen({ navigation }) {
  return (
    <PlaceholderScreen
      name="history"
      title={labels.drawer.history}
      leading="drawer"
      onLeadingPress={() => navigation.dispatch(DrawerActions.openDrawer())}
    />
  );
}
