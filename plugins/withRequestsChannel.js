// AI-assisted: see AI_LOG.md #64
// Expo config plugin (D-139): creates the Android notification channel "solicitudes" (IMPORTANCE_HIGH)
// when the app process starts, so a push that arrives with the app closed uses a channel that already
// exists (the JS side is not running yet). It edits MainApplication.kt during prebuild; android/ is
// never edited by hand. The edit is idempotent (marked block) and fails loudly if the file shape changed.
const { withMainApplication } = require('expo/config-plugins');

const CHANNEL_ID = 'solicitudes';
const BEGIN_MARKER = '// @generated begin withRequestsChannel';
const END_MARKER = '// @generated end withRequestsChannel';
const ANCHOR = 'super.onCreate()';
const IMPORTS = ['android.app.NotificationChannel', 'android.app.NotificationManager', 'android.os.Build'];

function buildBlock(indent, eol) {
  const lines = [
    BEGIN_MARKER,
    'if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {',
    `  val requestsChannel = NotificationChannel("${CHANNEL_ID}", "Solicitudes de viaje", NotificationManager.IMPORTANCE_HIGH)`,
    '  requestsChannel.description = "Avisos de nuevas solicitudes de viaje"',
    '  requestsChannel.enableVibration(true)',
    '  // No custom sound: the channel keeps the default notification sound.',
    '  getSystemService(NotificationManager::class.java).createNotificationChannel(requestsChannel)',
    '}',
    END_MARKER,
  ];
  return lines.map((line) => indent + line).join(eol);
}

// Pure: takes the Kotlin source of MainApplication and returns it with the channel block and imports.
function addChannelToMainApplication(src) {
  if (typeof src !== 'string') throw new Error('withRequestsChannel: el contenido de MainApplication no es texto.');
  if (src.includes(BEGIN_MARKER)) return src; // idempotent

  const eol = src.includes('\r\n') ? '\r\n' : '\n';
  const lines = src.split(eol);
  const anchorIndex = lines.findIndex((line) => line.trim() === ANCHOR);
  if (anchorIndex === -1) {
    throw new Error(
      `withRequestsChannel: no se encontro "${ANCHOR}" en MainApplication.kt; la plantilla de Expo cambio y el plugin debe actualizarse.`,
    );
  }
  const indent = lines[anchorIndex].match(/^\s*/)[0];
  lines.splice(anchorIndex + 1, 0, ...buildBlock(indent, eol).split(eol));

  const missing = IMPORTS.filter((name) => !lines.some((line) => line.trim() === `import ${name}`));
  if (missing.length > 0) {
    const firstImport = lines.findIndex((line) => line.startsWith('import '));
    if (firstImport === -1) {
      throw new Error('withRequestsChannel: MainApplication.kt no tiene imports donde anclar los nuevos.');
    }
    lines.splice(firstImport, 0, ...missing.map((name) => `import ${name}`));
  }
  return lines.join(eol);
}

function withRequestsChannel(config) {
  return withMainApplication(config, (mod) => {
    if (mod.modResults.language !== 'kt') {
      throw new Error(
        `withRequestsChannel: se esperaba MainApplication en Kotlin ("kt") y es "${mod.modResults.language}".`,
      );
    }
    mod.modResults.contents = addChannelToMainApplication(mod.modResults.contents);
    return mod;
  });
}

module.exports = withRequestsChannel;
module.exports.addChannelToMainApplication = addChannelToMainApplication;
module.exports.CHANNEL_ID = CHANNEL_ID;
