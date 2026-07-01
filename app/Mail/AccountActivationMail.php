<?php

namespace App\Mail;

use App\Models\AccountActivation;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AccountActivationMail extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * Create a new message instance.
     */
    public function __construct(
        public readonly User $user,
        public readonly AccountActivation $activation,
    ) {}

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Activa tu cuenta — Sistema PPP UNJFSC',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        // Nombre completo desde la relación Person; fallback al campo name del usuario
        $person   = $this->user->person;
        $fullName = $person
            ? trim($person->names . ' ' . $person->surnames)
            : $this->user->name;

        return new Content(
            view: 'emails.account-activation',
            with: [
                'userName'      => $fullName,
                'activationUrl' => route('activate.show', ['token' => $this->activation->token]),
                'expiresAt'     => $this->activation->expires_at->format('d/m/Y H:i'),
            ],
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
