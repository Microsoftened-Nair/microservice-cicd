const express = require('express');
const path = require('path');
const client = require('prom-client');

const app = express();
const PORT = process.env.PORT || 3000;
const SERVICE_NAME = process.env.SERVICE_NAME || 'frontend-service';

const register = new client.Registry();
client.collectDefaultMetrics({
  register,
  prefix: 'frontend_service_',
  labels: { service: SERVICE_NAME }
});

const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['service', 'method', 'route', 'status_code'],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2, 5]
});

const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['service', 'method', 'route', 'status_code']
});

register.registerMetric(httpRequestDuration);
register.registerMetric(httpRequestsTotal);

app.use((req, res, next) => {
  if (req.path === '/metrics') {
    return next();
  }

  const end = httpRequestDuration.startTimer();
  res.on('finish', () => {
    const labels = {
      service: SERVICE_NAME,
      method: req.method,
      route: req.path,
      status_code: res.statusCode
    };
    end(labels);
    httpRequestsTotal.inc(labels);
  });

  next();
});

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => {
  console.log(`Frontend Service running on port ${PORT}`);
});
