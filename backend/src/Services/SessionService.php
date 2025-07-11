<?php
declare (strict_types= 1);

namespace App\Services;

use Symfony\Component\HttpFoundation\Session\SessionInterface;

class SessionService {
     private SessionInterface $session;

    public function __construct(SessionInterface $session) 
    {
        $this->session = $session;
    }

    public function login(int $id, string $nickName): void {
        $this->session->set('user', [
            'id' => $id,
            'nickName' => $nickName,
        ]);
    }
    public function logout(): void {
        $this->session->remove('user');
    }
    public function isLogin(int $id): bool {
        return $this->session->has('user') && $this->session->get('user')['id'] === $id;
    }
    public function get(): ?int {
        return $this->session->get('user')['id'] ?? null;
    }
}