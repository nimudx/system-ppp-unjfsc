<?php

namespace App\Domains\Company\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class CompanyStudentInvitation extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public $tries = 3;

    public $backoff = [60, 300];

    public function __construct(public array $details)
    {
        $this->afterCommit();
    }

    public function build(): static
    {
        return $this->subject('UNJFSC: invitación y confirmación de practicante')->view('mail.company-student-invitation');
    }
}
