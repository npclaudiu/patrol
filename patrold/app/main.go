package main

import (
	"flag"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"

	"golang.org/x/net/http2"
	"golang.org/x/net/http2/h2c"

	"github.com/npclaudiu/patrol/engine/patrold/internal/api/v1/patrolv1connect"
	"github.com/npclaudiu/patrol/engine/patrold/internal/ipc"
	"github.com/npclaudiu/patrol/engine/patrold/internal/server"
)

func main() {
	var socketPath string
	flag.StringVar(&socketPath, "socket", "", "Path to the UNIX Domain Socket or Windows Named Pipe for IPC")
	flag.Parse()

	if socketPath == "" {
		log.Fatalf("Error: --socket parameter is required for IPC")
	}

	listener, err := ipc.Listen(socketPath)
	if err != nil {
		log.Fatalf("Failed to initialize listener: %v", err)
	}
	defer listener.Close()

	// Initialize the Mux
	mux := http.NewServeMux()

	// Register Connect Service
	patrolServer := &server.PatrolServer{}
	path, handler := patrolv1connect.NewEngineServiceHandler(patrolServer)
	mux.Handle(path, handler)

	// Since we operate purely over native sockets locally, we use h2c (HTTP/2 cleartext)
	// which allows Connect/gRPC to operate efficiently without TLS ceremonies.
	httpServer := &http.Server{
		Handler: h2c.NewHandler(mux, &http2.Server{}),
	}

	// Capture termination signals to shutdown gracefully
	go func() {
		stop := make(chan os.Signal, 1)
		signal.Notify(stop, os.Interrupt, syscall.SIGTERM)
		<-stop
		fmt.Println("\nEngine shutting down gracefully...")
		listener.Close()
		os.Exit(0)
	}()

	fmt.Printf("patrold: Daemon active. Listening on native socket %s\n", socketPath)
	if err := httpServer.Serve(listener); err != nil {
		if err != http.ErrServerClosed {
			log.Fatalf("Server error: %v", err)
		}
	}
}
