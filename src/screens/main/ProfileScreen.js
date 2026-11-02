// AI-assisted: see docs/AI_LOG.md #19
// Profile destination of the drawer: placeholder screen.

import { DrawerActions } from '@react-navigation/native';
import { PlaceholderScreen } from '../../components/PlaceholderScreen';
import { labels } from '../../constants/labels';

export function ProfileScreen({ navigation }) {
  return (
    <PlaceholderScreen
      name="profile"
      title={labels.drawer.profile}
      leading="drawer"
      onLeadingPress={() => navigation.dispatch(DrawerActions.openDrawer())}
    />
  );
}
