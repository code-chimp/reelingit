// Package logger provides a simple leveled logger that writes info
// messages to stdout and error messages to a log file.
package logger

import (
	"log"
	"os"
)

// Logger writes info messages to stdout and error messages to a file.
type Logger struct {
	infoLogger  *log.Logger
	errorLogger *log.Logger
	file        *os.File
}

// NewLogger creates a Logger whose Info output goes to stdout and whose Error
// output is appended to logFilePath.
func NewLogger(logFilePath string) (*Logger, error) {
	file, err := os.OpenFile(logFilePath, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
	if err != nil {
		return nil, err
	}

	return &Logger{
		infoLogger:  log.New(os.Stdout, "INFO: ", log.Ldate|log.Ltime|log.Lshortfile),
		errorLogger: log.New(file, "ERROR: ", log.Ldate|log.Ltime|log.Lshortfile),
		file:        file,
	}, nil
}

// Info logs an informational message to stdout.
func (l *Logger) Info(msg string) {
	l.infoLogger.Printf("%s", msg)
}

// Error logs a message and its associated error to the log file.
func (l *Logger) Error(msg string, err error) {
	l.errorLogger.Printf("%s: %v", msg, err)
}

// Close closes the log file used for error output.
func (l *Logger) Close() {
	l.file.Close()
}
