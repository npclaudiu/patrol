//go:build windows

package ipc

import (
	"fmt"
	"net"

	"github.com/Microsoft/go-winio"
)

// Listen creates a native socket listener. On Windows, this creates a Named Pipe.
func Listen(socketPath string) (net.Listener, error) {
	listener, err := winio.ListenPipe(socketPath, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to bind to named pipe %s: %w", socketPath, err)
	}

	return listener, nil
}
