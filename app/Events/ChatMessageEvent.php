<?php

declare(strict_types=1);

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ChatMessageEvent implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public readonly string $channelName,
        public readonly string $fromUserId,
        public readonly string $fromName,
        public readonly string $message,
        public readonly string $sentAt,
    ) {}

    public function broadcastOn(): array
    {
        return [new PresenceChannel("live.{$this->channelName}")];
    }

    public function broadcastAs(): string
    {
        return 'chat-message';
    }

    public function broadcastWith(): array
    {
        return [
            'from_user_id' => $this->fromUserId,
            'from_name'    => $this->fromName,
            'message'      => $this->message,
            'sent_at'      => $this->sentAt,
        ];
    }
}
