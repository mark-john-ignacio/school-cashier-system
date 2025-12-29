<?php

namespace App\Enums;

enum PaymentMethod: string
{
    case Cash = 'cash';
    case Check = 'check';
    case Online = 'online';

    public function label(): string
    {
        return match ($this) {
            self::Cash => 'Cash',
            self::Check => 'Check',
            self::Online => 'Online',
        };
    }

    public function icon(): string
    {
        return match ($this) {
            self::Cash => 'Banknote',
            self::Check => 'Scroll',
            self::Online => 'CreditCard',
        };
    }
}
