// AI-assisted: see docs/AI_LOG.md #2
const app = require('./app');

const DEFAULT_PORT = 3001;
const port = Number(process.env.PORT) || DEFAULT_PORT;

const server = app.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(
      `El puerto ${port} ya esta en uso. Cierra el proceso que lo ocupa o inicia el servidor con otro puerto (por ejemplo PORT=3002).`
    );
    process.exit(1);
  }
  console.error(`No se pudo iniciar el servidor: ${error.message}`);
  process.exit(1);
});

function shutdown() {
  server.close(() => process.exit(0));
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
