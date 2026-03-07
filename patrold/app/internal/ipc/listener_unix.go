//go:build !windows

package ipc

import (
	"fmt"
	"net"
	"os"
)

// Listen creates a native socket listener. On Unix, this creates a Unix Domain Socket.
func Listen(socketPath string) (net.Listener, error) {
	// Remove the socket if it already exists to prevent "address already in use"
	_ = os.Remove(socketPath)

	listener, err := net.Listen("unix", socketPath)
	if err != nil {
		return nil, fmt.Errorf("failed to bind to unix socket %s: %w", socketPath, err)
	}

	// Change permissions so the electron app can talk to it if needed
	// (usually inheriting permissions is fine for the current user)
	_ = os.Chmod(socketPath, 0600)

	return listener, nil
}
