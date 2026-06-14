<?php

declare(strict_types=1);

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class SignalEvent implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public readonly string $channelName,
        public readonly string $type,       // offer | answer | ice-candidate
        public readonly string $fromUserId,
        public readonly string $toUserId,   // empty string = broadcast to all
        public readonly mixed  $payload,
    ) {}

    public function broadcastOn(): array
    {
        return [new PresenceChannel("live.{$this->channelName}")];
    }

    public function broadcastAs(): string
    {
        return 'signal';
    }

    public function broadcastWith(): array
    {
        return [
            'type'        => $this->type,
            'from_user_id'=> $this->fromUserId,
            'to_user_id'  => $this->toUserId,
            'payload'     => $this->payload,
        ];
    }
}
