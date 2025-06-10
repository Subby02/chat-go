const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf, colorize } = format;

// 로그 출력 형식 정의
const customFormat = printf(({ level, message, timestamp }) => {
  return `[${timestamp}] ${level}: ${message}`;
});

// 로거 생성
const logger = createLogger({
  level: 'info', // 기본 로그 레벨
  format: combine(
    colorize(),            // 색상 추가 (콘솔 보기 좋게)
    timestamp(),           // 시간 추가
    customFormat           // 위에서 만든 출력 형식
  ),
  transports: [
    new transports.Console(),                    // 콘솔에 출력
    new transports.File({ filename: 'app.log' }) // 파일에 기록
  ],
});

module.exports = logger;