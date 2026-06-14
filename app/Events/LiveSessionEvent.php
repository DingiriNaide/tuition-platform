<?php

declare(strict_types=1);

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class LiveSessionEvent implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public readonly string $channelName,
        public readonly string $type,    // session-started | session-ended | chat | hand-raised | hand-lowered | participant-joined | participant-left
        public readonly array  $data,
    ) {}

    public function broadcastOn(): array
    {
        return [new PresenceChannel("live.{$this->channelName}")];
    }

    public function broadcastAs(): string
    {
        return 'live-event';
    }

    public function broadcastWith(): array
    {
        return [
            'type' => $this->type,
            'data' => $this->data,
        ];
    }
}
