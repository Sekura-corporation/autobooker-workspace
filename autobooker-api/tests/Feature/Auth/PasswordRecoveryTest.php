<?php

namespace Tests\Feature\Auth;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use App\Models\User;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use App\Mail\PasswordRecoveryMail;

class PasswordRecoveryTest extends TestCase
{
    use RefreshDatabase;

    public function test_forgot_password_fails_for_invalid_email()
    {
        $response = $this->postJson('/api/auth/forgot-password', [
            'email' => 'naoexiste@email.com'
        ]);

        // Verifica se a API barrou o email que não existe com erro de validação (422)
        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['email']);
    }

    public function test_forgot_password_sends_email_and_saves_token()
    {
        // Falsificamos o Mail para não enviar email de verdade durante o test
        Mail::fake();

        $user = User::factory()->create(['email' => 'teste@email.com']);

        $response = $this->postJson('/api/auth/forgot-password', [
            'email' => $user->email
        ]);

        // Valida que o processamento ocorreu com sucesso
        $response->assertStatus(200);

        // Verifica se o Laravel gerou e enfileirou o email de recuperação
        Mail::assertSent(PasswordRecoveryMail::class, function ($mail) use ($user) {
            return $mail->hasTo($user->email);
        });

        // Verifica se no banco de dados tem o token
        $this->assertDatabaseHas('password_reset_tokens', [
            'email' => $user->email,
        ]);
    }

    public function test_reset_password_success()
    {
        $user = User::factory()->create(['email' => 'reset@email.com']);
        $code = '123456';

        // Gravamos direto no banco um código artificial
        DB::table('password_reset_tokens')->insert([
            'email' => $user->email,
            'token' => $code,
            'created_at' => now(),
        ]);

        $response = $this->postJson('/api/auth/reset-password', [
            'email' => $user->email,
            'code' => $code,
            'password' => 'novasenha123',
            'password_confirmation' => 'novasenha123',
        ]);

        $response->assertStatus(200);

        // Token tem que sumir após o uso correto
        $this->assertDatabaseMissing('password_reset_tokens', [
            'email' => $user->email,
        ]);

        // Verifica se a senha gravada no banco agora bate com "novasenha123"
        $this->assertTrue(Hash::check('novasenha123', $user->fresh()->password));
    }
}
