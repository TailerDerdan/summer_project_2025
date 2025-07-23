<?php
declare (strict_types= 1);

namespace App\Security;


use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Http\Authenticator\AbstractLoginFormAuthenticator;
use Symfony\Component\Security\Http\Authenticator\Passport\Badge\UserBadge;
use Symfony\Component\Security\Http\Authenticator\Passport\Credentials\PasswordCredentials;
use Symfony\Component\Security\Http\Authenticator\Passport\Passport;

class UserAuthenticator extends AbstractLoginFormAuthenticator {
    public function __construct(private UrlGeneratorInterface $urlGenerator) {
    }
    public function authenticate(Request $request): Passport {
        $nickName = $request->request->get("nickName");
        $password = $request->request->get("password");
        return new Passport(
            new UserBadge($nickName),
            new PasswordCredentials($password),
        );
    }

    public function onAuthenticationSuccess(
        Request $request, 
        TokenInterface $token, 
        string $firewallName
    ): ?Response {
        return new RedirectResponse($this->urlGenerator->generate("main_page"));
    }

    public function getLoginUrl(Request $request): string {
        return $this->urlGenerator->generate("login");
    }
}