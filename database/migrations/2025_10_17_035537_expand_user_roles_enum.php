<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Expand the allowed values in the role check constraint.
     */
    public function up(): void
    {
        if (! $this->usersRoleColumnExists()) {
            return;
        }

        $allowedRoles = ['admin', 'cashier', 'manager', 'accountant'];

        $this->dropExistingCheckConstraint();
        $this->coerceInvalidRoles($allowedRoles, 'cashier');
        $this->addCheckConstraint($allowedRoles);
    }

    /**
     * Roll back to the previous pair of allowed roles.
     */
    public function down(): void
    {
        if (! $this->usersRoleColumnExists()) {
            return;
        }

        $allowedRoles = ['admin', 'cashier'];

        $this->dropExistingCheckConstraint();
        $this->coerceInvalidRoles($allowedRoles, 'cashier');
        $this->addCheckConstraint($allowedRoles);
    }

    private function dropExistingCheckConstraint(): void
    {
        DB::statement('ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check');
    }

    private function coerceInvalidRoles(array $allowedRoles, string $fallback): void
    {
        DB::statement(
            sprintf(
                'UPDATE users SET role = %s WHERE role IS NOT NULL AND role NOT IN (%s)',
                $this->quoteValue($fallback),
                $this->quoteList($allowedRoles)
            )
        );
    }

    private function addCheckConstraint(array $allowedRoles): void
    {
        DB::statement(
            sprintf(
                'ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN (%s))',
                $this->quoteList($allowedRoles)
            )
        );
    }

    private function usersRoleColumnExists(): bool
    {
        return Schema::hasTable('users') && Schema::hasColumn('users', 'role');
    }

    private function quoteList(array $values): string
    {
        return implode(', ', array_map(fn (string $value) => $this->quoteValue($value), $values));
    }

    private function quoteValue(string $value): string
    {
        return "'" . str_replace("'", "''", $value) . "'";
    }
};