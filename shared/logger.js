const winston = require('winston');
const { format } = winston;
const DailyRotateFile = require('winston-daily-rotate-file');
const cron = require('cron');
const path = require('path');

const customLevels = {
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    debug: 3
  },
  colors: {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    debug: 'blue'
  }
};

// Configure logger
const logger = winston.createLogger({
  levels: customLevels.levels,
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
  ),
  transports: [
    new winston.transports.Console(),
    new DailyRotateFile({
      filename: 'logs/%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d' // Retain logs for 14 days
    })
  ]
});

// Schedule log rotation at 12:01 PM every day
const rotationJob = new cron.CronJob('0 55 12 * * *', function () {
  logger.info("Cron is working for saving log file")
  const rotatedTransport = new DailyRotateFile({
    filename: 'logs/%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d' // Retain logs for 14 days
  });

  // Remove the previous transport and add the rotated one
  logger.clear();
  logger.add(rotatedTransport);

  // Optionally, you can also unlink old log files here if needed
});

rotationJob.start(); // Start the cron job

module.exports = logger;
