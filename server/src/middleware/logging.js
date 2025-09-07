// Request logging middleware
export const requestLogger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const path = req.path;
  const ip = req.ip || req.connection.remoteAddress;
  
  console.log(`📨 ${method} ${path} - ${timestamp} - IP: ${ip}`);
  
  // Log request body for POST/PUT/PATCH (excluding passwords)
  if (['POST', 'PUT', 'PATCH'].includes(method) && req.body) {
    const logBody = { ...req.body };
    if (logBody.password) logBody.password = '[HIDDEN]';
    console.log(`📦 Request body:`, logBody);
  }
  
  next();
};

// Error logging middleware
export const errorLogger = (err, req, res, next) => {
  const timestamp = new Date().toISOString();
  console.error(`❌ Error ${timestamp}:`, {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method,
    body: req.body
  });
  
  next(err);
};