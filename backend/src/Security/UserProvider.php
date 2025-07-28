<?php
declare (strict_types= 1);

namespace App\Security;


use App\Infrastructure\User\UserRepositoryInterface;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Security\Core\User\UserProviderInterface;


class UserProvider implements UserProviderInterface {
    public function __construct(
        private UserRepositoryInterface $userRepository,
    ) {}
    function loadUserByIdentifier(string $identifier): UserInterface {
        $user = $this->userRepository->get($identifier);
        if ($user === null) {
            throw new \RuntimeException("User not found");
        }
        return new SecurityUser(
            $user->getUserId(),
            $user->getNickName(),
            $user->getPassword(),
            $user->getIsReady(),
            $user->getRoles(),
            $user->getRoomId(),
            $user->getAvatarPath(),
            $user->getCountGames(),
            $user->getCountWins(),
            $user->getCountKills(),
            $user->getCountDeaths(),
        );
    }
    public function refreshUser(UserInterface $user): UserInterface {
        if (!$user instanceof SecurityUser) {
            throw new \RuntimeException("Invalid user class");
        }
        $freshUser = $this->userRepository->getById($user->getUserId());
        return new SecurityUser(
            $freshUser->getUserId(),
            $freshUser->getNickName(),
            $freshUser->getPassword(),
            $freshUser->getIsReady(),
            $freshUser->getRoles(),
            $freshUser->getRoomId(),
            $freshUser->getAvatarPath(),
            $freshUser->getCountGames(),
            $freshUser->getCountWins(),
            $freshUser->getCountKills(),
            $freshUser->getCountDeaths(),
        );
    }
    public function supportsClass(string $class): bool {
        return $class === SecurityUser::class;
    }
}
