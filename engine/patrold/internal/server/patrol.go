package server

import (
	"context"

	"connectrpc.com/connect"
	patrolv1 "github.com/npclaudiu/patrol/engine/patrold/internal/api/v1"
	"github.com/npclaudiu/patrol/engine/patrold/internal/api/v1/patrolv1connect"
)

// PatrolServer implements the Connect-RPC patrolv1.EngineService
type PatrolServer struct {
	// Embed the unimplemented interface to ensure compatibility
	patrolv1connect.UnimplementedEngineServiceHandler
}

// Ping is a simple unary RPC to verify IPC connectivity.
func (s *PatrolServer) Ping(ctx context.Context, req *connect.Request[patrolv1.PingRequest]) (*connect.Response[patrolv1.PingResponse], error) {
	greeting := "Pong! Received: " + req.Msg.Message
	res := connect.NewResponse(&patrolv1.PingResponse{
		Reply: greeting,
	})
	return res, nil
}
