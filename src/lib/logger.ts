import pino, { type Logger, type LoggerOptions } from "pino";

const isDev = process.env.NODE_ENV === "development";
const isTest = process.env.NODE_ENV === "test";

const options: LoggerOptions = {
  level: process.env.LOG_LEVEL || (isTest ? "warn" : isDev ? "debug" : "info"),
  base: {
    app: "oncampus",
    env: process.env.NODE_ENV || "development",
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  messageKey: "message",
  redact: {
    paths: [
      "password",
      "passwordHash",
      "otp",
      "otpHash",
      "token",
      "jwt",
      "authorization",
      "req.headers.authorization",
      "smtp_pass",
    ],
    remove: true,
  },
  serializers: {
    err: pino.stdSerializers.err,
    error: pino.stdSerializers.err,
  },
};

if (isDev) {
  options.transport = {
    target: "pino-pretty",
    options: {
      colorize: true,
      translateTime: "SYS:standard",
      singleLine: true,
      ignore: "pid,hostname",
    },
  };
}

export const logger = pino(options);

export const withLogContext = (context: Record<string, unknown>): Logger =>
  logger.child(context);

export const serializeError = (error: unknown) => {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }
  return { message: String(error) };
};

export default logger;

