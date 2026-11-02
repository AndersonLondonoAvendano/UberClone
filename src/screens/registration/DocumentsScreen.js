// AI-assisted: see docs/AI_LOG.md #15
// Documents tab: placeholder screen with the default marker body.

import { PlaceholderScreen } from '../../components/PlaceholderScreen';
import { labels } from '../../constants/labels';

const SAFE_EDGES = ['top'];

export function DocumentsScreen() {
  return (
    <PlaceholderScreen
      name="documents"
      title={labels.tabs.documents}
      leading={null}
      safeEdges={SAFE_EDGES}
    />
  );
}
